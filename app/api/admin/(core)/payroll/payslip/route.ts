import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";
import { toGMT8 } from "@/lib/utils/toGMT8";
import {
  BaseValueProp,
  calculateAllPayheads,
  VariableAmountProp,
  VariableFormulaProp,
} from "@/helper/payroll/calculations";
import { isAffected } from "@/components/admin/payroll/payslip/util";
import { tryParse } from "@/helper/objects/jsonParserType";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateID = Number(searchParams.get("date"));
  try {
    // If dateID is undefined/null return 404
    if (!dateID) return NextResponse.json({ status: 404 });

    // Get the date-process information
    // Helps to determine if payroll-process is completed if the...
    // ...date-process is marked completed (is_processed)
    const dateInfo = await prisma.trans_payroll_date.findFirst({
      where: {
        id: dateID,
      },
    });

    // If date-process (refers to state of the payroll process) is completed,
    // fetch all employees regardless of deleted or not.
    // Else if process not completed yet... fetch only the employees
    // who aren't deleted.
    const dataEmp = await prisma.trans_employees.findMany({
      where: {
        ...(!dateInfo?.is_processed ? { deleted_at: null } : undefined),
      },
      select: {
        ...emp_rev_include.employee_detail.select, // Fetch employee's generic info
        deleted_at: true,
        dim_payhead_affecteds: {
          select: {
            payhead_id: true,
          },
        },
      },
    });

    // If process not completed, initialize payroll for undeleted employee
    if (!dateInfo?.is_processed) {
      await prisma.trans_payrolls.createMany({
        data: dataEmp.map((emp) => {
          return {
            employee_id: emp.id,
            date_id: dateID,
            created_at: toGMT8().toISOString(),
            updated_at: toGMT8().toISOString(),
          };
        }),
        skipDuplicates: true, // Skip if employee has payroll initialized
      });
      // CLEAN UP ACT
      // Remove breakdowns for deleted employee and unwritable payheads
      // By deleting unwritable payheads, fetch newer amounts later on
      await prisma.trans_payhead_breakdowns.deleteMany({
        where: {
          OR: [
            {
              trans_payrolls: {
                trans_employees: {
                  deleted_at: { not: null }, // If employee has deleted date, they are deleted
                },
                date_id: dateInfo?.id,
              },
            },
            {
              ref_payheads: {
                is_overwritable: false, // Delete unwritable payheads
              },
              trans_payrolls: {
                date_id: dateInfo?.id,
              },
            },
          ],
        },
      });
      // After deleting child items of a table
      // We can safely delete parent items of the table
      // Proceed to remove payroll for deleted employees
      await prisma.trans_payrolls.deleteMany({
        where: {
          trans_employees: {
            deleted_at: { not: null },
          },
          date_id: dateInfo?.id,
        },
      });
    }

    // After clean-up and initialized, we can safely assume that
    // payrolls to be fetch (affiliated with the date-process) is
    // either new records (if uncompleted process) excluding deleted employees
    // or old records included deleted employee but involved in that process
    const payrolls = await prisma.trans_payrolls.findMany({
      where: { date_id: dateID },
    });
    // Get employees involved in the fetched payroll data
    const employees = dataEmp.filter((emp) =>
      payrolls.map((pr) => pr.employee_id).includes(emp.id)
    );
    const dataPH = await prisma.ref_payheads.findMany({
      where: {
        ...(!dateInfo?.is_processed
          ? { deleted_at: null, is_active: true }
          : undefined),
      },
    });

    let calculatedAmountList: Record<number, VariableAmountProp[]> = {};
    if (!dateInfo?.is_processed) {
      employees.forEach((emp) => {
        const baseVariables: BaseValueProp = {
          rate_p_hr: parseFloat(String(emp.ref_job_classes?.pay_rate)) || 0.0,
          // Supposedly, fetch total shifts in attendances
          total_shft_hr: 80, // Example: for 80hrs within 14days of shift;
          payroll_days: toGMT8(dateInfo?.end_date!).diff(toGMT8(dateInfo?.start_date!),'day'),
        };
        const uncalculatedAmount: VariableFormulaProp[] = dataPH
          .filter((ph) => String(ph.calculation) != "")
          .filter((ph) => isAffected(tryParse(emp), tryParse(ph)))
          .map((ph) => ({
            id: ph.id,
            variable: String(ph.variable),
            formula: String(ph.calculation),
          }));

        const calculatedAmount = calculateAllPayheads(
          baseVariables,
          uncalculatedAmount
        ).filter((ca) => ca.id);
        calculatedAmountList = {
          ...calculatedAmountList,
          [emp.id]: calculatedAmount,
        };
      });

      //
      const newBreakdowns =
        await prisma.trans_payhead_breakdowns.createManyAndReturn({
          data: Object.entries(calculatedAmountList).flatMap(
            ([empId, payheads]) => {
              return payheads.map((payhead) => {
                return {
                  payhead_id: payhead.id,
                  payroll_id: payrolls.find(
                    (pr) => pr.employee_id === Number(empId)
                  )?.id,
                  amount: payhead.amount!,
                  created_at: toGMT8().toISOString(),
                  updated_at: toGMT8().toISOString(),
                };
              });
            }
          ),
          skipDuplicates: true,
        });
      // console.log(newBreakdowns);
    }

    // Get breakdowns (amounts) affiliated with the fetched payroll data
    const breakdowns = await prisma.trans_payhead_breakdowns.findMany({
      where: {
        payroll_id: {
          in: payrolls.map((pr) => pr.id),
        },
      },
    });
    const payheads = dataPH.filter(
      (dph) =>
        dateInfo?.is_processed
          ? breakdowns.map((bd) => bd.payhead_id!).includes(dph.id)
          : // If process completed, fetch only the payheads
            // that are affiliated in the breakdown amounts,
            // which are also affiliated with the fetched payroll

            true // Else if not completed, fetch only undeleted and active payheads
    );
    // Separate payheads to earnings and deductions data in respect to their types
    const earnings = payheads.filter((p) => p.type === "earning");
    const deductions = payheads.filter((p) => p.type === "deduction");
    return NextResponse.json(
      {
        payrolls,
        breakdowns,
        employees,
        earnings,
        deductions,
        calculatedAmountList,
      },
      { status: 200 }
    );
    // return NextResponse.json(payheads);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

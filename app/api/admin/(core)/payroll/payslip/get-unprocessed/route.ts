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
    // Helps to more info about the payroll-process information
    const dateInfo = await prisma.trans_payroll_date.findFirst({
      where: {
        id: dateID,
      },
    });

    // Fetch only the employees who aren't deleted.
    const empData = await prisma.trans_employees.findMany({
      where: {
         deleted_at: null,
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

    // Initialize payroll for all employees
    await prisma.trans_payrolls.createMany({
      data: empData.map((emp) => {
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
              date_id: dateInfo?.id,
              trans_employees: {
                deleted_at: { not: null }, // If employee has deleted date, they are deleted
              },
            },
          },
          {
            ref_payheads: {
              is_overwritable: false, // Delete unwritable payheads
            },
            trans_payrolls: {
              date_id: dateInfo?.id,  // Ensure we are deleting associated with the payroll
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
        date_id: dateInfo?.id,
        trans_employees: {
          deleted_at: { not: null },
        },
      },
    });
  

    // After clean-up and initialized, we can safely assume that
    // payrolls to be fetched is a new records (uncompleted process)
    // without deleted employees
    const payrolls = await prisma.trans_payrolls.findMany({
      where: { date_id: dateID },
    });
    // Get employees associated with the payroll
    const employees = empData.filter((emp) =>
      payrolls.map((pr) => pr.employee_id).includes(emp.id)
    );
    // Get all undeleted payheads
    const dataPH = await prisma.ref_payheads.findMany({
      where: { 
        deleted_at: null,
        is_active: true,
      },
    });

    let calculatedAmountList: Record<number, VariableAmountProp[]> = {};
    // Initialize amounts for each payheads with formulas for each employees
    employees.forEach((emp) => {

      // Fetch rendered work data to be applied for calculation
      const baseVariables: BaseValueProp = {
        rate_p_hr: parseFloat(String(emp.ref_job_classes?.pay_rate)) || 0.0,
        // Supposedly, fetch total shifts in attendances
        total_shft_hr: 80, // Example: for 80hrs within 14days of shift;
        payroll_days: toGMT8(dateInfo?.end_date!).diff(toGMT8(dateInfo?.start_date!),'day'),
      };

      // Spread each payhead's data to be applied for calculation
      const uncalculatedAmount: VariableFormulaProp[] = dataPH
        .filter((ph) => String(ph.calculation) != "")
        .filter((ph) => isAffected(tryParse(emp), tryParse(ph)))
        .map((ph) => ({
          id: ph.id,
          variable: String(ph.variable),
          formula: String(ph.calculation),
        }));

      // Perform calculations and return all amounts for each formulated payheads
      const calculatedAmount = calculateAllPayheads(
        baseVariables,
        uncalculatedAmount
      ).filter((ca) => ca.id);

      // Push the amounts data in the array associated with 
      // the owner's id
      calculatedAmountList = {
        ...calculatedAmountList,
        [emp.id]: calculatedAmount,
      };

    });

    await prisma.trans_payhead_breakdowns.createMany({
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

    // Get breakdowns (amounts) affiliated with the fetched payroll data
    const breakdowns = await prisma.trans_payhead_breakdowns.findMany({
      where: {
        payroll_id: {
          in: payrolls.map((pr) => pr.id),
        },
      },
    });
    const payheads = dataPH.filter((dph) =>breakdowns.map((bd) => bd.payhead_id!).includes(dph.id));
    
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

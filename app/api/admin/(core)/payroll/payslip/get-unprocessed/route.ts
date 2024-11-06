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
    // Validate the provided `dateID`. If undefined, return a 404 response.
    if (!dateID) return NextResponse.json({ status: 404 });

    // Fetch `dateInfo`, `empData` (active employees), and `dataPH` (payheads) concurrently.
    // This reduces time by running these independent queries in parallel.
    const [dateInfo, empData, dataPH] = await Promise.all([
      prisma.trans_payroll_date.findFirst({ where: { id: dateID } }),
      prisma.trans_employees.findMany({
        where: { deleted_at: null }, // Fetch only employees who haven't been deleted
        select: {
          ...emp_rev_include.employee_detail.select, // Employee general information
          deleted_at: true,
          dim_payhead_affecteds: { select: { payhead_id: true } },
        },
      }),
      prisma.ref_payheads.findMany({ where: { deleted_at: null, is_active: true } }),
    ]); // Fetch undeleted and active payheads.

    // Initialize payroll entries and clean up outdated data
    await Promise.all([
      prisma.trans_payrolls.createMany({
        data: empData.map((emp) => ({
          employee_id: emp.id,
          date_id: dateID,
          created_at: toGMT8().toISOString(),
          updated_at: toGMT8().toISOString(),
        })),
        skipDuplicates: true,
        // Uses `skipDuplicates` to prevent reinitialization if a record already exists
      }),

      // Clean up old or invalid payroll records.
      prisma.trans_payhead_breakdowns.deleteMany({
        where: {
          OR: [
            {
              trans_payrolls: {
                date_id: dateInfo?.id,
                trans_employees: { deleted_at: { not: null } },
              },  // Deleted employees' breakdowns
            },
            {
              ref_payheads: { is_overwritable: false },
              trans_payrolls: { date_id: dateInfo?.id },
            },
            {
              ref_payheads: { deleted_at: { not: null } },
              trans_payrolls: { date_id: dateInfo?.id },
            },
          ],
        },
      }),

      // Remove payroll entries associated with deleted employees.
      prisma.trans_payrolls.deleteMany({
        where: { date_id: dateInfo?.id, trans_employees: { deleted_at: { not: null } } },
      }),
    ]);

    // Fetch payroll records after initialization
    const payrolls = await prisma.trans_payrolls.findMany({ where: { date_id: dateID } });
    const payrollsMap = new Map(payrolls.map((pr) => [pr.employee_id, pr.id]));
    // Reduces time finding payrollID
    // Maps as { employee_id : payroll_id }

    // Filter employees to include only those associated with active payrolls.
    const employees = empData.filter((emp) => payrollsMap.has(emp.id));

    // Calculate amounts and generate breakdowns in chunks
    // Initializes `calculatedAmountList` to store payhead amounts for each employee.
    let calculatedAmountList: Record<number, VariableAmountProp[]> = {};

    employees.forEach((emp) => {
      // Define base variables for payroll calculations.
      const baseVariables: BaseValueProp = {
        rate_p_hr: parseFloat(String(emp.ref_job_classes?.pay_rate)) || 0.0,
        total_shft_hr: 80,
        payroll_days: toGMT8(dateInfo?.end_date!).diff(toGMT8(dateInfo?.start_date!), 'day'),
      };

      // Filter applicable payheads for calculation based on employee and payhead data.
      const applicableFormulatedPayheads: VariableFormulaProp[] = dataPH
        .filter((ph) => String(ph.calculation) !== "")
        .filter((ph) => isAffected(tryParse(emp), tryParse(ph)))
        .map((ph) => ({ id: ph.id, variable: String(ph.variable), formula: String(ph.calculation) }));

      // Calculate amounts and update `calculatedAmountList` with results for each employee.
      const calculatedAmount = calculateAllPayheads(baseVariables, applicableFormulatedPayheads).filter((ca) => ca.id);
      calculatedAmountList[emp.id] = calculatedAmount;
    });

    // Insert calculated breakdowns into `trans_payhead_breakdowns` table.
    await prisma.trans_payhead_breakdowns.createMany({
      data: Object.entries(calculatedAmountList).flatMap(([empId, payheads]) => {
        const payrollId = payrollsMap.get(Number(empId));
        return payheads.map((payhead) => ({
          payhead_id: payhead.id,
          payroll_id: payrollId,
          amount: payhead.amount!,
          created_at: toGMT8().toISOString(),
          updated_at: toGMT8().toISOString(),
        }));
      }),
      skipDuplicates: true,
    });

    // Fetch breakdowns and organize payheads into earnings and deductions
    const breakdowns = await prisma.trans_payhead_breakdowns.findMany({
      where: { payroll_id: { in: Array.from(payrollsMap.values()) } },
    });
    const breakdownPayheadIds = new Set(breakdowns.map((bd) => bd.payhead_id!));
    const payheads = dataPH.filter((dph) => breakdownPayheadIds.has(dph.id));
    const earnings = payheads.filter((p) => p.type === "earning");
    const deductions = payheads.filter((p) => p.type === "deduction");

    // Return the organized payroll data as a JSON response.
    return NextResponse.json(
      { payrolls, breakdowns, employees, earnings, deductions, calculatedAmountList },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error || "An error occurred" }, { status: 500 });
  }
}

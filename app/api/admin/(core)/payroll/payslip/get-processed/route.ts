import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";
import {PayrollDeductionReport, PayrollEarningsReport} from "@/types/report/payroll/payroll";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateID = Number(searchParams.get("date"));

  try {
    if (!dateID) return NextResponse.json({ status: 404 });

    // Fetch dateInfo, payrolls, and breakdowns concurrently
    const [dateInfo, payrolls] = await Promise.all([
      prisma.trans_payroll_date.findFirst({ where: { id: dateID } }),
      prisma.trans_payrolls.findMany({ where: { date_id: dateID } }),
    ]);

    // Return blank data if no payroll records found or dateID is deleted
    if (dateInfo?.deleted_at || payrolls.length===0) {
      return NextResponse.json({
        payrolls: [],
        breakdowns: [],
        employees: [],
        earnings: [],
        deductions: [],
      });
    }

    const payrollMap = new Map(payrolls.map((pr) => [pr.employee_id, pr.id]))
    const breakdowns = await prisma.trans_payhead_breakdowns.findMany({
      where: { payroll_id: { in: Array.from(payrollMap.values()) } },
    });

    // Fetch all employees linked to payrolls
    const payheadIDs = Array.from(new Set(breakdowns.map((bd) => bd.payhead_id!)));
    const employeeIDs = Array.from(payrollMap.keys());
    
    const [payheads, employees] = await Promise.all([
      prisma.ref_payheads.findMany({
        where: { id: { in: payheadIDs } },
        orderBy: { created_at: "asc" },
      }),
      prisma.trans_employees.findMany({
        where: { id: { in: employeeIDs } },
        select: {
          ...emp_rev_include.employee_detail.select,
        },
      }),
    ])

    const earnings = payheads.filter((p) => p.type === "earning")

    const deductions = payheads.filter((p) => p.type === "deduction")

    return NextResponse.json(
      {
        payrolls,
        breakdowns,
        employees,
        earnings,
        deductions,
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

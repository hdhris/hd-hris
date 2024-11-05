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
    
    const payrolls = await prisma.trans_payrolls.findMany({
      where: { date_id: dateInfo?.id },
    });
    // Get employees involved in the fetched payroll data
    const employees = await prisma.trans_employees.findMany({
      where: {
        id: {
          in: payrolls.map((pr) => pr.employee_id),
        }
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
    })
    // Get breakdowns (amounts) associated with the fetched payroll data
    const breakdowns = await prisma.trans_payhead_breakdowns.findMany({
      where: {
        payroll_id: {
          in: payrolls.map((pr) => pr.id),
        },
      },
    });

    const payheads = await prisma.ref_payheads.findMany({
      where: {
        id: {
          in: breakdowns.map((bd) => bd.payhead_id!),
        }
      }
    });
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
      },
      { status: 200 }
    );
    // return NextResponse.json(payheads);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

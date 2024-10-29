import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  try {
    const payrolls = await prisma.trans_payrolls.findMany({
      where: {
        deleted_at: null,
        date_id: Number(date),
      },
    });
    const employees = await prisma.trans_employees.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        ...emp_rev_include.employee_detail.select,
        dim_payhead_affecteds: {
          select: {
            payhead_id: true,
          },
        },
      },
    //   take: 3
    });
    const payheads = await prisma.ref_payheads.findMany({
      where: {
        deleted_at: null,
      },
    });
    const earnings = payheads.filter(p=>p.type==="earning");
    const deductions = payheads.filter(p=>p.type==="deduction");
    return NextResponse.json({ payrolls, employees, earnings, deductions }, { status: 200 });
    // return NextResponse.json(payheads);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";
import { toGMT8 } from "@/lib/utils/toGMT8";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateID = Number(searchParams.get("date"));
  try {
    if(!dateID) return NextResponse.json({status: 404});
    const dateInfo = await prisma.trans_payroll_date.findFirst({
      where: {
        id: dateID,
      },
    });
    const dataEmp = await prisma.trans_employees.findMany({
      where: {
        ...(!dateInfo?.is_processed ? { deleted_at: null } : undefined),
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
    // Create payrolls if not exists
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
        skipDuplicates: true,
      });
    }
    const payrolls = await prisma.trans_payrolls.findMany({
      where: {
        date_id: dateID,
      },
    });
    const employees = dataEmp.filter(emp=>(
      payrolls.map(pr=>pr.employee_id).includes(emp.id)
    ));
    const breakdowns = await prisma.trans_payhead_breakdowns.findMany({
      where: {
        payroll_id: {
          in: payrolls.map((pr) => pr.id),
        },
      },
    });
    const payheads = await prisma.ref_payheads.findMany({
      where: {
        ...(!dateInfo?.is_processed ? { deleted_at: null } : undefined),
      },
    });
    const earnings = payheads.filter((p) => p.type === "earning");
    const deductions = payheads.filter((p) => p.type === "deduction");
    return NextResponse.json(
      { payrolls, breakdowns, employees, earnings, deductions },
      { status: 200 }
    );
    // return NextResponse.json(payheads);
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    );
  }
}

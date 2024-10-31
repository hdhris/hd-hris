import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";
import { toGMT8 } from "@/lib/utils/toGMT8";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  try {
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

    // Create payrolls if not exists
    await prisma.trans_payrolls.createMany({
      data: employees.map(emp=>{
        return {
          employee_id: emp.id,
          date_id: Number(date),
          created_at: toGMT8().toISOString(),
          updated_at: toGMT8().toISOString(),
        }
      }),
      skipDuplicates: true,
    })
    const payrolls = await prisma.trans_payrolls.findMany({
      where: {
        deleted_at: null,
        date_id: Number(date),
      },
    });
    const breakdowns = await prisma.trans_payhead_breakdowns.findMany({
      where: {
        id: {
          in: payrolls.map(pr=>(pr.id)),
        }
      }
    })
    const payheads = await prisma.ref_payheads.findMany({
      where: {
        deleted_at: null,
      },
    });
    const earnings = payheads.filter(p=>p.type==="earning");
    const deductions = payheads.filter(p=>p.type==="deduction");
    return NextResponse.json({ payrolls, breakdowns, employees, earnings, deductions }, { status: 200 });
    // return NextResponse.json(payheads);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

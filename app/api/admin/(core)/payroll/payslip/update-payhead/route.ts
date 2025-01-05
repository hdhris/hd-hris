// /pages/api/batch-schedule.ts
import { toGMT8 } from "@/lib/utils/toGMT8";
import prisma from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body);
    const { payroll_id, payhead_id, amount, gross, deduction } = body;
    // throw new Error("Test");
    await Promise.all([
      prisma.trans_payhead_breakdowns.upsert({
        where: {
          payhead_id_payroll_id : {
            payroll_id: payroll_id,
            payhead_id: payhead_id,
          }
        },
        create: {
          payroll_id: payroll_id,
          payhead_id: payhead_id,
          amount: amount,
          created_at: toGMT8().toISOString(),
          updated_at: toGMT8().toISOString(),
        },
        update: {
          amount: amount,
          updated_at: toGMT8().toISOString(),
        }
      }),

      prisma.trans_payrolls.update({
        where: {
          id: payroll_id,
        },
        data: {
          gross_total_amount: gross,
          deduction_total_amount: deduction,
        }
      })
    ])
    //(employeeId: number, payheadId: number, value: number)
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
  }
}

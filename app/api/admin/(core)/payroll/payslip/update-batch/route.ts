// /pages/api/batch-schedule.ts
import { toGMT8 } from "@/lib/utils/toGMT8";
import prisma from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

interface breaksdowns {
  payroll_id: number;
  payhead_id: number;
  amount: number;
  created_at: string;
  updated_at: string;
}
export async function POST(req: NextRequest) {
  try {
    const batch: breaksdowns[] = await req.json();
    if (batch && batch.length) {
      const deleteAmounts = prisma.trans_payhead_breakdowns.deleteMany({
        where: {
          payroll_id : {
            in : batch.map(b=> b.payroll_id),
          }
        },
      });
      const recreateAmounts = prisma.trans_payhead_breakdowns.createMany({
        data: batch,
        skipDuplicates: true,
      });
      await prisma.$transaction([deleteAmounts, recreateAmounts]);
      console.log('Recreated: ',recreateAmounts)
    }
    //(employeeId: number, payheadId: number, value: number)
    // console.log(batch);
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.log(error);
  }
}

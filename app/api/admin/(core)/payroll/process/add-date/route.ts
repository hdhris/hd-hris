import { NextRequest, NextResponse } from "next/server";
import { toGMT8 } from "@/lib/utils/toGMT8";
import prisma from "@/prisma/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { start_date, end_date }  = body;

    // console.log(body);

    await prisma.trans_payroll_date.create({
      data: {
        start_date: start_date,
        end_date: end_date,
        is_processed: false,
        created_at: toGMT8().toISOString(),
        updated_at: toGMT8().toISOString(),
      },
    });
    // console.log("Created: ",payroll_date);
    // console.log(name, clock_in, clock_out, is_active, break_min)

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
  }
}

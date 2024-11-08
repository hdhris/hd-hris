import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id }  = body;

    // console.log(body);

    await prisma.trans_payroll_date.update({
      where : {
        id: id,
      },
      data : {
        is_processed: true,
        updated_at: toGMT8().toISOString(),
      }
    });
    // console.log("Deleted: ",updated);
    // console.log(name, clock_in, clock_out, is_active, break_min)

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
  }
}

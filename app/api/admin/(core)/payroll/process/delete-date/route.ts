import { NextRequest, NextResponse } from "next/server";
import { toGMT8 } from "@/lib/utils/toGMT8";
import prisma from "@/prisma/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id }  = body;
    
    await prisma.trans_payroll_date.update({
      where : {
        id: id,
      },
      data : {
        deleted_at: toGMT8().toISOString(),
      }
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
  }
}

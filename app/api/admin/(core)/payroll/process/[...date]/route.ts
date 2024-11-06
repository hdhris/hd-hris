import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export const dynamic = "force-dynamic";
export async function GET(
  req: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    // console.log("Params: ",params)
    const date = {
      start: params.date[0].split(",")[0],
      end: params.date[0].split(",")[1],
    };
    console.log("Date: ",date)
    const payroll = await prisma.trans_payroll_date.findMany({
      where: {
        deleted_at: null,
        start_date: {
          gte: toGMT8(date.start).toDate(),
          lte: toGMT8(date.end).toDate(),
        },
      },
    });
    return NextResponse.json(payroll);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

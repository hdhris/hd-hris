import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { start } from "repl";

export const dynamic = "force-dynamic";
export async function GET(
  req: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const date = {
      start: params.date.split(",")[0],
      end: params.date.split(",")[1],
    };
    const payroll = await prisma.trans_payroll_date.findMany({
      where: {
        deleted_at: null,
        start_date: {
          gte: date.start,
          lt: date.end,
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

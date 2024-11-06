import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateID = Number(searchParams.get("date"));
  try {
    // If dateID is undefined/null return 404
    if (!dateID) return NextResponse.json({ status: 404 });

    const dateInfo = await prisma.trans_payroll_date.findFirst({
      where: {
        id: dateID,
      },
    });

    await prisma.trans_payhead_breakdowns.deleteMany({
      where: {
        ref_payheads: {
          is_overwritable: false, // Delete unwritable payheads
        },
        trans_payrolls: {
          date_id: dateInfo?.id,
        },
      },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

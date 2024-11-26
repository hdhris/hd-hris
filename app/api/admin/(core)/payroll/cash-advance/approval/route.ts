import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
  const data = await req.json();
  console.log(data);
  try {
    await prisma.trans_cash_advances.update({
      where: { id: data.id },
      data: {
        updated_at: toGMT8().toISOString(),
        approval_at: toGMT8().toISOString(),
        status: data.status,
        approval_by: data.approval_by,
      }
    })
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error: ", error);
    return NextResponse.json(
      { error: "Failed to post data" },
      { status: 500 }
    );
  }
}

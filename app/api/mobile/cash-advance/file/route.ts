import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
  const data = await req.json();
//   console.log(data);
  try {
    await prisma.trans_cash_advances.create({
      data: {
        created_at: toGMT8().toISOString(),
        updated_at: toGMT8().toISOString(),
        status: "pending",
        ...data,
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

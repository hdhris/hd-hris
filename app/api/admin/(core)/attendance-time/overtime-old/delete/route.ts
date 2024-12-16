import { toGMT8 } from "@/lib/utils/toGMT8";
import prisma from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.trans_overtimes.update({
      where: {
        id: id,
      },
      data: {
        deleted_at: toGMT8(new Date()).toISOString(),
      },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    return NextResponse.json(
      { error: "Failed to post data: " + error },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { OvertimeEntry } from "@/types/attendance-time/OvertimeType";

export async function POST(req: NextRequest) {
  const data = await req.json();
  try {
    console.log(data);

    const updated = await prisma.trans_overtimes.update({
      where: {
        id : data.id,
      },
      data : {
        ...data,
      },
    })
    console.log("Updated: ",updated)
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    return NextResponse.json(
      { error: "Failed to post data: " + error },
      { status: 500 }
    );
  }
}

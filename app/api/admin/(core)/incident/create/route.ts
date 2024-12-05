import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    // console.log(body);
    await prisma.dim_incident_reports.create({
        data: {
          created_at: toGMT8().toISOString(),
          updated_at: toGMT8().toISOString(),
          ...body,
        },
    })
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    return NextResponse.json(
      { error: "Failed to post data: " + error },
      { status: 500 }
    );
  }
}

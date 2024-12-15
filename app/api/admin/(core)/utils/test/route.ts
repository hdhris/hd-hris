import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { Prisma } from "@prisma/client";


export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.ref_job_classes.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        name: true,
        id: true,
      }
    })
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

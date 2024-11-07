import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const batchSchedules = await prisma.ref_batch_schedules.findMany({
      where: {
        is_active: true,
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        clock_in: true,
        clock_out: true,
      },
    });//
//
    return NextResponse.json(batchSchedules);
  } catch (error) {
    console.error("Error fetching batch schedules:", error);
    return NextResponse.json({ error: "Failed to fetch batch schedules" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    const schedule = await prisma.dim_training_schedules.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 });
  }
}
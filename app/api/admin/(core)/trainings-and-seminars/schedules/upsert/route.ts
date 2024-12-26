import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();

    const schedule = await prisma.dim_training_schedules.upsert({
      where: {
        id: data.id || -1,
      },
      create: {
        program_id: data.program_id,
        location: data.location,
        session_timestamp: new Date(data.session_timestamp),
        hour_duration: data.hour_duration,
        created_at: toGMT8().toDate(),
        updated_at: toGMT8().toDate(),
      },
      update: {
        program_id: data.program_id,
        location: data.location,
        session_timestamp: new Date(data.session_timestamp),
        hour_duration: data.hour_duration,
        updated_at: toGMT8().toDate(),
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save schedule" }, { status: 500 });
  }
}
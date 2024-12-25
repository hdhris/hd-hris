import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();

    const record = await prisma.fact_training_records.upsert({
      where: {
        id: data.id || -1,
      },
      create: {
        schedule_id: data.schedule_id,
        participant_id: data.participant_id,
        rating: data.rating,
        feedback: data.feedback,
        suggestion: data.suggestion,
        created_at: toGMT8().toDate(),
        updated_at: toGMT8().toDate(),
      },
      update: {
        rating: data.rating,
        feedback: data.feedback,
        suggestion: data.suggestion,
        updated_at: toGMT8().toDate(),
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save record" }, { status: 500 });
  }
}
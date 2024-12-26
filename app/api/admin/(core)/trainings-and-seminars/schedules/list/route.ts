import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const schedules = await prisma.dim_training_schedules.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        ref_training_programs: {
          select: {
            name: true,
            type: true,
            instructor_name: true,
          },
        },
      },
      orderBy: {
        session_timestamp: 'asc',
      },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}
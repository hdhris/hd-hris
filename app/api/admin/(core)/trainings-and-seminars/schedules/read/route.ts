import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const schedules = await prisma.dim_training_schedules.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        ref_training_programs: true,
      },
    });

    const participants = await prisma.dim_training_participants.findMany({
      where: {
        terminated_at: null,
      },
      include: {
        trans_employees: {
          include: {
            ref_departments: true,
          },
        },
      },
    });

    return NextResponse.json({ schedules, participants });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch schedules and participants" }, { status: 500 });
  }
}

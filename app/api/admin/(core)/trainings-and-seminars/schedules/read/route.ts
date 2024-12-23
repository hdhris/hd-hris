import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") ? Number(searchParams.get("id")) : null;

    const programs = await prisma.ref_training_programs.findMany({
      where: {
        deleted_at: null,
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    if (id) {
      const schedule = await prisma.dim_training_schedules.findUnique({
        where: { id },
      });

      return NextResponse.json({ schedule, programs });
    }

    return NextResponse.json({ programs });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

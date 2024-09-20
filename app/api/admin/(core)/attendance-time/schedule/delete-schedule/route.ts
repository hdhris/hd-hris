// /pages/api/batch-schedule.ts
import prisma from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.ref_batch_schedules.update({
      where: {
        id: id,
      },
      data: {
        deleted_at: new Date(new Date().setHours(new Date().getHours() + 8)),
      },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
  }
}

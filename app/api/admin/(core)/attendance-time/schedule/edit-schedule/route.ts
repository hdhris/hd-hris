// /pages/api/batch-schedule.ts
import { toGMT8 } from "@/lib/utils/toGMT8";
import prisma from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { id, name, clock_in, clock_out, is_active, break_min } = await req.json();

    console.log("Update");
    console.log("Clock In:", clock_in);
    console.log("Clock Out:", clock_out);
    const batchSchedule = await prisma.ref_batch_schedules.update({
      where: {
        id: id,
      },
      data: {
        name: name,
        clock_in: toGMT8(clock_in),
        clock_out: toGMT8(clock_out),
        break_min: parseInt(break_min),
        is_active: is_active,
        updated_at: toGMT8(new Date()),
      },
    });
    console.log(batchSchedule);

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
  }
}

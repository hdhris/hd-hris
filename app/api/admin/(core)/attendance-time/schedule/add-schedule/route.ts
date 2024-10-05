import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { toGMT8 } from "@/lib/utils/toGMT8";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { name, clock_in, clock_out, is_active, break_min } =
      await req.json();

    console.log(await req.json());

    // console.log(clock_in);
     console.log("Clock In:", toGMT8(clock_in));
     console.log("Clock Out:", toGMT8(clock_out));
    const batchSchedule = await prisma.ref_batch_schedules.create({
      data: {
        name: name,
        clock_in: toGMT8(clock_in),
        clock_out: toGMT8(clock_out),
        break_min: parseInt(break_min),
        is_active: is_active,
        created_at: toGMT8(new Date()),
        updated_at: toGMT8(new Date()),
      },
    });
    console.log("Created: ",batchSchedule);
    // console.log(name, clock_in, clock_out, is_active, break_min)

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
  }
}

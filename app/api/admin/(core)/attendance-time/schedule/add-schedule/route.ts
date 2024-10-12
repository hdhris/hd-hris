import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { toGMT8 } from "@/lib/utils/toGMT8";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, clock_in, clock_out, is_active, break_min }  = body;

    console.log(body);

    // console.log(clock_in);
     console.log("Clock In:", toGMT8(clock_in).toISOString());
     console.log("Clock Out:", toGMT8(clock_out).toISOString());
    const batchSchedule = await prisma.ref_batch_schedules.create({
      data: {
        name: name,
        clock_in: toGMT8(clock_in).toISOString(),
        clock_out: toGMT8(clock_out).toISOString(),
        break_min: parseInt(break_min),
        is_active: is_active,
        created_at: toGMT8(new Date()).toISOString(),
        updated_at: toGMT8(new Date()).toISOString(),
      },
    });
    console.log("Created: ",batchSchedule);
    // console.log(name, clock_in, clock_out, is_active, break_min)

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
  }
}

// /pages/api/batch-schedule.ts
import { toGMT8 } from "@/lib/utils/toGMT8";
import prisma from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { id, name, clock_in, clock_out, is_active, break_min } = await req.json();

    const batchSchedule = await prisma.ref_batch_schedules.update({
      where: {
        id: id,
      },
      data: {
        name: name,
        clock_in: toGMT8(clock_in).toISOString(),
        clock_out: toGMT8(clock_out).toISOString(),
        break_min: parseInt(break_min),
        is_active: is_active,
        updated_at: toGMT8(new Date()).toISOString(),
      },
    });
    const findSchedules = await prisma.dim_schedules.findMany({
      where: { batch_id: batchSchedule.id },
    })
    const [updateEndDate, recreateDimSchedules] = await Promise.all([
      prisma.dim_schedules.updateMany({
        where: {
          batch_id: batchSchedule.id,
          end_date: null,
        },
        data: {
          end_date: toGMT8().toISOString(),
          updated_at: toGMT8().toISOString(),
        }
      }),
      prisma.dim_schedules.createMany({
        data: findSchedules.map(sc => {
          return {
            ...sc,
            id: undefined,
            start_date: toGMT8().toISOString(),
            end_date: null,
            days_json: sc.days_json!,
            updated_at: toGMT8().toISOString(),
            clock_in: batchSchedule.clock_in,
            clock_out: batchSchedule.clock_out,
          }
        })
      })
    ]);
    console.log(batchSchedule);

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
  }
}

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

        const findOldSchedules = await prisma.dim_schedules.findMany({
            where: {
                batch_id: id,
                end_date: null,
            },
        });
        const [updateEndDate, recreateDimSchedules] = await Promise.all([
            prisma.dim_schedules.updateMany({
                where: {
                    id: {
                      in: findOldSchedules.map(item => item.id)
                    }
                },
                data: {
                    end_date: toGMT8().toISOString(),
                    updated_at: toGMT8().toISOString(),
                },
            }),
            prisma.dim_schedules.createMany({
                data: findOldSchedules.map((sc) => {
                    return {
                        id: undefined,
                        start_date: toGMT8().toISOString(),
                        end_date: null,
                        days_json: sc.days_json!,
                        created_at: toGMT8().toISOString(),
                        updated_at: toGMT8().toISOString(),
                        clock_in: batchSchedule.clock_in,
                        clock_out: batchSchedule.clock_out,
                        break_min: batchSchedule.break_min,
                    };
                }),
            }),
        ]);
        console.log(batchSchedule);

        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error(error);
    }
}

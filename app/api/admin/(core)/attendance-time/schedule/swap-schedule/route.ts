// /pages/api/batch-schedule.ts
import { toGMT8 } from "@/lib/utils/toGMT8";
import prisma from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const [id1, id2] = await req.json();

        const [batch1, batch2, findSchedules1, findSchedules2] = await Promise.all([
            // Batch 1
            prisma.ref_batch_schedules.findFirst({
                where: {
                    id: id1,
                },
            }),
            
            // Batch 2
            prisma.ref_batch_schedules.findFirst({
                where: {
                    id: id2,
                },
            }),

            // Schedule 1
            prisma.dim_schedules.findMany({
                where: {
                    batch_id: id1,
                    end_date: null,
                },
            }),

            // Schedule 2
            prisma.dim_schedules.findMany({
                where: {
                    batch_id: id2,
                    end_date: null,
                },
            }),
        ]);

        if (!batch1 || !batch2) {
            throw new Error("Batch not found");
        }

        const promise = await Promise.all([
            prisma.dim_schedules.updateMany({
                where: {
                    id: {
                        in: [...findSchedules1.map((item) => item.id), ...findSchedules2.map((item) => item.id)],
                    },
                },
                data: {
                    end_date: toGMT8().toISOString(),
                    updated_at: toGMT8().toISOString(),
                },
            }),
            
            prisma.dim_schedules.createMany({
                data: findSchedules1.map((sc) => {
                    return {
                        id: undefined,
                        start_date: toGMT8().toISOString(),
                        end_date: null,
                        employee_id: sc.employee_id,
                        days_json: sc.days_json!,
                        created_at: toGMT8().toISOString(),
                        updated_at: toGMT8().toISOString(),
                        batch_id: batch2.id,
                        clock_in: batch2.clock_in,
                        clock_out: batch2.clock_out,
                        break_min: batch2.break_min,
                    };
                }),
            }),

            prisma.dim_schedules.createMany({
                data: findSchedules2.map((sc) => {
                    return {
                        id: undefined,
                        start_date: toGMT8().toISOString(),
                        end_date: null,
                        employee_id: sc.employee_id,
                        days_json: sc.days_json!,
                        created_at: toGMT8().toISOString(),
                        updated_at: toGMT8().toISOString(),
                        batch_id: batch1.id,
                        clock_in: batch1.clock_in,
                        clock_out: batch1.clock_out,
                        break_min: batch1.break_min,
                    };
                }),
            }),
        ]);

        console.log(promise);

        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error(error);
    }
}

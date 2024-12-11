import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const employee_id = Number(searchParams.get("employee_id"));
    try {
        const schedules = await prisma.dim_schedules.findFirst({
            where: {
                employee_id,
                deleted_at: null,
                end_date: null,
            },
            include: {
                ref_batch_schedules: true,
            }
        })
        return NextResponse.json(schedules);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

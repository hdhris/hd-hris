import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";

export const dynamic = "force-dynamic";
export async function GET() {
    try {
        const [batchData, employees] = await Promise.all([
            prisma.ref_batch_schedules.findMany({
                where: {
                    deleted_at: null,
                },
            }),

            prisma.trans_employees.findMany({
                where: {
                    deleted_at: null,
                },
                ...emp_rev_include.minor_detail,
            }),
        ]);
        return NextResponse.json({
            batch: batchData,
            employees: employees,
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

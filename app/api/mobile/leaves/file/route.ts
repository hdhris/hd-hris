import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const employee_id = Number(searchParams.get("employee_id"));
    try {
        const LeaveBalance = await prisma.dim_leave_balances.findMany({
            where: {
                employee_id: employee_id,
            },
            include: {
                trans_leave_types: {
                    include: {
                        ref_leave_type_details: true,
                    }
                },
            }
        })
        return NextResponse.json(LeaveBalance);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

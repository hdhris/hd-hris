import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const employee_id = Number(searchParams.get("employee_id"));
    try {
        const overtime = await prisma.trans_overtimes.findMany({
            where: {
                employee_id,
                deleted_at: null, 
            },
            include: {
                trans_employees_overtimes_approvedBy: {
                    ...emp_rev_include.reviewer_detail,
                },
            },
            orderBy: {
                updated_at: 'desc'
            }
        })
        return NextResponse.json(overtime);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
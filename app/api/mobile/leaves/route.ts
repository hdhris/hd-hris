import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const employee_id = Number(searchParams.get("employee_id"));
    try {
        const leaves = await prisma.trans_leaves.findMany({
            where: {
                employee_id: employee_id,
            },
            include: {
                trans_employees_trans_leaves_created_byTotrans_employees: {
                    ...emp_rev_include.reviewer_detail,
                },
                trans_leave_types: {
                    include: {
                        ref_employment_status: true,
                        ref_leave_type_details: true,
                    }
                },
            },
            orderBy: {
                updated_at: 'desc'
            }
        })
        return NextResponse.json(leaves);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

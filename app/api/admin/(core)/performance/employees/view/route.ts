import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    try {
        // console.log(body);
        const surver_form = await prisma.fact_performance_evaluations.findFirst({
            where: {
                id,
            },
            include: {
                trans_employees: {
                    ...emp_rev_include.basic_detail,
                },
                trans_employees_fact_performance_evaluations_evaluated_byTotrans_employees: {
                    ...emp_rev_include.minor_detail,
                }
            }
        });
        return NextResponse.json(surver_form, { status: 200 });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

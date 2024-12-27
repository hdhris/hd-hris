import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";


export async function POST(req: NextRequest) {
    const { employee_id, start_date, end_date, employment_status, phase, evaluated_by } = await req.json();
    try {
        const criterias = await prisma.ref_performance_criterias.findMany({
            where: {
                deleted_at: null,
            },
        });

        const appraisal_form = await prisma.fact_performance_evaluations.create({
            data: {
                phase,
                end_date,
                employee_id,
                evaluated_by,
                employment_status,
                ratings_json: {},
                criteria_json: criterias,
                start_date: start_date,
                max_rate: criterias.length * 5,
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
            },
        });
        return NextResponse.json({ status: true, id: appraisal_form.id }, { status: 200 });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

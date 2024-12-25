import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
    const { evaluated_by, employee_id } = await req.json();
    // const employee_id = 1;
    // const evaluated_by = 2;
    try {

        const [employee, last_evaluation, criterias] = await Promise.all([
            // Employee
            prisma.trans_employees.findFirst({
                where: { id: employee_id },
                select: {
                    hired_at: true,
                    ref_employment_status: true,
                },
            }),

            // Last evaluation
            prisma.fact_performance_evaluations.findFirst({
                where: {
                    employee_id,
                    ref_employment_status: {
                        trans_employees: {
                            some: {
                                id: employee_id,
                            },
                        },
                    },
                },
                orderBy: {
                    created_at: "desc",
                },
            }),

            // Get criterias
            prisma.ref_performance_criterias.findMany({
                where: {
                    deleted_at: null,
                },
            })
        ])

        const today = toGMT8();
        const last_date = toGMT8(last_evaluation?.end_date ?? employee?.hired_at ?? undefined);
        const diff_months = Math.abs(last_date.diff(today.subtract(employee?.ref_employment_status.appraisal_interval!, "months"), "month"));
        // console.log({today: today.subtract(employee?.ref_employment_status.appraisal_interval!, "months").toISOString(), last_date: last_date.toISOString(), diff_months:  diff_months});

        // Check if the input date is older than 6 months from today
        const is_in_range = diff_months === 0;
        if (!is_in_range && !last_evaluation) {
            return NextResponse.json({ status: false, message: `Next performance appraisal will take after ${diff_months} months` });
        }

        const start_date = last_date;

        const appraisal_form = last_evaluation ?? await prisma.fact_performance_evaluations.create({
            data: {
                criteria_json: criterias,
                start_date: start_date.toISOString(),
                max_rate: criterias.length * 5,
                employee_id,
                evaluated_by,
                employment_status: employee?.ref_employment_status.id,
                ratings_json: {},
                end_date: last_date.add(employee?.ref_employment_status.appraisal_interval!, "months").toISOString(),
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

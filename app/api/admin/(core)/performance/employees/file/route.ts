import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    let employee_id: string | number | null = searchParams.get("employee_id");
    if (!employee_id) {
        throw new Error("No employee ID");
    } else {
        employee_id = Number(employee_id);
    }
    try {
        const [employee, last_evaluation, criterias] = await Promise.all([
            // Employee
            prisma.trans_employees.findFirst({
                where: { id: employee_id },
                select: {
                    ...emp_rev_include.basic_detail.select,
                },
            }),

            // Last evaluation
            prisma.fact_performance_evaluations.findMany({
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
                select: {
                    start_date: true,
                    end_date: true,
                    status: true,
                    phase: true,
                    id: true,
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
            }),
        ]);

        console.log(last_evaluation);
        const today = toGMT8();
        const last_date = toGMT8(last_evaluation?.[0]?.end_date ?? employee?.hired_at ?? undefined);
        const diff_months = last_date.diff(
            today.subtract(employee?.ref_employment_status.appraisal_interval!, "months"),
            "month"
        );
        // console.log({today: today.subtract(employee?.ref_employment_status.appraisal_interval!, "months").toISOString(), last_date: last_date.toISOString(), diff_months:  diff_months});

        // Check if the input date is older than 6 months from today
        // const is_in_range = diff_months === 0;
        // if (!is_in_range && !last_evaluation) {
        //     return NextResponse.json({
        //         status: false,
        //         message: `Next performance appraisal will take after ${diff_months} months`,
        //     });
        // }

        return NextResponse.json({
            employee: employee,
            evaluation_history: last_evaluation,
            next_interval: diff_months,
            start_date: last_date.toISOString(),
            end_date: last_date.add(employee?.ref_employment_status.appraisal_interval!, "months").toISOString(),
        });

    } catch (error) {
        console.error(error); // Log the error for debugging
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

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

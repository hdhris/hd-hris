import { NextRequest, NextResponse } from "next/server";
import { hasContentType } from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
    try {
        hasContentType(req);
        const body = await req.json();

        console.log("Data: ", body)
        // Start a transaction to ensure atomicity
        await prisma.$transaction(async (prisma) => {
            // Create the deduction entry first
            const createdDeduction = await prisma.ref_payheads.create({
                data: {
                    name: body.name,
                    type: "deduction",
                    created_at: toGMT8(new Date()).toISOString(),
                    updated_at: toGMT8(new Date()).toISOString(),
                    is_active: body.is_active ?? true, // Default to true if not provided
                    calculation: "get_contribution",
                    system_only: true,
                    is_overwritable: false,
                    affected_json: {
                        mandatory: "all",
                        departments: "all",
                        job_classes: "all",
                        employees: "all",
                    },
                },
            });

            // Create the benefit plan and link it to the created deduction
            const createdPlan = await prisma.ref_benefit_plans.create({
                data: {
                    name: body.name,
                    type: body.plan_type,
                    coverage_details: body.coverage_details,
                    effective_date: new Date(body.effective_date),
                    expiration_date: body.expiration_date ? new Date(body.expiration_date) : null,
                    description: body.description,
                    is_active: body.is_active ?? true,
                    deduction_id: createdDeduction.id,
                    created_at: toGMT8(new Date()).toISOString(),
                    updated_at: toGMT8(new Date()).toISOString(),
                    ref_benefits_contribution_table: {
                        // create: body.contribution_table?.map((contribution: any) => ({
                        //     contribution_type: contribution.type,
                        //     employer_contribution: Number(contribution.employer_contribution),
                        //     employee_contribution: Number(contribution.employee_contribution),
                        // })) || [],
                        create: {
                            employee_rate: body.employee_contribution,
                            employer_rate: body.employer_contribution,
                        }
                    },
                },
            });

            // Create advance settings if provided
            if (body.advance_setting) {
                await prisma.ref_benefits_contribution_table.create({
                    data: {
                        min_salary: Number(body.advance_setting.min_salary),
                        max_salary: Number(body.advance_setting.max_salary),
                        min_MSC: Number(body.advance_setting.min_MSC),
                        max_MSC: Number(body.advance_setting.max_MSC),
                        msc_step: Number(body.advance_setting.msc_step),
                        ec_threshold: Number(body.advance_setting.ec_threshold),
                        ec_low_rate: Number(body.advance_setting.ec_low_rate),
                        ec_high_rate: Number(body.advance_setting.ec_high_rate),
                        wisp_threshold: Number(body.advance_setting.wisp_threshold),
                        created_at: toGMT8(new Date()).toISOString(),
                        updated_at: toGMT8(new Date()).toISOString(),
                        plan_id: createdPlan.id,
                    },
                });
            }
        });

        return NextResponse.json({ message: "Plan created successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: error || "Internal Server Error" }, { status: 500 });
    }
}

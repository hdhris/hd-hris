import { NextRequest, NextResponse } from "next/server";
import { hasContentType } from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
    try {
        hasContentType(req);
        const body = await req.json();

        console.log("Update Data: ", body);

        // Validate required fields
        if (!body.plan_id) {
            return NextResponse.json({ error: "plan_id is required" }, { status: 400 });
        }

        // Start a transaction to ensure atomicity
        await prisma.$transaction(async (prisma) => {
            // Update the deduction entry if needed
            if (body.deduction) {
                await prisma.ref_payheads.update({
                    where: { id: body.deduction_id },
                    data: {
                        name: body.deduction.name,
                        is_active: body.deduction.is_active ?? true,
                        updated_at: toGMT8(new Date()).toISOString(),
                    },
                });
            }

            // Update the benefit plan
            const updatedPlan = await prisma.ref_benefit_plans.update({
                where: { id: body.plan_id },
                data: {
                    name: body.name,
                    type: body.plan_type,
                    coverage_details: body.coverage_details,
                    effective_date: body.effective_date ? new Date(body.effective_date) : undefined,
                    expiration_date: body.expiration_date ? new Date(body.expiration_date) : null,
                    description: body.description,
                    is_active: body.is_active ?? true,
                    updated_at: toGMT8(new Date()).toISOString(),
                },
            });

            // Update or create the benefits contribution table
            if (body.contribution_table) {
                const existingContribution = await prisma.ref_benefits_contribution_table.findFirst({
                    where: { plan_id: updatedPlan.id },
                });

                if (existingContribution) {
                    // Update the existing entry
                    await prisma.ref_benefits_contribution_table.update({
                        where: { id: existingContribution.id },
                        data: {
                            employee_rate: body.contribution_table.employee_contribution,
                            employer_rate: body.contribution_table.employer_contribution,
                            updated_at: toGMT8(new Date()).toISOString(),
                        },
                    });
                } else {
                    // Create a new entry
                    await prisma.ref_benefits_contribution_table.create({
                        data: {
                            employee_rate: body.contribution_table.employee_contribution,
                            employer_rate: body.contribution_table.employer_contribution,
                            plan_id: updatedPlan.id,
                            created_at: toGMT8(new Date()).toISOString(),
                            updated_at: toGMT8(new Date()).toISOString(),
                        },
                    });
                }
            }

            // Update advanced settings if provided
            if (body.advance_setting) {
                const existingAdvancedSetting = await prisma.ref_benefits_contribution_table.findFirst({
                    where: { plan_id: updatedPlan.id },
                });

                if (existingAdvancedSetting) {
                    await prisma.ref_benefits_contribution_table.update({
                        where: { id: existingAdvancedSetting.id },
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
                            updated_at: toGMT8(new Date()).toISOString(),
                        },
                    });
                } else {
                    // If no advanced settings exist, create a new entry
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
                            plan_id: updatedPlan.id,
                            created_at: toGMT8(new Date()).toISOString(),
                            updated_at: toGMT8(new Date()).toISOString(),
                        },
                    });
                }
            }
        });

        return NextResponse.json({ message: "Plan updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: error || "Internal Server Error" }, { status: 500 });
    }
}

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

            const contribution = body.contribution_type !== "others" ? [{
                contribution_type: body.contribution_type,
                actual_contribution_amount: body.contribution_type === "fixed" ? isNaN(body.fixed_amount) ? null : Number(body.fixed_amount) : body.contribution_type === "percentage" ? isNaN(body.percentage_amount) ? null : Number(body.percentage_amount)/100 : null,
                min_salary: Number(body.min_salary),
                max_salary: Number(body.max_salary),
            }] : body.tiers


            // Create the benefit plan and link it to the created deduction
            await prisma.ref_benefit_plans.create({
                data: {
                    name: body.name,
                    type: body.plan_type,
                    coverage_details: body.coverage_details,
                    effective_date: toGMT8(body.effective_date).toISOString(),
                    expiration_date: body.expiration_date ? toGMT8(body.expiration_date).toISOString() : null,
                    description: body.description,
                    is_active: body.is_active ?? true,
                    deduction_id: createdDeduction.id,
                    created_at: toGMT8(new Date()).toISOString(),
                    updated_at: toGMT8(new Date()).toISOString(),
                    ref_benefits_contribution_table: {
                        createMany: {
                            data: contribution
                        }
                    },
                },
            });
        });

        return NextResponse.json({ message: "Plan created successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: error || "Internal Server Error" }, { status: 500 });
    }
}

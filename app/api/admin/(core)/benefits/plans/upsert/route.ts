import { NextRequest, NextResponse } from "next/server";
import { hasContentType } from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { capitalize } from "@nextui-org/shared-utils";
import { getPrismaErrorMessage } from "@/server/errors/server-errors";

export async function POST(req: NextRequest) {
    try {
        hasContentType(req);
        const body = await req.json();

        console.log("Plan: ", body);

        if (!body.id) {
            const isDuplicate = await prisma.ref_benefit_plans.findFirst({
                where: {
                    name: body.name,
                    type: capitalize(body.plan_type),
                },
            });

            if (isDuplicate) {
                return NextResponse.json({ message: "Benefit plan already exists" }, { status: 400 });
            }
        }

        // Start a transaction to ensure atomicity
        await prisma.$transaction(async (transactionPrisma) => {
            let contribution =
                body.contribution_type !== "others"
                    ?
                    [
                        {
                            // id: body.plan[0].id ?? null,
                            contribution_type: body.contribution_type,
                            actual_contribution_amount:
                                body.contribution_type === "fixed"
                                    ? isNaN(body.fixed_amount)
                                        ? null
                                        : Number(body.fixed_amount)
                                    : body.contribution_type === "percentage"
                                        ? isNaN(body.percentage_amount)
                                            ? null
                                            : Number(body.percentage_amount)
                                        : null,
                            min_salary: Number(body.min_salary),
                            max_salary: Number(body.max_salary),
                        },
                    ]
                    : body.tiers;


            if (body.id) {
                console.log("updating...")
                if(body.contribution_type !== "others") {
                    contribution = contribution.map((item: any) => {
                        return{
                            id: body.contribution_table_id[0],
                            ...item
                        }
                    });
                }
                contribution = contribution.map((item: any) => ({
                    ...item,
                    updated_at: toGMT8().toISOString(),
                }));

                await transactionPrisma.ref_payheads.update({
                    where: { id: body.deduction_id },
                    data: {
                        name: body.name,
                        updated_at: toGMT8(new Date()).toISOString(),
                        is_active: body.is_active ?? true, // Default to true if not provided
                    },
                });

                await transactionPrisma.ref_benefit_plans.update({
                    where: { id: body.id },
                    data: {
                        name: body.name,
                        type: capitalize(body.plan_type),
                        coverage_details: body.coverage_details,
                        effective_date: toGMT8(body.effective_date).toISOString(),
                        expiration_date: body.expiration_date ? toGMT8(body.expiration_date).toISOString() : null,
                        description: body.description,
                        is_active: body.is_active ?? true,
                        updated_at: toGMT8().toISOString(),
                    },
                });
                for (const item of contribution) {
                    await transactionPrisma.ref_benefits_contribution_table.update({
                        where: { id: item.id },
                        data: {
                            contribution_type: item.contribution_type,
                            actual_contribution_amount: item.actual_contribution_amount,
                            min_salary: item.min_salary,
                            max_salary: item.max_salary,
                            min_MSC: item.min_MSC ?? 0,
                            max_MSC: item.max_MSC ?? 0,
                            msc_step: item.msc_step ?? 0,
                            ec_threshold: item.ec_threshold ?? 0,
                            ec_low_rate: item.ec_low_rate ?? 0,
                            ec_high_rate: item.ec_high_rate ?? 0,
                            wisp_threshold: item.wisp_threshold ?? 0,
                            updated_at: toGMT8().toISOString(),
                            employer_rate: item.employer_contribution,
                            employee_rate: item.employee_contribution,
                        },
                    });
                }
            }

            else {
                console.log("Creating...")
                console.log("Plan: ", body.plan)
                console.log("Contribution: ", contribution)
                const createdDeduction = await transactionPrisma.ref_payheads.create({
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

                await transactionPrisma.ref_benefit_plans.create({
                    data: {
                        name: body.name,
                        type: capitalize(body.plan_type),
                        coverage_details: body.coverage_details,
                        effective_date: toGMT8(body.effective_date).toISOString(),
                        expiration_date: body.expiration_date ? toGMT8(body.expiration_date).toISOString() : null,
                        description: body.description,
                        is_active: body.is_active ?? true,
                        deduction_id: createdDeduction.id,
                        created_at: toGMT8().toISOString(),
                        updated_at: toGMT8().toISOString(),
                        ref_benefits_contribution_table: {
                            createMany: {
                                data: contribution.map((item: any) => ({
                                    contribution_type: item.contribution_type,
                                    actual_contribution_amount: item.actual_contribution_amount,
                                    min_salary: item.min_salary,
                                    max_salary: item.max_salary,
                                    min_MSC: item.min_MSC ?? 0,
                                    max_MSC: item.max_MSC ?? 0,
                                    msc_step: item.msc_step ?? 0,
                                    ec_threshold: item.ec_threshold ?? 0,
                                    ec_low_rate: item.ec_low_rate ?? 0,
                                    ec_high_rate: item.ec_high_rate ?? 0,
                                    wisp_threshold: item.wisp_threshold ?? 0,
                                    updated_at: toGMT8().toISOString(),
                                    employer_rate: item.employer_contribution,
                                    employee_rate: item.employee_contribution,
                                })),
                            }
                        }
                    },
                });
            }
        });

        return NextResponse.json({ message: "Plan created successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return getPrismaErrorMessage(error);
    }
}

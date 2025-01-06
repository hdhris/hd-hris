import {NextRequest, NextResponse} from "next/server";
import {hasContentType} from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma"
import { JsonValue } from "@prisma/client/runtime/library";
import {Benefit, ContributionSetting} from "@/helper/payroll/calculations";
import {ContributionType} from "@/types/benefits/plans/plansTypes";
import {getPrismaErrorMessage} from "@/server/errors/server-errors";
import {toGMT8} from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
    try {
        hasContentType(req)
        const data = await req.json()

        const plan = await prisma.ref_benefit_plans.findUnique({
            where: {
                id: data.plan_id
            },
            select: {
                id: true,
                name: true,
                type: true,
                effective_date: true,
                expiration_date: true,
                created_at: true,
                updated_at: true,
                deduction_id: true,
                ref_benefits_contribution_table: {
                    select: {
                        id: true,
                        min_salary: true,
                        max_salary: true,
                        min_MSC: true,
                        max_MSC: true,
                        msc_step: true,
                        ec_threshold: true,
                        ec_low_rate: true,
                        ec_high_rate: true,
                        wisp_threshold: true,
                        created_at: true,
                        updated_at: true,
                        employee_rate: true,
                        employer_rate: true,
                        contribution_type: true,
                        actual_contribution_amount: true
                    }
                }
            }
        })

        const planDeduction: ContributionSetting = {
            id: plan?.id!,
            deduction_id: plan?.deduction_id!,
            name: plan?.name!,
            ref_benefits_contribution_table: plan?.ref_benefits_contribution_table.map((item) => {
                return {
                    min_salary: item.min_salary?.toNumber() ?? 0,
                    max_salary: item.max_salary?.toNumber() ?? 0,
                    min_MSC: item.min_MSC?.toNumber() ?? 0,
                    max_MSC: item.max_MSC?.toNumber() ?? 0,
                    msc_step: item.msc_step?.toNumber() ?? 0,
                    ec_threshold: item.ec_threshold?.toNumber() ?? 0,
                    ec_low_rate: item.ec_low_rate?.toNumber() ?? 0,
                    ec_high_rate: item.ec_high_rate?.toNumber() ?? 0,
                    wisp_threshold: item.wisp_threshold?.toNumber() ?? 0,
                    employee_rate: item.employee_rate?.toNumber() ?? 0,
                    employer_rate: item.employer_rate?.toNumber() ?? 0,
                    actual_contribution_amount: item.actual_contribution_amount?.toNumber() ?? 0,
                    contribution_type: item.contribution_type as ContributionType,
            }}),
        }

        const salaries = await prisma.trans_employees.findMany({
            where: {
                id: {
                    in: data.employee_id
                }
            },
            select: {
                id: true,
                ref_salary_grades: {
                    select: {
                        amount: true
                    }
                }
            }
        })
        // console.log("Plan Deduction: ", planDeduction)
        const benefit = new Benefit(planDeduction);

        const contributionsMap = new Map(); // To ensure unique employee_id entries

        // Iterate over salaries and generate contributions
        for (const salary of salaries) {
            const contribution = benefit.getContribution(salary.ref_salary_grades?.amount.toNumber() ?? 0);
            if (!contributionsMap.has(salary.id)) {
                contributionsMap.set(salary.id, { employee_id: salary.id, contribution: contribution });
            }
        }

        // Convert the Map to an array
        const uniqueContributions = Array.from(contributionsMap.values());

        const contribution = data.employee_id.map((employeeId: any) => ({
                    employee_id: employeeId,
                    plan_id: data.plan_id,
                    enrollment_date: toGMT8().toISOString(),
                    created_at: toGMT8().toISOString(),
                    updated_at: toGMT8().toISOString(),
                    coverage_amount_type: data.coverageType,
                    coverage_amount: data.coverageAmount, // Replace with actual value
                    contribution_amount: Number(uniqueContributions.find(item => item.employee_id === employeeId)?.contribution?.toFixed(2)), // Replace with actual value
                    benefit_audit: plan as JsonValue
                }))

        await prisma.dim_employee_benefits.createMany({
            data: contribution,
        });

        // console.dir(contributions, {depth: null, colors: true})


        // await prisma.dim_employee_benefits.createMany({
        //     data: data.employee_id.map((employeeId: any) => ({
        //         employee_id: employeeId,
        //         plan_id: data.plan_id,
        //         enrollment_date: new Date(),
        //         created_at: new Date(),
        //         updated_at: new Date(),
        //         coverage_amount: data.coverageAmount, // Replace with actual value
        //         contribution_amount: 0.0, // Replace with actual value
        //         benefit_audit: plan as JsonValue
        //     })),
        // });


        // console.log("Employee: ", data.employee_id.map((employeeId: any) => ({
        //     employee_id: employeeId,
        //     plan_id: data.plan_id,
        //     enrollment_date: new Date(),
        //     created_at: new Date(),
        //     updated_at: new Date()
        // })))

        return NextResponse.json({status: 200})
    } catch (err) {
        console.log("Error creating: ", err)
        return getPrismaErrorMessage(err)
    }
}
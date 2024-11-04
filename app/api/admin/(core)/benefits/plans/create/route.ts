import {NextRequest, NextResponse} from "next/server";
import {hasContentType} from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import {BenefitPlan} from "@/types/benefits/plans/plansTypes";
import {toGMT8} from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
    try {
        hasContentType(req)
        const body = await req.json();
        console.log("Body: ", body)
        await prisma.ref_benefit_plans.create({
            data: {
                name: body.name,
                type: body.plan_type,
                coverage_details: body.coverage_details,
                employer_contribution: Number(body.employer_contribution),
                employee_contribution: Number(body.employee_contribution),
                effective_date: body.effective_date,
                expiration_date: body.expiration_date,
                description: body.description,
                is_active: body.is_active,
                created_at: toGMT8(new Date()).toISOString(),
                updated_at: toGMT8(new Date()).toISOString(),
            }
        })
         // await prisma.$transaction(async (prisma) => {
         //            const plan = await prisma.ref_benefit_plans.create({
         //                data: {
         //                    name: body.name,
         //                    type: body.plan_type,
         //                    coverage_details: body.coverage_details,
         //                    employer_contribution: Number(body.employer_contribution),
         //                    employee_contribution: Number(body.employee_contribution),
         //                    effective_date: body.effective_date,
         //                    expiration_date: body.expiration_date,
         //                    description: body.description,
         //                    is_active: body.is_active,
         //                    created_at: toGMT8(new Date()).toISOString(),
         //                    updated_at: toGMT8(new Date()).toISOString(),
         //                }
         //            })
         //
         //            if(body.advance_setting){
         //                await prisma.ref_benefits_contribution_advance_settings.create({
         //                    data: {
         //                        min_salary: Number(body.minSalary),
         //                        max_salary: Number(body.maxSalary),
         //                        min_MSC: Number(body.minMSC),
         //                        max_MSC: Number(body.maxMSC),
         //                        msc_step: Number(body.mscStep),
         //                        ec_threshold: Number(body.ecThreshold),
         //                        ec_low_rate: Number(body.ecLowRate),
         //                        ec_high_rate: Number(body.ecHighRate),
         //                        wisp_threshold: Number(body.wispThreshold),
         //                        created_at: toGMT8(new Date()).toISOString(),
         //                        updated_at:toGMT8(new Date()).toISOString(),
         //                        plan_id: plan.id
         //                    }
         //                })
         //            }
         //
         //        })

        //
        // console.log("Plan created: ", plan)
        return NextResponse.json({message: "Plan created successfully"}, {status: 200})
    } catch (error) {
        console.log("Error: ", error)
        return NextResponse.json({error: error}, {status: 500})
    }
}
import {NextRequest, NextResponse} from "next/server";
import {hasContentType} from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import {toGMT8} from "@/lib/utils/toGMT8";
export async function POST(req: NextRequest) {
    try {
        hasContentType(req);
        const body = await req.json();

        const updateDeduction = prisma.ref_payheads.update({
            where: { id: body.deduction_id },
            data: {
                name: body.name,
                updated_at: toGMT8().toISOString(),
                is_active: body.is_active,
            },
        });

        const updatePlan = prisma.ref_benefit_plans.update({
            where: { id: body.id },
            data: {
                name: body.name,
                type: body.plan_type,
                coverage_details: body.coverage_details,
                employer_contribution: Number(body.employer_contribution),
                employee_contribution: Number(body.employee_contribution),
                effective_date: toGMT8(body.effective_date).toISOString(),
                expiration_date: toGMT8(body.expiration_date).toISOString(),
                description: body.description,
                is_active: body.is_active,
                updated_at: toGMT8(new Date()).toISOString(),
            },
        });

        if (body.advance_setting && body.benefitAdditionalDetails) {
            const { id, minSalary, maxSalary, minMSC, maxMSC, mscStep, ecThreshold, ecLowRate, ecHighRate, wispThreshold } = body.benefitAdditionalDetails;

            const updateAdvanceSetting = prisma.ref_benefits_contribution_advance_settings.update({
                where: { id },
                data: {
                    min_salary: minSalary ?? 0,
                    max_salary: maxSalary ?? 0,
                    min_MSC: minMSC ?? 0,
                    max_MSC: maxMSC ?? 0,
                    msc_step: mscStep ?? 0,
                    ec_threshold: ecThreshold ?? 0,
                    ec_low_rate: ecLowRate ?? 0,
                    ec_high_rate: ecHighRate ?? 0,
                    wisp_threshold: wispThreshold ?? 0,
                    updated_at: toGMT8(new Date()).toISOString(),
                },
            });

            // Execute the three operations in a transaction
            await prisma.$transaction([updateDeduction, updatePlan, updateAdvanceSetting]);
        } else {
            // Execute only two operations if `advance_setting` is not required
            await prisma.$transaction([updateDeduction, updatePlan]);
        }

        return NextResponse.json({ message: "Plan updated successfully" }, { status: 200 });
    } catch (error: unknown) {
        console.error("Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
import {NextRequest, NextResponse} from "next/server";
import {hasContentType} from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma"
import {basicCalculator} from "@/helper/benefits-calculator/basic-calculator";
import {toDecimals} from "@/helper/numbers/toDecimals";
import {advanceCalculator} from "@/helper/benefits-calculator/advance-calculator";
export async function POST(req: NextRequest) {
    try {
        hasContentType(req)
        const data = await req.json()
        // console.log("Creating Data: ", data)

        //this is a static monthly salary
        const salary = 20_000
        const getRates = await prisma.ref_benefit_plans.findUnique({
            where: {
                id: data.plan_id
            },
            select: {
                name: true,
                employee_contribution: true,
                employer_contribution: true,
                ref_benefits_contribution_advance_settings: {
                    select: {
                        min_salary: true,
                        max_salary: true,
                        min_MSC: true,
                        max_MSC: true,
                        msc_step: true,
                        ec_threshold: true,
                        ec_low_rate: true,
                        ec_high_rate: true,
                        wisp_threshold: true,
                    }

                }
            }
        })

        let contribution: number;
        if(getRates?.ref_benefits_contribution_advance_settings?.length! > 0){

            const advanceRates = getRates?.ref_benefits_contribution_advance_settings.find(item => item)!
            const rates = {
                minSalary: toDecimals(advanceRates.min_salary!),
                maxSalary: toDecimals(advanceRates.max_salary!),
                minMSC: toDecimals(advanceRates.min_MSC!),
                maxMSC: toDecimals(advanceRates.max_MSC!),
                mscStep: toDecimals(advanceRates.msc_step!),
                regularEmployeeRate: toDecimals(getRates?.employee_contribution!),
                regularEmployerRate: toDecimals(getRates?.employer_contribution!),
                ecThreshold: toDecimals(advanceRates.ec_threshold!),
                ecLowRate: toDecimals(advanceRates.ec_low_rate!),
                ecHighRate: toDecimals(advanceRates.ec_high_rate!),
                wispThreshold: toDecimals(advanceRates.wisp_threshold!),

            }

            console.log("Rates: ", rates)
            const advance = advanceCalculator(salary, rates)
            contribution = advance.total
        } else{
            const basic  = basicCalculator(salary, toDecimals(getRates?.employer_contribution!), toDecimals(getRates?.employee_contribution!))
            contribution = basic.employee_contribution + basic.employer_contribution
        }

        console.log("Your Contribution: ", contribution)


        return NextResponse.json(data)
    } catch (err){
        return NextResponse.json({err: err})
    }
}
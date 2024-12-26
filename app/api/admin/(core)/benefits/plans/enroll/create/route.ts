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

        console.log("Creating Data: ", data)

        const plan = await prisma.ref_benefit_plans.findUnique({
            where: {
                id: data.plan_id
            },
            // include: {
            //     ref_benefits_contribution_table: true,
            // }
        })

        // console.log("Audit: ", plan?.ref_benefits_contribution_table)
        // const groupedData = Object.groupBy(plan?.ref_benefits_contribution_table, (item) => item["contribution_type"]);
        // await prisma.dim_employee_benefits.createMany({
        //     data: data.employee_id.map((employeeId: any) => ({
        //         employee_id: employeeId,
        //         plan_id: data.plan_id,
        //         enrollment_date: new Date(),
        //         created_at: new Date(),
        //         updated_at: new Date(),
        //         coverage_amount: data.coverageAmount, // Replace with actual value
        //         contribution_amount: 0.0, // Replace with actual value
        //         benefit_audit:
        //     })),
        // });


        console.log("Employee: ", data.employee_id.map((employeeId: any) => ({
            employee_id: employeeId,
            plan_id: data.plan_id,
            enrollment_date: new Date(),
            created_at: new Date(),
            updated_at: new Date()
        })))

        return NextResponse.json({status: 200})
    } catch (err){
        console.log("Error creating: ", err)
        return NextResponse.json({err: err})
    }
}
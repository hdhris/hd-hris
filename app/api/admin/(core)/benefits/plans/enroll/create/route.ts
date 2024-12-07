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

        await prisma.dim_employee_benefits.createMany({
            data: data.employee_id.map((employeeId: any) => ({
                employee_id: employeeId,
                plan_id: data.plan_id,
                enrollment_date: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
                coverage_amount: 0.0, // Replace with actual value
                contribution_amount: 0.0, // Replace with actual value
            })),
        });


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
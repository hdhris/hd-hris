import {getPrismaErrorMessage} from "@/server/errors/server-errors";
import prisma from "@/prisma/prisma"
import {NextResponse} from "next/server";
import {isEmployeeAvailable} from "@/helper/employee/unavailableEmployee";

export async function GET(){
    try {
        const [employee_count] = await prisma.$transaction([
            prisma.trans_employees.findMany({
                where: {
                    deleted_at: null
                },
                select: {
                    suspension_json: true,
                    termination_json: true,
                    resignation_json: true,
                }
            })
        ])

        const emp_count = employee_count.filter(employee => isEmployeeAvailable({employee, find:["resignation","termination"]})).length
        return NextResponse.json({emp_count})
    }catch(err){
        return getPrismaErrorMessage(err)
    }
}
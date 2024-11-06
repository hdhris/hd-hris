import {NextRequest, NextResponse} from "next/server";
import {paginateUrl} from "@/server/pagination/paginate-url";
import prisma from "@/prisma/prisma"
import paginationHandler from "@/server/pagination/paginate";
import {EmployeeDetails} from "@/types/employeee/EmployeeType";
import {getEmpFullName} from "@/lib/utils/nameFormatter";

export async function GET(req: NextRequest) {
    try {
        const {searchParams} = new URL(req.url)
        const {page, perPage} = paginateUrl(req.url)
        const plan_id = Number(searchParams.get("plan_id"))

        const enrolled_benefit = await prisma.dim_employee_benefits.findMany({
            where: {
                terminated_at: null, plan_id: plan_id, ref_benefit_plans: {
                    is: {
                        expiration_date: {
                            gt: new Date()
                        }
                    },
                }
            },
            select: {
                employee_id: true
            }
        })


        const employee = await prisma.trans_employees.findMany({
            where: {
                id: {
                    notIn: enrolled_benefit.map(id => id.employee_id).filter(id => id !== null)
                }, deleted_at: null
            }, select: {
                id: true,
                first_name: true,
                last_name: true,
                middle_name: true,
                prefix: true,
                suffix: true,
                extension: true,
                picture: true,
                ref_departments: true,
                ref_job_classes: true
            },
        })

        const enroll_employee = employee.map(item => {
            return {
                id: item.id,
                name: getEmpFullName(item),
                picture: item.picture,
                department: item.ref_departments?.name,
                job: item.ref_job_classes?.name
            }
        })


        return NextResponse.json(enroll_employee)
    } catch (error) {
        return NextResponse.json({error: error})
    }
}
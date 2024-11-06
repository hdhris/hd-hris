import {paginateUrl} from "@/server/pagination/paginate-url";
import paginationHandler from "@/server/pagination/paginate";
import prisma from "@/prisma/prisma";
import {NextResponse} from "next/server";
import {emp_rev_include} from "@/helper/include-emp-and-reviewr/include";



export async function GET(request: Request) {
    try{
        const {page, perPage} = paginateUrl(request.url)

        const employee_membership = await prisma.trans_employees.findMany({
            where: {
                deleted_at: null,
                dim_employee_benefits: {
                    some: {
                        terminated_at: null
                    }
                }
            },
            select: {
                prefix: true,
                first_name: true,
                middle_name: true,
                last_name: true,
                suffix: true,
                extension: true,
                dim_employee_benefits: {
                    select: {
                        id: true,
                        employee_id: true,
                        plan_id: true,
                        enrollment_date: true,
                        coverage_amount: true,
                        contribution_amount: true,
                        ref_benefit_plans: true // Select all fields from `ref_benefit_plans`
                    }
                }
            }
        });





        // const membership = await prisma.trans_employees.findMany({
        //     where: {
        //         deleted_at: null,
        //         dim_employee_benefits: {
        //             some: {
        //                 employee_id: {
        //                     not: null
        //                 },
        //                 terminated_at: null
        //             }
        //         }
        //     },
        //     select: {
        //         dim_employee_benefits: {
        //             include: {
        //                 ref_benefit_plans: true
        //             }
        //         }
        //     }
        // });


        // const employee_membership = membership.map(data => {
        //     return{
        //         id: data.dim_employee_benefits.
        //     }
        // })

        return NextResponse.json(employee_membership)

    }catch (err){
        return NextResponse.json({error: err})

    }
}
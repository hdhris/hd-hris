import {NextRequest, NextResponse} from "next/server";
import prisma from "@/prisma/prisma"
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {toGMT8} from "@/lib/utils/toGMT8";
import {
    BenefitSelectionDetails,
    EmployeeBenefitSelectionDetails,
    EmployeeEnrollmentSelection
} from "@/types/benefits/membership/membership-types";
import {getPrismaErrorMessage} from "@/server/errors/server-errors";
import {employee_basic_details, employee_validation} from "@/server/employee-details-map/employee-details-map";

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
    try {
        const {searchParams} = new URL(req.url)
        const plan_id = Number(searchParams.get("plan_id"))

        const benefits = await prisma.ref_benefit_plans.findMany({
            where: {
                deleted_at: null, expiration_date: {
                    gt: toGMT8().toDate()
                }
            }, select: {
                id: true, name: true, ref_benefits_contribution_table: {
                    select: {
                        max_salary: true, min_salary: true
                    }
                }
            }
        })

        const enrolled_benefit = await prisma.dim_employee_benefits.findMany({
            where: {
                terminated_at: null,
                ref_benefit_plans: {
                    is: {
                        expiration_date: {
                            gt: new Date()
                        }
                    },
                }
            }, select: {
                ref_benefit_plans: {
                    select: {
                        id: true
                    }
                },
                employee_id: true
            }
        })


        const employee = await prisma.trans_employees.findMany({
            where: {
               ...employee_validation
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
                ref_job_classes: true,
                ref_salary_grades: {
                    select: {
                        amount: true
                    }
                }
            },
        })

        const enroll_employee:EmployeeBenefitSelectionDetails[] = employee.map(item => {
            return {
                id: item.id,
                name: getEmpFullName(item),
                picture: item.picture ?? "",
                department: item.ref_departments?.name ?? "",
                job: item.ref_job_classes?.name ?? "",
                salary: item.ref_salary_grades?.amount.toNumber() ?? 0,
                enrolled_benefits_id: enrolled_benefit.filter(plan => plan.employee_id === item.id).map(item => item.ref_benefit_plans.id)
            }
        })
        const benefits_details: BenefitSelectionDetails[] = benefits.map(benefit => ({
            id: benefit.id,
            name: benefit.name ?? "",
            contribution_breakdown: benefit.ref_benefits_contribution_table.map(contribution => ({
                min_salary: contribution.min_salary?.toNumber() ?? 0,
                max_salary: contribution.max_salary?.toNumber() ?? 0
            }))
        }))
        const benefit_selection: EmployeeEnrollmentSelection = {
            employee: enroll_employee,
            benefits: benefits_details
        }

        return NextResponse.json(benefit_selection)
    } catch (error) {
        console.log("Error: ", error)
        return getPrismaErrorMessage(error)
    }
}
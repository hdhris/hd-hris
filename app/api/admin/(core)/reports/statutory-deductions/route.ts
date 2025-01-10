import {NextRequest, NextResponse} from "next/server";
import {getPrismaErrorMessage} from "@/server/errors/server-errors";
import prisma from "@/prisma/prisma";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {employee_basic_details} from "@/server/employee-details-map/employee-details-map";
import {toGMT8} from "@/lib/utils/toGMT8";

export async function GET(req: NextRequest) {
    try {
        const {searchParams} = new URL(req.url);
        // const page = parseInt(searchParams.get('page') || '1', 10); // Default to page 1
        const dateID = Number(searchParams.get("date"));
        const plan_id = Number(searchParams.get("plan_id"));

        const [statutory] = await Promise.all([prisma.trans_payrolls.findMany({
            where: {
                date_id: dateID,
                trans_benefit_contributions: {
                    some: {
                        deleted_at: null,
                        dim_employee_benefits: {
                            plan_id: plan_id
                        }
                    }
                },

            }, select: {
                trans_employees: {
                    select: {
                        ...employee_basic_details, ref_departments: {
                            select: {
                                name: true
                            }
                        }, ref_job_classes: {
                            select: {
                                name: true
                            }
                        }
                    }
                }, trans_benefit_contributions: {
                    include: {
                        dim_employee_benefits: {
                            include: {
                                ref_benefit_plans: true
                            }
                        }
                    }
                }
            }

        })])


        const result = statutory.map(emp => {
            const statutory = emp.trans_benefit_contributions[0]
            return ({
                id: emp.trans_employees.id,
                name: getEmpFullName(emp.trans_employees),
                department: emp.trans_employees.ref_departments ? emp.trans_employees.ref_departments.name : "",
                job: emp.trans_employees.ref_job_classes ? emp.trans_employees.ref_job_classes.name : "",
                statutory_name: statutory.dim_employee_benefits?.ref_benefit_plans.name,
                ...(statutory.dim_employee_benefits),
                contribution_date: statutory.contribution_date ? toGMT8(statutory.contribution_date).format("YYYY-MM-DD") : "",
                employer_contribution: statutory.employer_contribution,
                employee_contribution: statutory.employee_contribution,
                total_contribution: statutory.total_contribution,

            })
        });

        return NextResponse.json(result)
    } catch (error) {
        return getPrismaErrorMessage(error);
    }
}

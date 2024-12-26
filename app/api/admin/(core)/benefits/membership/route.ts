import {paginateUrl} from "@/server/pagination/paginate-url";
import prisma from "@/prisma/prisma";
import {NextResponse} from "next/server";
import {employee_basic_details} from "@/server/employee-details-map/employee-details-map";
import {getPrismaErrorMessage} from "@/server/errors/server-errors";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {
    Contribution,
    EmployeeBenefit,
    EmployeeBenefitDetails
} from "@/types/benefits/membership/membership-types";
import {toGMT8} from "@/lib/utils/toGMT8";
import {ContributionType} from "@/types/benefits/plans/plansTypes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        // Pagination details
        const {page, perPage} = paginateUrl(request.url);

        const [members, distinctEmployeeCount] = await Promise.all([
            prisma.dim_employee_benefits.findMany({
                distinct: ["employee_id"],
                orderBy: {
                    updated_at: "desc",
                },
                select: {
                    employee_id: true,
                },
                skip: (page - 1) * perPage,
                take: perPage,
            }),
            prisma.dim_employee_benefits.groupBy({
                by: ["employee_id"],
            }),


        ])


        const employeeMemberships = await prisma.trans_employees.findMany({
            where: {
                id: {
                    in: members.map((item) => item.employee_id),
                }
            }, select: {
                ...employee_basic_details,
                ref_departments:{
                    select: {
                        name: true
                    }
                },
                ref_employment_status: {
                    select: {
                        name: true
                    }
                },
                ref_job_classes: {
                    select: {
                        name: true
                    }
                },
                dim_employee_benefits: {
                    select: {
                        id: true,
                        enrollment_date: true,
                        coverage_amount: true,
                        contribution_amount: true,
                        coverage_amount_type: true,
                        terminated_at: true,
                        ref_benefit_plans: {
                            select: {
                                id: true, name: true, type: true, effective_date: true, expiration_date: true, deduction_id: true
                            },
                        },
                    },
                },
            },
        })

        const salaryGrades = await prisma.ref_salary_grades.findMany({
            where: {
                trans_employees: {
                    some: {
                        id: {in: employeeMemberships.map((item) => item.id)},
                    },
                },
            }, select: {
                amount: true, trans_employees: {select: {id: true}},
            },
        });

        const employeeSalaryMap: { [key: number]: number } = {};
        salaryGrades.forEach((salaryGrade) => {
            salaryGrade.trans_employees.forEach((employee) => {
                employeeSalaryMap[employee.id] = salaryGrade.amount.toNumber();
            });
        });

        const contributions = await prisma.ref_benefits_contribution_table.findMany({
            where: {
                OR: employeeMemberships.map((item) => {
                    if(item.id == 29){

                        // console.dir(item, {depth: 3})
                        console.log("Id: ", item.dim_employee_benefits.map((benefit) => benefit.ref_benefit_plans.id))
                        console.log("Result: ", 100 <= 14000 || 1000 >= 14000)
                    }
                    return({
                    AND: [{min_salary: {lte: employeeSalaryMap[item.id] || 0}}, {max_salary: {gte: employeeSalaryMap[item.id] || 0}}, {plan_id: {in: item.dim_employee_benefits.map((benefit) => benefit.ref_benefit_plans.id)}},],
                })}),
            }, select: {
                id: true,
                plan_id: true,
                employee_rate: true,
                contribution_type: true,
                actual_contribution_amount: true,
                min_salary: true,
                max_salary: true,
            },
        });

        // console.log("Contribution: ", employeeMemberships.filter(item => item.id === 29))
        const membershipWithContributions: EmployeeBenefitDetails[] = employeeMemberships.map((employee) => {
            const benefitsWithContributions: EmployeeBenefit[] = employee.dim_employee_benefits.map((benefit) => {

                const relatedContributions: Contribution = contributions.filter((contribution) => contribution.plan_id === benefit.ref_benefit_plans.id && contribution.min_salary?.toNumber()! <= (employeeSalaryMap[employee.id] || 0) && contribution.max_salary?.toNumber()! >= (employeeSalaryMap[employee.id] || 0)).map(contribution => {
                    return {
                        id: contribution.id!,
                        plan_id: contribution.plan_id!,
                        employee_rate: contribution.employee_rate.toNumber(),
                        contribution_type: contribution.contribution_type!,
                        actual_contribution_amount: contribution.actual_contribution_amount?.toNumber() || null,
                        min_salary: contribution.min_salary?.toNumber()!,
                        max_salary: contribution.max_salary?.toNumber()!
                    }
                })[0];
                return {
                    id: benefit.id,
                    deduction_id: benefit.ref_benefit_plans.deduction_id!,
                    enrollment_date: toGMT8(benefit.enrollment_date).toISOString(), // Convert to GMT+8 timezone
                    coverage_amount: benefit.coverage_amount.toNumber(),
                    contribution_amount: benefit.contribution_amount.toNumber(),
                    coverage_amount_type: benefit.coverage_amount_type as Omit<ContributionType, "others">,
                    terminated_at: benefit.terminated_at !== null ? toGMT8(benefit.terminated_at).toISOString() : "",
                    status: benefit.terminated_at === null ? "Active" : "Terminated",
                    benefit_plans: {
                        id: benefit.ref_benefit_plans.id,
                        name: benefit.ref_benefit_plans.name!,
                        type: benefit.ref_benefit_plans.type!,
                        effectiveDate: toGMT8(benefit.ref_benefit_plans.effective_date!).toISOString(), // Convert to GMT+8 timezone
                        expirationDate: toGMT8(benefit.ref_benefit_plans.expiration_date!).toISOString(), // Convert to GMT+8 timezone
                    },
                    contributions: relatedContributions,
                };
            });
            return {
                id: employee.id,
                name: getEmpFullName(employee),
                picture: employee.picture ?? "",
                email: employee.email ?? "",
                department: employee?.ref_departments?.name ?? "",
                job: employee.ref_job_classes?.name ?? "",
                employment_status: employee.ref_employment_status.name,
                salary_grade: employeeSalaryMap[employee.id],
                employee_benefits: benefitsWithContributions
            };
        });

        // console.log("Test: ", employeeMemberships.map((item) => item.dim_employee_benefits.map((benefit) => benefit.ref_benefit_plans.id)))
        return NextResponse.json({membership: membershipWithContributions, total: distinctEmployeeCount.length}, {status: 200});
    } catch (err) {
        console.error(err);
        return getPrismaErrorMessage(err);
    }
}

import {NextRequest, NextResponse} from "next/server";
import {getPrismaErrorMessage} from "@/server/errors/server-errors";
import prisma from "@/prisma/prisma";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {employee_basic_details} from "@/server/employee-details-map/employee-details-map";
import {toGMT8} from "@/lib/utils/toGMT8";
import {capitalize} from "@nextui-org/shared-utils";
import {Benefit, ContributionSetting} from "@/helper/payroll/calculations";
import {ContributionType} from "@/types/benefits/plans/plansTypes";
import {EmployeeContribution} from "@/types/report/benefits/contribution-types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const {searchParams} = new URL(req.url);
        const dateID = Number(searchParams.get("date"));
        const plan_id = Number(searchParams.get("plan_id"));

        // Validate input parameters
        if (isNaN(dateID) || isNaN(plan_id)) {
            return NextResponse.json({error: "Invalid date or plan_id"}, {status: 400});
        }

        // Fetch data from Prisma
        const statutory = await prisma.trans_payrolls.findMany({
            where: {
                date_id: dateID, trans_benefit_contributions: {
                    some: {
                        deleted_at: null, employee_benefit_id: plan_id,
                    },
                },
            }, select: {
                trans_employees: {
                    select: {
                        ...employee_basic_details,
                        ref_departments: {select: {name: true}},
                        ref_job_classes: {select: {name: true}},
                        ref_employment_status: {select: {name: true}},
                        ref_salary_grades: {select: {amount: true}},
                    },
                }, trans_benefit_contributions: {
                    where: {employee_benefit_id: plan_id}, include: {
                        ref_benefit_plans: {
                            include: {
                                ref_benefits_contribution_table: true,
                            },
                        },
                    },
                },
            },
        });

        // Reshape the data
        const result = statutory.map((emp) => {
            const contribution = emp.trans_benefit_contributions[0];
            if (!contribution) return []; // Skip if no contribution data

            const salary = emp.trans_employees.ref_salary_grades?.amount.toNumber() ?? 0;
            const rates = contribution.ref_benefit_plans?.ref_benefits_contribution_table.find((bracket) => bracket?.min_salary?.lessThanOrEqualTo(salary) && bracket?.max_salary?.greaterThan(salary));

            // const sss = rates && {
            //     monthly_credit:
            // }

            // const breakdownRates: ContributionSetting = {
            //     id: contribution.ref_benefit_plans?.id!,
            //     deduction_id: contribution.ref_benefit_plans?.deduction_id!,
            //     name: contribution.ref_benefit_plans?.name!,
            //     ref_benefits_contribution_table: contribution.ref_benefit_plans?.ref_benefits_contribution_table.map(contribution => ({
            //         employee_rate: contribution.employee_rate.toNumber(),
            //         employer_rate: contribution.employee_rate.toNumber(),
            //         min_salary: contribution.min_salary?.toNumber()!,
            //         max_salary: contribution.max_salary?.toNumber()!,
            //         min_MSC: contribution.min_MSC?.toNumber()!,
            //         max_MSC: contribution.max_MSC?.toNumber()!,
            //         msc_step: contribution.msc_step?.toNumber()!,
            //         ec_threshold: contribution.ec_threshold?.toNumber()!,
            //         ec_low_rate: contribution.ec_low_rate?.toNumber()!,
            //         ec_high_rate: contribution.ec_high_rate?.toNumber()!,
            //         wisp_threshold: contribution.wisp_threshold?.toNumber()!,
            //         actual_contribution_amount: contribution.actual_contribution_amount?.toNumber()!,
            //         contribution_type: contribution.contribution_type as ContributionType,
            //     })) || []
            // }
            // const breakdowns = new Benefit(breakdownRates)

            return {
                id: emp.trans_employees.id,
                name: getEmpFullName(emp.trans_employees),
                department: emp.trans_employees.ref_departments?.name ?? "",
                job: emp.trans_employees.ref_job_classes?.name ?? "",
                appointment_status: emp.trans_employees.ref_employment_status.name,
                salary: salary,
                statutory_name: contribution.ref_benefit_plans?.name ?? "",
                contribution_date: contribution.contribution_date ? toGMT8(contribution.contribution_date).format("YYYY-MM-DD") : "",
                contribution_type: rates?.contribution_type ? capitalize(rates.contribution_type) : "",
                employer_contribution: contribution.employer_contribution ? contribution.employer_contribution.toNumber() : 0,
                employee_contribution: contribution.employee_contribution ? contribution.employee_contribution.toNumber() : 0,
                total_contribution: contribution.total_contribution ? contribution.total_contribution.toNumber() : 0,
                // employee_contribution_rate: rates?.employee_rate ?? 0,
                // breakdown: breakdowns.getBreakdown(salary),
                // employer_contribution_rate: rates?.employer_rate ?? 0,
            };
        }).filter(Boolean) ||  []; // Remove null entries

        return NextResponse.json(result as EmployeeContribution[]);
    } catch (error) {
        return getPrismaErrorMessage(error);
    }
}
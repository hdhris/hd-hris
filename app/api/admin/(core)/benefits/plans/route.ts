import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import paginationHandler from "@/server/pagination/paginate"; // Reusable pagination handler
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {paginateUrl} from "@/server/pagination/paginate-url";
import {Decimal} from "@prisma/client/runtime/library";
import dayjs from "dayjs";
import {BenefitPlan} from "@/types/benefits/plans/plansTypes";
import {EmployeeDetails} from "@/types/employeee/EmployeeType";
import {getPrismaErrorMessage} from "@/server/errors/server-errors";

export const dynamic = "force-dynamic";

interface SalaryPlan {
    id: number;
    employee_rate: Decimal;
    employer_rate: Decimal;
    min_salary: Decimal;
    max_salary: Decimal;
    min_MSC: Decimal;
    max_MSC: Decimal;
    msc_step: Decimal;
    ec_threshold: Decimal;
    ec_low_rate: Decimal;
    ec_high_rate: Decimal;
    wisp_threshold: Decimal;
    created_at: string;
    updated_at: string;
    plan_id: number;
    contribution_type: string,
    actual_contribution_amount: Decimal
}

interface PlansDataProps {
    id: number;
    name: string;
    type: string;
    eligibility_criteria_json: string;
    coverage_details: string;
    effective_date: string;
    expiration_date: string;
    description: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    is_active: boolean;
    ref_benefits_contribution_table: SalaryPlan[];
    deduction_id: number;
}

export async function GET(request: Request) {
    try {
        const {page, perPage} = paginateUrl(request.url);

        const {data, totalItems, currentPage} = await paginationHandler.getPaginatedData<PlansDataProps>({
            model: prisma.ref_benefit_plans,
            page,
            perPage,
            whereCondition: {deleted_at: null},
            include: {ref_benefits_contribution_table: true},
            orderBy: {updated_at: "desc"},
        });

        // Fetch employee enrollments and employee details concurrently
        const [employeeEnrollments, employees] = await Promise.all([prisma.dim_employee_benefits.groupBy({
            by: ["plan_id", "employee_id"], where: {terminated_at: null},
        }), prisma.trans_employees.findMany({
            select: {
                id: true,
                first_name: true,
                last_name: true,
                middle_name: true,
                prefix: true,
                suffix: true,
                extension: true,
                picture: true,
            }, where: {deleted_at: null},
        }),]);

        // Create a map for employees by plan_id for faster lookup
        const employeeMap = new Map<number, number[]>();
        employeeEnrollments.forEach((enrollment) => {
            const {plan_id, employee_id} = enrollment;
            if (plan_id !== null && employee_id !== null) {
                if (!employeeMap.has(plan_id)) {
                    employeeMap.set(plan_id, []);
                }
                employeeMap.get(plan_id)!.push(employee_id);
            }
        });


        // Map the benefit plans with enrolled employee details
        const benefitPlans: BenefitPlan[] = data.map((plan) => {
            const enrolledEmployeeIds = employeeMap.get(plan.id) || [];
            const enrolledEmployees: EmployeeDetails[] = employees
                .filter((emp) => enrolledEmployeeIds.includes(emp.id))
                .map((emp) => ({
                    id: emp.id, name: getEmpFullName(emp), picture: emp.picture ?? "",
                }));


            return {
                id: plan.id,
                name: plan.name,
                type: plan.type,
                eligibilityCriteria: plan.eligibility_criteria_json,
                coverageDetails: plan.coverage_details,
                effectiveDate: dayjs(plan.effective_date).format("YYYY-MM-DD"),
                expirationDate: dayjs(plan.expiration_date).format("YYYY-MM-DD"),
                description: plan.description,
                isActive: plan.is_active,
                createdAt: plan.created_at,
                updatedAt: plan.updated_at,
                employees_avails: enrolledEmployees,
                deduction_id: plan.deduction_id,
                benefitAdditionalDetails: plan.ref_benefits_contribution_table.map((details) => ({
                    id: details.id,
                    employeeContribution: details.employee_rate?.toNumber() ?? 0,
                    employerContribution: details.employer_rate?.toNumber() ?? 0,
                    planId: details.plan_id,
                    minSalary: details.min_salary?.toNumber() ?? 0,
                    maxSalary: details.max_salary?.toNumber() ?? 0,
                    minMSC: details.min_MSC?.toNumber() ?? 0,
                    maxMSC: details.max_MSC?.toNumber() ?? 0,
                    mscStep: details.msc_step?.toNumber() ?? 0,
                    ecThreshold: details.ec_threshold?.toNumber() ?? 0,
                    ecLowRate: details.ec_low_rate?.toNumber() ?? 0,
                    ecHighRate: details.ec_high_rate?.toNumber() ?? 0,
                    wispThreshold: details.wisp_threshold?.toNumber() ?? 0,
                    contributionType: details.contribution_type,
                    actualContributionAmount: details.actual_contribution_amount?.toNumber() ?? 0,
                })),
            };
        });

        return NextResponse.json({
            data: benefitPlans, totalItems, currentPage,
        });
    } catch (err) {
        console.error("Error: ", err);
        return getPrismaErrorMessage(err);
    }
}

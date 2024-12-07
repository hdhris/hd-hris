import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import paginationHandler from "@/server/pagination/paginate"; // Reusable pagination handler
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { paginateUrl } from "@/server/pagination/paginate-url";
import { Decimal } from "@prisma/client/runtime/library";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

interface SalaryPlan {
    id: number;
    employee_rate: Decimal;
    employer_rate: Decimal;
    min_salary: number;
    max_salary: number;
    min_MSC: number;
    max_MSC: number;
    msc_step: number;
    ec_threshold: number;
    ec_low_rate: number;
    ec_high_rate: number;
    wisp_threshold: number;
    created_at: string;
    updated_at: string;
    plan_id: number;
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
        const { page, perPage } = paginateUrl(request.url);

        const { data, totalItems, currentPage } = await paginationHandler.getPaginatedData<PlansDataProps>({
            model: prisma.ref_benefit_plans,
            page,
            perPage,
            whereCondition: { deleted_at: null },
            include: { ref_benefits_contribution_table: true },
            orderBy: { created_at: "asc" },
        });

        // Fetch employee enrollments and employee details concurrently
        const [employeeEnrollments, employees] = await Promise.all([
            prisma.dim_employee_benefits.groupBy({
                by: ["plan_id", "employee_id"],
                where: { terminated_at: null },
            }),
            prisma.trans_employees.findMany({
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    middle_name: true,
                    prefix: true,
                    suffix: true,
                    extension: true,
                    picture: true,
                },
                where: { deleted_at: null },
            }),
        ]);

        // Create a map for employees by plan_id for faster lookup
        const employeeMap = new Map<number, number[]>();
        employeeEnrollments.forEach((enrollment) => {
            const { plan_id, employee_id } = enrollment;
            if (plan_id !== null && employee_id !== null) {
                if (!employeeMap.has(plan_id)) {
                    employeeMap.set(plan_id, []);
                }
                employeeMap.get(plan_id)!.push(employee_id);
            }
        });

        // Map the benefit plans with enrolled employee details
        const benefitPlans = data.map((plan) => {
            const enrolledEmployeeIds = employeeMap.get(plan.id) || [];
            const enrolledEmployees = employees
                .filter((emp) => enrolledEmployeeIds.includes(emp.id))
                .map((emp) => ({
                    id: emp.id,
                    name: getEmpFullName(emp),
                    picture: emp.picture,
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
                    employeeContribution: details.employee_rate.toNumber(),
                    employerContribution: details.employer_rate.toNumber(),
                    planId: details.plan_id,
                    minSalary: details.min_salary,
                    maxSalary: details.max_salary,
                    minMSC: details.min_MSC,
                    maxMSC: details.max_MSC,
                    mscStep: details.msc_step,
                    ecThreshold: details.ec_threshold,
                    ecLowRate: details.ec_low_rate,
                    ecHighRate: details.ec_high_rate,
                    wispThreshold: details.wisp_threshold,
                }))[0],
            };
        });

        return NextResponse.json({
            data: benefitPlans,
            totalItems,
            currentPage,
        });
    } catch (err) {
        console.error("Error: ", err);
        return NextResponse.json({ error: err || "Internal Server Error" }, { status: 500 });
    }
}

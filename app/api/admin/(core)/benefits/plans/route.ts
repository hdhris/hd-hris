import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import paginationHandler from "@/server/pagination/paginate"; // Import the reusable function
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {paginateUrl} from "@/server/pagination/paginate-url";
import {Decimal} from "@prisma/client/runtime/library";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

interface SalaryPlan {
    id: number;
    min_salary: number;
    max_salary: number;
    min_MSC: number;
    max_MSC: number;
    msc_step: number;
    ec_threshold: number;
    ec_low_rate: number;
    ec_high_rate: number;
    wisp_threshold: number;
    created_at: string; // ISO 8601 formatted date
    updated_at: string; // ISO 8601 formatted date
    plan_id: number;
}

interface PlansDataProps {
    id: number;
    name: string;
    type: string;
    eligibility_criteria_json: string;
    coverage_details: string;
    employer_contribution: Decimal;
    employee_contribution: Decimal;
    effective_date: string; // ISO date string
    expiration_date: string; // ISO date string
    description: string;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    deleted_at?: string | null; // ISO date string or null
    is_active: boolean;
    ref_benefits_contribution_advance_settings: SalaryPlan[]
    deduction_id: number
}

export async function GET(request: Request) {
    try {
        const {page, perPage} = paginateUrl(request.url)

        const {data, totalItems, currentPage} = await paginationHandler.getPaginatedData<PlansDataProps>({
            model: prisma.ref_benefit_plans, page, perPage, whereCondition: {
                deleted_at: null
            }, include: {
                ref_benefits_contribution_advance_settings: true
            }, orderBy: {
                created_at: "asc"
            }
        })

        // Fetch associated employees concurrently
        const [employeeEnrollments, employees] = await Promise.all([prisma.dim_employee_benefits.groupBy({
            by: ["plan_id", "employee_id"], where: {
                employee_id: {not: null}, terminated_at: null
            },
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
            }, where: {
                deleted_at: null,
            },
        }),]);

        // Create a map for employees by plan_id for faster lookup
        const employeeMap = new Map<number, number[]>();
        employeeEnrollments.forEach(enrollment => {
            if (enrollment.plan_id !== null && enrollment.employee_id !== null) {
                const planId = enrollment.plan_id as number;
                const employeeId = enrollment.employee_id as number;

                if (employeeMap.has(planId)) {
                    employeeMap.get(planId)?.push(employeeId);
                } else {
                    employeeMap.set(planId, [employeeId]);
                }
            }
        });

// Map the benefit plans with enrolled employee details
        const benefitPlans = data.map(plan => {
            const enrolledEmployeeIds = employeeMap.get(plan.id) || [];
            const enrolledEmployees = employees
                .filter(emp => enrolledEmployeeIds.includes(emp.id))
                .map(emp => ({
                    id: emp.id, name: getEmpFullName(emp), picture: emp.picture,
                }));

            return {
                benefitAdditionalDetails: plan.ref_benefits_contribution_advance_settings.map(details => ({
                    id: details.id,
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
                coverageDetails: plan.coverage_details,
                description: plan.description,
                effectiveDate: dayjs(plan.effective_date).format('YYYY-MM-DD'),
                eligibilityCriteria: plan.eligibility_criteria_json,
                employeeContribution: plan.employee_contribution.toNumber(),
                employerContribution: plan.employer_contribution.toNumber(),
                expirationDate: dayjs(plan.expiration_date).format('YYYY-MM-DD'),
                id: plan.id,
                name: plan.name,
                type: plan.type,
                isActive: plan.is_active,
                createdAt: plan.created_at,
                updatedAt: plan.updated_at,
                employees_avails: enrolledEmployees,  // Added property for enrolled employees
                deduction_id: plan.deduction_id
            };
        });

        return NextResponse.json({
            data: benefitPlans, totalItems, currentPage,
        });

//         const { data, totalItems, currentPage } = await getPaginatedData<LeaveType>(
//             prisma.ref_leave_types,  // The Prisma model
//             page,
//             perPage,
//             { deleted_at: null },  // Filtering condition
//             null,
//             { name: 'asc' }  // Order by name
//         );
//
//         // Fetch employee counts and employee details concurrently
//         // Fetch employee counts and employee details concurrently
//         const [employeeCountData, employees] = await Promise.all([
//             prisma.trans_leaves.groupBy({
//                 by: ["type_id", "employee_id"],
//                 where: {
//                     employee_id: {
//                         not: null,
//                     },
//                 },
//             }),
//             prisma.trans_employees.findMany({
//                 select: {
//                     id: true,
//                     first_name: true,
//                     last_name: true,
//                     middle_name: true,
//                     prefix: true,
//                     suffix: true,
//                     extension: true,
//                     picture: true,
//                 },
//                 where: {
//                     deleted_at: null,
//                 },
//             }),
//         ]);
//
// // Create a map for current employees by type_id for faster lookup
//         const employeeMap = new Map<number, number[]>();
//
// // Populate the map with employee IDs grouped by type_id
//         employeeCountData.forEach(empCount => {
//             if (empCount.type_id !== null && empCount.employee_id !== null) {
//                 const typeId = empCount.type_id as number;
//                 const employeeId = empCount.employee_id as number;
//
//                 // If the map already has this type_id, push the employee_id to the existing array
//                 if (employeeMap.has(typeId)) {
//                     employeeMap.get(typeId)?.push(employeeId);
//                 } else {
//                     // Otherwise, create a new array with the employee_id
//                     employeeMap.set(typeId, [employeeId]);
//                 }
//             }
//         });
//
// // Map the leave types with current employee details
//         const result = data.map(leaveType => {
//             const currentEmployeesIds = employeeMap.get(leaveType.id) || [];
//             const empAvails = employees.filter(employee => currentEmployeesIds.includes(employee.id)).map((emp)=> {
//                 return {
//                     id: emp.id,
//                     name: getEmpFullName(emp),
//                     picture: emp.picture
//                 }
//
//             });
//             return {
//                 id: leaveType.id,
//                 name: leaveType.name,
//                 code: leaveType.code,
//                 accrual_frequency: capitalize(leaveType.accrual_frequency),
//                 description: leaveType.description,
//                 accrual_rate: leaveType.accrual_rate,
//                 applicable_to_employee_types: capitalize(leaveType.applicable_to_employee_types),
//                 attachment_required: leaveType.attachment_required,
//                 created_at: leaveType.created_at,
//                 is_active: leaveType.is_active,
//                 max_accrual: leaveType.max_accrual,
//                 max_duration: leaveType.max_duration,
//                 min_duration: leaveType.min_duration,
//                 notice_required: leaveType.notice_required,
//                 paid_leave: leaveType.paid_leave,
//                 updated_at: leaveType.updated_at,
//                 carry_over: leaveType.carry_over,
//                 current_employees: empAvails,
//             };
//         }) as unknown as BenefitPlan[];
//
//         return NextResponse.json({
//             data: result,
//             currentPage,
//             perPage,
//             totalItems,
//         });
    } catch (err) {
        console.error("Error: ", err);
        return NextResponse.error();
    }
}



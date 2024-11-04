import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { getPaginatedData } from "@/server/pagination/paginate"; // Import the reusable function
import { LeaveType } from "@/types/leaves/LeaveTypes";
import { capitalize } from "@nextui-org/shared-utils";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {paginateUrl} from "@/server/pagination/paginate-url";
import {BenefitAdditionalDetails, BenefitPlan} from "@/types/benefits/plans/plansTypes";
import {undefined} from "zod";
import {toDecimals} from "@/helper/numbers/toDecimals";
import { Decimal } from "@prisma/client/runtime/library";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";


export interface PlansDataProps{
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
    ref_benefits_contribution_advance_settings: BenefitAdditionalDetails[]
}
export async function GET(request: Request) {
    try {
        const {page, perPage} = paginateUrl(request.url)

        // const data = await prisma.ref_benefit_plans.findMany({
        //     where: {
        //         deleted_at: null
        //     }, include: {
        //         ref_benefits_contribution_advance_settings: true
        //     }
        // })
        // Prisma model
        const { data, totalItems, currentPage } = await getPaginatedData<PlansDataProps>(
            prisma.ref_benefit_plans,  // The Prisma model
            page,
            perPage,
            { deleted_at: null },  // Filtering condition
            // {benefits_contribution_advance_settings: true},
            {
                ref_benefits_contribution_advance_settings: true
            },
            { created_at: 'asc' }  // Order by name
        );

        const benefitPlans = data.map((plan):  BenefitPlan => {
            return {
                benefitAdditionalDetails: plan.ref_benefits_contribution_advance_settings[0],
                coverageDetails: plan.coverage_details,
                description: plan.description,
                effectiveDate:  dayjs(plan.effective_date).format("YYYY-MM-DD"),
                eligibilityCriteria: plan.eligibility_criteria_json,
                employeeContribution: toDecimals(plan.employee_contribution),
                employerContribution: toDecimals(plan.employer_contribution),
                expirationDate: dayjs(plan.expiration_date).format("YYYY-MM-DD"),
                id: plan.id,
                name: plan.name,
                type: plan.type,
                isActive: plan.is_active,
                createdAt: plan.created_at,
                updatedAt: plan.updated_at
            }
        })
        return NextResponse.json({
            data: benefitPlans,
            totalItems,
            currentPage
        });
        // Use the reusable pagination function with Prisma model
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

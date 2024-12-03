import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { getPaginatedData } from "@/server/pagination/paginate"; // Import the reusable function
import { LeaveType } from "@/types/leaves/LeaveTypes";
import { capitalize } from "@nextui-org/shared-utils";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');  // Default to page 1
        const perPage = parseInt(searchParams.get('limit') || '15');  // Default to 15 results per page

        // Use the reusable pagination function with Prisma model
        // const { data, totalItems, currentPage } = await getPaginatedData<LeaveType>(
        //     prisma.trans_leave_types,  // The Prisma model
        //     page,
        //     perPage,
        //     { deleted_at: null },  // Filtering condition
        //     null,
        //     { created_at: 'asc' }  // Order by name
        // );



        // Fetch employee counts and employee details concurrently
        // Fetch employee counts and employee details concurrently
        const [data, total_items, employeeCountData, employees] = await Promise.all([
            prisma.trans_leave_types.findMany({
                where: {
                    deleted_at: null,
                },
                select: {
                    id: true,
                    created_at: true,
                    updated_at: true,
                    ref_leave_type_details: true,
                    ref_employment_status: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: {
                    updated_at: "desc"
                },
                take: perPage,
                skip: (page - 1) * perPage
            }),

            prisma.trans_leave_types.count({
                where: {
                    deleted_at: null
                },
            }),
            prisma.trans_leaves.groupBy({
                by: ["type_id", "employee_id"],
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
                where: {
                    deleted_at: null,
                },
            }),
        ]);

// Create a map for current employees by type_id for faster lookup
        const employeeMap = new Map<number, number[]>();

// Populate the map with employee IDs grouped by type_id
        employeeCountData.forEach(empCount => {
            if (empCount.type_id !== null && empCount.employee_id !== null) {
                const typeId = empCount.type_id as number;
                const employeeId = empCount.employee_id as number;

                // If the map already has this type_id, push the employee_id to the existing array
                if (employeeMap.has(typeId)) {
                    employeeMap.get(typeId)?.push(employeeId);
                } else {
                    // Otherwise, create a new array with the employee_id
                    employeeMap.set(typeId, [employeeId]);
                }
            }
        });

        // Map the leave types with current employee details
        const result = data.map(leaveType => {
            const currentEmployeesIds = employeeMap.get(leaveType.id) || [];
            const empAvails = employees.filter(employee => currentEmployeesIds.includes(employee.id)).map((emp)=> {
                return {
                    id: emp.id,
                    name: getEmpFullName(emp),
                    picture: emp.picture
                }

            });
            return {
                id: leaveType.id,
                name: leaveType.ref_leave_type_details.name,
                code: leaveType.ref_leave_type_details.code,
                description: leaveType.ref_leave_type_details.description,
                applicable_to_employee_types: capitalize(leaveType.ref_employment_status.name),
                attachment_required: leaveType.ref_leave_type_details.attachment_required,
                created_at: dayjs(leaveType.created_at).format("YYYY-MM-DD"),
                is_active: leaveType.ref_leave_type_details.is_active,
                max_duration: Number(leaveType.ref_leave_type_details.max_duration),
                min_duration: Number(leaveType.ref_leave_type_details.min_duration),
                paid_leave: leaveType.ref_leave_type_details.paid_leave,
                updated_at: dayjs(leaveType.updated_at).format("YYYY-MM-DD"),
                carry_over: leaveType.ref_leave_type_details.carry_over,
                current_employees: empAvails,
            };
        }) as unknown as LeaveType[];

        return NextResponse.json({
            data: result,
            perPage,
            totalItems: total_items,
        });
    } catch (err) {
        console.error("Error: ", err);
        return NextResponse.error();
    }
}

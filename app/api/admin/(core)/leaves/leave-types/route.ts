import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {LeaveType} from "@/types/leaves/LeaveTypes";
import {capitalize} from "@nextui-org/shared-utils";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import dayjs from "dayjs";
import {Logger, LogLevel} from "@/lib/logger/Logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {

        const logger = new Logger(LogLevel.DEBUG)
        const {searchParams} = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');  // Default to page 1
        const perPage = parseInt(searchParams.get('limit') || '15');  // Default to 15 results per page


        // Fetch employee counts and employee details concurrently
        const [data, total_items, employeeCountData, employees] = await Promise.all([prisma.ref_leave_type_details.findMany({
            where: {
                trans_leave_types: {
                    some: {
                        deleted_at: null
                    }
                },
            }, include: {
                trans_leave_types: {
                    include: {
                        ref_employment_status: {
                            select: {
                                id: true, name: true
                            }
                        }
                    }
                },
            }, orderBy: {
                updated_at: "desc"
            }, take: perPage, skip: (page - 1) * perPage
        }),

            prisma.ref_leave_type_details.count({
                where: {
                    trans_leave_types: {
                        some: {
                            deleted_at: null
                        }
                    }
                },
            }), prisma.trans_leaves.groupBy({
                by: ["leave_type_id", "employee_id"],
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

        console.log("Data: ", data)

// Create a map for current employees by type_id for faster lookup
        const employeeMap = new Map<number, number[]>();

// Populate the map with employee IDs grouped by type_id
        employeeCountData.forEach(empCount => {
            if (empCount.leave_type_id !== null && empCount.employee_id !== null) {
                const typeId = empCount.leave_type_id as number;
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
            const empAvails = employees.filter(employee => currentEmployeesIds.includes(employee.id)).map((emp) => {
                return {
                    id: emp.id, name: getEmpFullName(emp), picture: emp.picture
                }

            });

            // const employmentStatus = leaveType.trans_leave_types.filter(item => item.ref_employment_status);
            // if (employmentStatus) {
            //     logger.debug(employmentStatus);
            // } else {
            //     logger.debug("No matching employment status found");
            // }
            return {
                id: leaveType.id,
                name: leaveType.name,
                code: leaveType.code,
                description: leaveType.description,
                applicable_to_employee_types: {
                    id: leaveType.is_applicable_to_all ? "all" : leaveType.trans_leave_types.find(item => item.ref_employment_status.id)?.ref_employment_status.id,
                    name: leaveType.is_applicable_to_all ? "all" : leaveType.trans_leave_types.find(item => item.ref_employment_status.name)?.ref_employment_status.name || ""
                },
                attachment_required: leaveType.attachment_required,
                created_at: dayjs(leaveType.created_at).format("YYYY-MM-DD"),
                is_active: leaveType.is_active,
                max_duration: Number(leaveType.max_duration),
                min_duration: Number(leaveType.min_duration),
                paid_leave: leaveType.paid_leave,
                updated_at: dayjs(leaveType.updated_at).format("YYYY-MM-DD"),
                carry_over: leaveType.carry_over,
                current_employees: empAvails,
            };
        }) as unknown as LeaveType[];

        return NextResponse.json({
            data: result, perPage, totalItems: total_items,
        });


    } catch (err) {
        console.error("Error: ", err);
        return NextResponse.error();
    }
}

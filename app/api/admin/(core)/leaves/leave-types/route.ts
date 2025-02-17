import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {LeaveType} from "@/types/leaves/LeaveTypes";
import {capitalize} from "@nextui-org/shared-utils";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import dayjs from "dayjs";
import {Logger, LogLevel} from "@/lib/logger/Logger";
import {getPrismaErrorMessage} from "@/server/errors/server-errors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {

        const logger = new Logger(LogLevel.DEBUG)
        const {searchParams} = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');  // Default to page 1
        const perPage = parseInt(searchParams.get('limit') || '15');  // Default to 15 results per page


        // Fetch employee counts and employee details concurrently
        const [data, total_items, employeeCountData, employees] = await Promise.all([
            prisma.ref_leave_type_details.findMany({
                where: {
                    trans_leave_types: {
                        some: {
                            deleted_at: null, // Only include records where deleted_at is null
                        },
                    },
                },
                include: {
                    trans_leave_types: {
                        where: {
                            deleted_at: null, // Ensure only non-deleted records are included in the nested query
                        },
                        include: {
                            ref_employment_status: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    updated_at: "desc", // Sort by updated_at in descending order
                },
                take: perPage, // Limit the number of results per page
                skip: (page - 1) * perPage, // Skip records for pagination
            }),
        prisma.ref_leave_type_details.count({
                where: {
                    trans_leave_types: {
                        some: {
                            deleted_at: null
                        }
                    }
                },
            }),
            prisma.trans_leaves.groupBy({
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

        // console.log("Data: ", data)

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
                    // Otherwise, upsert a new array with the employee_id
                    employeeMap.set(typeId, [employeeId]);
                }

            }
        });

        // Map the leave types with current employee details
        const result = data.map(leaveType => {
            let empId: number[] = []
            leaveType.trans_leave_types.forEach(item => {
                const employee_id = employeeMap.get(item.id) || null
                if(employee_id !== null){
                    empId = [...employee_id]
                }
            })

            const empAvails = employees.filter(employee => empId.includes(employee.id)).map((emp) => {
                return {
                    id: emp.id, name: getEmpFullName(emp), picture: emp.picture
                }

            });

            return {
                id: leaveType.id,
                name: leaveType.name,
                code: leaveType.code,
                description: leaveType.description,
                applicable_to_employee_types: leaveType.trans_leave_types.map(item => ({
                        id: item.ref_employment_status.id,
                        name: item.ref_employment_status.name
                    })),
                attachment_required: leaveType.attachment_required,
                created_at: dayjs(leaveType.created_at).format("YYYY-MM-DD"),
                is_active: leaveType.is_active,
                max_duration: Number(leaveType.max_duration),
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
        return getPrismaErrorMessage(err);
    }
}

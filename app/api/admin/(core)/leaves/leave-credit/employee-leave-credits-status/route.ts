import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {LeaveTypeForEmployee} from "@/types/leaves/LeaveTypes";
import {Logger, LogLevel} from "@/lib/logger/Logger";
import {Employee} from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const logger = new Logger(LogLevel.DEBUG)
        // Fetch current year leave balances where deleted_at is null
        const leave_balances = await prisma.dim_leave_balances.findMany({
            where: {
                deleted_at: null, year: new Date().getFullYear(), // Only balances for the current year
            },
        });

        // Fetch employees who do not have leave balances for the current year
        const [employees, leave_types] = await Promise.all([prisma.trans_employees.findMany({
            where: {
                deleted_at: null, // Exclude deleted employees
                id: {
                    notIn: leave_balances.map((leave_balance) => leave_balance.employee_id), // Exclude employees with leave balances
                },
            }, include: {
                ref_departments: true, // Include department data
                ref_employment_status: {
                    select: {
                        id: true, name: true
                    }
                }
            },
        }), prisma.ref_leave_type_details.findMany({
            where: {
                is_active: true, trans_leave_types: {
                    some: {
                        deleted_at: null
                    }
                }
            }, select: {
                id: true, name: true, trans_leave_types: {
                    select: {
                        ref_employment_status: {
                            select: {
                                name: true,
                            }
                        }
                    }
                }
            },
        })

        ])

        // Format the employee data for a user-friendly response
        const data: Employee[] = employees
                .filter(item => {
                return Array.isArray(item.resignation_json) && item.resignation_json.length === 0  && Array.isArray(item.termination_json)  && item.termination_json.length === 0
            })
            .map((emp: any) => {
                return {
                    id: emp.id, name: getEmpFullName(emp), // Full name formatted from employee data
                    picture: emp.picture, department: emp.ref_departments?.name ?? "No department", // Default to "No department" if department name is missing
                    employment_status: emp.ref_employment_status
                };
            });

        const leave_type_available: LeaveTypeForEmployee[] = leave_types.map(item => {
            return {
                id: item.id,
                name: item.name,
                applicable_to_employee_types: item.trans_leave_types.map(item => item.ref_employment_status.name)
            }
        })


        // logger.debug(leave_type_available)
        return NextResponse.json({
            employees: data, leave_types: leave_type_available
        });
    } catch (error) {
        console.error("Failed to fetch employees or leave balances:", error);

        // Provide user-friendly feedback in case of an error
        return NextResponse.json({
            success: false,
            message: "An error occurred while fetching employee data or leave balances. Please try again later.",
        });
    }
}

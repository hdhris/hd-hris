import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {EmployeeLeaveCredits, LeaveCredits} from "@/types/leaves/leave-credits-types";
import {getEmpFullName} from "@/lib/utils/nameFormatter";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const {searchParams} = new URL(request.url);
        const page = Math.max(Number(searchParams.get("page")) || 1, 1); // Ensure positive page number
        const perPage = Math.max(Number(searchParams.get("limit")) || 5, 1); // Ensure positive limit
        const year = Number(searchParams.get("year")) || new Date().getFullYear();

        const [employees, total_leave_credits, years] = await Promise.all([prisma.dim_leave_balances.findMany({
            where: {
                year, deleted_at: null, trans_employees: {
                    deleted_at: null,
                },
            }, select: {
                trans_employees: {
                    select: {
                        id: true, first_name: true, last_name: true, picture: true, ref_departments: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                id: true,
                allocated_days: true,
                remaining_days: true,
                carry_forward_days: true,
                used_days: true,
                created_at: true,
                updated_at: true,
                ref_leave_types: {
                    select: {
                        id: true, name: true,
                    },
                },
            }, orderBy: {
                updated_at: 'desc',
            }, distinct: ["employee_id"], take: perPage, skip: (page - 1) * perPage,
        }), prisma.dim_leave_balances.groupBy({
            by: ["employee_id"], where: {
                year, deleted_at: null
            },
        }),

            prisma.dim_leave_balances.groupBy({
                by: ["year"]
            })

        ])


        // Group data by employees
        const employeeMap = new Map<any, LeaveCredits>();
        for (const record of employees) {
            const employeeId = record.trans_employees.id;
            if (!employeeMap.has(employeeId)) {
                employeeMap.set(employeeId, {
                    id: employeeId,
                    name: getEmpFullName(record.trans_employees),
                    picture: record.trans_employees.picture,
                    department: record.trans_employees.ref_departments?.name ?? "",
                    leave_balance: [],

                });
            }
            employeeMap?.get(employeeId)?.leave_balance?.push({
                id: record.id,
                allocated_days: record.allocated_days.toNumber(),
                carry_forward_days: record.carry_forward_days.toNumber(),
                remaining_days: record.remaining_days.toNumber(),
                used_days: record.used_days.toNumber(),
                leave_type: {
                    id: record.ref_leave_types.id, name: record.ref_leave_types.name
                }
            });
        }

        // Convert to array for final response
        const groupedData = Array.from(employeeMap.values());


        return NextResponse.json({
            data: groupedData, totalItems: total_leave_credits.length, years: years.map(year => year.year)
        } as EmployeeLeaveCredits);
    } catch (err) {
        console.error("Error: ", err);
        return NextResponse.json({
            error: "Failed to fetch leave credits.", details: err instanceof Error ? err.message : String(err),
        }, {status: 500});
    }
}

import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import {EmployeeLeaveCredits, LeaveCredits} from "@/types/leaves/leave-credits-types";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(Number(searchParams.get("page")) || 1, 1); // Ensure positive page number
        const perPage = Math.max(Number(searchParams.get("limit")) || 5, 1); // Ensure positive limit
        const year = Number(searchParams.get("year")) || new Date().getFullYear();

        const [employees, total_leave_credits] = await Promise.all([prisma.trans_employees.findMany({
            where: {
                deleted_at: null,
                dim_leave_balances: {
                    some: { year },
                },
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                picture: true,
                ref_departments: {
                    select: {
                        name: true,
                    },
                },
                dim_leave_balances: {
                    where: { deleted_at: null },
                    select: {
                        id: true,
                        allocated_days: true,
                        remaining_days: true,
                        carry_forward_days: true,
                        used_days: true,
                        created_at: true,
                        updated_at: true,
                        deleted_at: true,
                        ref_leave_types: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            take: perPage,
            skip: (page - 1) * perPage,
        }),
        prisma.dim_leave_balances.aggregate({
            where: {
                year,
                deleted_at: null
            },
            _count: {
                id: true
            }
        })])



        const employeeLeaveCredits: LeaveCredits[] = employees.map((employee) => {
            // Determine the latest created_at, updated_at, and deleted_at dates
            const { latestCreatedAt, latestUpdatedAt, latestDeletedAt } = employee.dim_leave_balances.reduce(
                (acc, balance) => {
                    acc.latestCreatedAt = new Date(Math.max(acc.latestCreatedAt.getTime(), new Date(balance.created_at!).getTime()));
                    acc.latestUpdatedAt = new Date(Math.max(acc.latestUpdatedAt.getTime(), new Date(balance.updated_at).getTime()));
                    if (balance.deleted_at) {
                        acc.latestDeletedAt = new Date(Math.max(acc.latestDeletedAt?.getTime() || 0, new Date(balance.deleted_at).getTime()));
                    }
                    return acc;
                },
                {
                    latestCreatedAt: new Date(0), // Start from the Unix epoch
                    latestUpdatedAt: new Date(0),
                    latestDeletedAt: null as Date | null,
                }
            );

            return {
                id: employee.id,
                name: getEmpFullName(employee),
                picture: employee.picture,
                department: employee.ref_departments?.name ?? "",
                leave_balance: employee.dim_leave_balances.map((leaveBalance) => ({
                    id: leaveBalance.id,
                    allocated_days: leaveBalance.allocated_days.toNumber(),
                    remaining_days: leaveBalance.remaining_days.toNumber(),
                    carry_forward_days: leaveBalance.carry_forward_days.toNumber(),
                    used_days: leaveBalance.used_days.toNumber(),
                    leave_type: {
                        id: leaveBalance.ref_leave_types.id,
                        name: leaveBalance.ref_leave_types.name,
                    },
                })),
                created_at: latestCreatedAt,
                updated_at: latestUpdatedAt,
                deleted_at: latestDeletedAt,
            };
        });


        return NextResponse.json({ data: employeeLeaveCredits, totalItems: total_leave_credits._count.id } as EmployeeLeaveCredits);
    } catch (err) {
        console.error("Error: ", err);
        return NextResponse.json(
            {
                error: "Failed to fetch leave credits.",
                details: err instanceof Error ? err.message : String(err),
            },
            { status: 500 }
        );
    }
}

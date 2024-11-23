import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { EmployeeLeaveCredits, LeaveCredits } from "@/types/leaves/leave-credits-types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(Number(searchParams.get("page")) || 1, 1); // Ensure positive page number
        const perPage = Math.max(Number(searchParams.get("limit")) || 5, 1); // Ensure positive limit
        const year = Number(searchParams.get("year")) || new Date().getFullYear();

        // Fetch leave credits
        const leave_credits = await prisma.dim_leave_balances.findMany({
            where: {
                year,
                deleted_at: null,
            },
            distinct: ["employee_id"],
            orderBy: { updated_at: "desc" },
            take: perPage,
            skip: (page - 1) * perPage,
        });

        // Total employees and years for metadata
        const [total_items, years] = await Promise.all([
            prisma.dim_leave_balances.groupBy({
                by: ["employee_id"],
                where: { deleted_at: null },
            }),
            prisma.dim_leave_balances.groupBy({
                by: ["year"],
                where: { deleted_at: null },
            }),
        ]);

        // Fetch employee information
        const employeeIds = leave_credits.map((credit) => credit.employee_id);
        const emp_info = await prisma.trans_employees.findMany({
            where: {
                id: { in: employeeIds },
                deleted_at: null,
            },
            select: {
                id: true,
                prefix: true,
                suffix: true,
                extension: true,
                first_name: true,
                last_name: true,
                picture: true,
                ref_departments: { select: { name: true } },
                dim_leave_balances: {
                    select: {
                        id: true,
                        allocated_days: true,
                        remaining_days: true,
                        carry_forward_days: true,
                        used_days: true,
                        created_at: true,
                        updated_at: true,
                        deleted_at: true,
                        ref_leave_types: { select: { id: true, name: true } },
                    },
                },
            },
        });

        // Ensure the order of `leave` matches the reference order in the `data_id`
        const leaveOrder = leave_credits.map(id => id.employee_id); // This is your desired order of IDs for "leave" and "data_id"

        // Map employee and leave data, and sort based on `leaveOrder`
        const values: LeaveCredits[] = emp_info
            .map((emp) => {
                const leave_balance = emp.dim_leave_balances.map((items) => ({
                    id: items.id,
                    allocated_days: items.allocated_days.toNumber(),
                    remaining_days: items.remaining_days.toNumber(),
                    carry_forward_days: items.carry_forward_days.toNumber(),
                    used_days: items.used_days.toNumber(),
                    created_at: items.created_at?.toLocaleTimeString()!,
                    updated_at: items.updated_at?.toLocaleTimeString()!,
                    leave_type: items.ref_leave_types,
                }));

                return {
                    id: emp.id,
                    name: getEmpFullName(emp),
                    picture: emp.picture,
                    department: emp.ref_departments?.name || "",
                    leave_balance,
                };
            })
            .sort((a, b) => {
                // Sorting leave records to match the order of leaveOrder
                return leaveOrder.indexOf(a.id) - leaveOrder.indexOf(b.id);
            });

        // Now that values are sorted, map the `leave_credits` to match the same order
        const sortedLeaveCredits = leave_credits
            .map((credit) => credit.employee_id)
            .sort((a, b) => leaveOrder.indexOf(a) - leaveOrder.indexOf(b));

        // Return the response with sorted data and meta information
        return NextResponse.json({
            data: values,
            meta_data: {
                totalItems: total_items.length,
                years: years.map((item) => item.year),
            },
        } as EmployeeLeaveCredits);


    } catch (err) {
        console.error("Error fetching leave credits: ", err);
        return NextResponse.json(
            {
                error: "Failed to fetch leave credits.",
                details: err instanceof Error ? err.message : String(err),
            },
            { status: 500 }
        );
    }
}

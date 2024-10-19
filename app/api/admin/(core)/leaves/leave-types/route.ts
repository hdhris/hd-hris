import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { LeaveType } from "@/types/leaves/LeaveTypes";
import { capitalize } from "@nextui-org/shared-utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        // Parse query parameters to handle pagination
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1'); // Default to page 1
        const perPage = parseInt(searchParams.get('limit') || '5'); // Number of results per page
        const skip = (page - 1) * perPage; // Calculate the offset

        // Fetch paginated leave types with filtering for `deleted_at`
        const data = await prisma.ref_leave_types.findMany({
            where: {
                deleted_at: null
            },
            orderBy: {
                name: 'asc', // Order by name to assist in grouping
            },
            take: perPage, // Limit the number of records returned
            skip: skip, // Offset based on the current page
        });

        // Group employee count by type_id
        const employee_count_leaves_types = await prisma.trans_leaves.groupBy({
            by: ["type_id"],
            where: {
                employee_id: {
                    not: null
                }
            },
            _count: {
                employee_id: true // Counting distinct employee_id for each type
            }
        });

        const count = await prisma.ref_leave_types.count({
            where: {
                deleted_at: null
            }
        });

        // Map and format the result data
        const result = data.map(leaveType => {
            const countData = employee_count_leaves_types.find((leave) => leave.type_id === leaveType.id);
            return {
                id: leaveType.id,
                name: leaveType.name,
                code: leaveType.code,
                accrual_frequency: capitalize(leaveType.accrual_frequency),
                description: leaveType.description,
                accrual_rate: leaveType.accrual_rate,
                applicable_to_employee_types: capitalize(leaveType.applicable_to_employee_types),
                attachment_required: leaveType.attachment_required,
                created_at: leaveType.created_at,
                is_active: leaveType.is_active,
                max_accrual: leaveType.max_accrual,
                max_duration: leaveType.max_duration,
                min_duration: leaveType.min_duration,
                notice_required: leaveType.notice_required,
                paid_leave: leaveType.paid_leave,
                updated_at: leaveType.updated_at,
                carry_over: leaveType.carry_over,
                employee_count: countData ? countData._count.employee_id : 0
            };
        }) as unknown as LeaveType[];

        // Return paginated and grouped results
        return NextResponse.json({
            data: result,
            total: count
        });
    } catch (err) {
        console.error("Error: ", err);
        return NextResponse.error();
    }
}

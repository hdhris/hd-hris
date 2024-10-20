import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { getPaginatedData } from "@/server/pagination/paginate"; // Import the reusable function
import { LeaveType } from "@/types/leaves/LeaveTypes";
import { capitalize } from "@nextui-org/shared-utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');  // Default to page 1
        const perPage = parseInt(searchParams.get('limit') || '5');  // Default to 5 results per page

        // Use the reusable pagination function with Prisma model
        const { data, totalItems, totalPages, currentPage } = await getPaginatedData<LeaveType>(
            prisma.ref_leave_types,  // The Prisma model
            page,
            perPage,
            { deleted_at: null },  // Filtering condition
            { name: 'asc' }  // Order by name
        );

        // Further processing for employee count, mapping etc.
        const employee_count_leaves_types = await prisma.trans_leaves.groupBy({
            by: ["type_id"],
            where: {
                employee_id: {
                    not: null
                }
            },
            _count: {
                employee_id: true
            }
        });


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

        return NextResponse.json({
            data: result,
            currentPage,
            perPage,
            totalItems,
            // totalPages
        });
    } catch (err) {
        console.error("Error: ", err);
        return NextResponse.error();
    }
}

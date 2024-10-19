import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {LeaveType} from "@/types/leaves/LeaveTypes";
import {capitalize} from "@nextui-org/shared-utils";

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const data = await prisma.ref_leave_types.findMany({
            where: {
                deleted_at: null
            }
        });

        const employee_count_leaves_types = await prisma.trans_leaves.groupBy({
            by: ["type_id"], where: {
                employee_id: {
                    not: null
                }
            }, _count: {
                employee_id: true  // Counting distinct employee_id for each type
            }
        })
        const result = data.map(leaveType => {
            const countData = employee_count_leaves_types.find((leave) => leave.type_id === leaveType.id);
            return {
                id: leaveType.id,
                accrual_frequency: capitalize(leaveType.accrual_frequency), // Adjust as needed for other options
                accrual_rate: leaveType.accrual_rate,
                applicable_to_employee_types: capitalize(leaveType.applicable_to_employee_types), // Adjust if needed
                attachment_required: leaveType.attachment_required,
                code: leaveType.code,
                created_at: leaveType.created_at, // You might consider using Date if you want to handle dates directly
                description: leaveType.description,
                is_active: leaveType.is_active,
                max_accrual: leaveType.max_accrual,
                max_duration: leaveType.max_duration,
                min_duration: leaveType.min_duration,
                name: leaveType.name,
                notice_required: leaveType.notice_required,
                paid_leave: leaveType.paid_leave,
                updated_at: leaveType.updated_at, // Same consideration as created_at
                carry_over: leaveType.carry_over,
                employee_count: countData ? countData._count.employee_id : 0
            };
        }) as unknown as LeaveType[];
        return NextResponse.json(result)
    } catch (err) {
        console.log("Error: ", err)
        return NextResponse.error()
    }


}

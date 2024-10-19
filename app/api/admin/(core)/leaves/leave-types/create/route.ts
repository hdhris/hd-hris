import { hasContentType } from "@/helper/content-type/content-type-check";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export async function POST(request: NextRequest) {
    try {
        hasContentType(request);

        const data = await request.json();

        // Validate the data
        // const validatedData = LeaveTypeSchema.parse(data);

        const isDuplicate = await prisma.ref_leave_types.findFirst({
            where: {
                name: data.name,
            },
        });

        if (isDuplicate) {
            return NextResponse.json({ message: "Leave type already exists." }, { status: 400 });
        }

        // Create a new leave type
        const createdLeaveType = await prisma.ref_leave_types.create({
            data: {
                name: data.name,
                code: data.code,
                description: data.description,
                accrual_rate: data.accrualRate,
                accrual_frequency: data.accrualFrequency,
                max_accrual: data.maxAccrual,
                carry_over: data.carryOver,
                paid_leave: data.paidLeave,
                is_active: data.isActive,
                min_duration: data.minDuration,
                max_duration: data.maxDuration,
                notice_required: data.noticeRequired,
                attachment_required: data.attachmentRequired,
                created_at: new Date(),
                applicable_to_employee_types: data.applicableToEmployeeTypes,
            },
        });

        return NextResponse.json({ message: "Leave type created successfully.", data: createdLeaveType });
    } catch (err) {
        console.error("Error: ", err); // Log the error for debugging

        // Handle validation errors
        // if (err instanceof ZodError) {
        //     return NextResponse.json({ message: "Validation error", errors: err.errors }, { status: 400 });
        // }

        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}

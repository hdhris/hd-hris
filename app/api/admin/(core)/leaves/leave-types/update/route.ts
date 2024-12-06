import {NextRequest, NextResponse} from "next/server";
import {hasContentType} from "@/helper/content-type/content-type-check";
import {LeaveTypeSchema} from "@/helper/zodValidation/leaves/leave-types-form/LeaveTypesForm";
import prisma from "@/prisma/prisma";

export async function POST(request: NextRequest) {
    try {
        // Ensure the request has the correct content type
        hasContentType(request)

        const data = await request.json();
        const parsedData = LeaveTypeSchema.safeParse(data);

        // Validate data using Zod schema
        if (!parsedData.success) {
            return NextResponse.json({
                error: "Invalid input data.",
                details: parsedData.error.flatten()
            }, {status: 400});
        }

        const leaveTypeData = {
            name: data.name,
            code: data.code,
            description: data.description,
            carry_over: data.carryOver,
            paid_leave: data.paidLeave,
            is_active: data.isActive,
            min_duration: data.minDuration,
            max_duration: data.maxDuration,
            applicable_to_employee_types: data.applicableToEmployeeTypes,
        };

        // Perform the update operation
        await prisma.ref_leave_type_details.update({
            where: {id: data.id},
            data: {
                ...leaveTypeData, updated_at: new Date(),
            }
        });


        // Return a success response
        return NextResponse.json({
            message: "Leave type saved successfully.",
        }, {status: 200});

    } catch (error: any) {
        // Handle unexpected errors
        console.error("Error:", error);
        return NextResponse.json({
            error: "An error occurred while processing your request. Please try again later.", details: error.message,
        }, {status: 500});
    }
}

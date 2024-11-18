import { NextRequest, NextResponse } from "next/server";
import { hasContentType } from "@/helper/content-type/content-type-check";
import { LeaveCreditFormSchema } from "@/helper/zodValidation/leaves/leave-credits-form/leave-credit-form-schema";
import prisma from "@/prisma/prisma";

export async function POST(req: NextRequest) {
    try {
        hasContentType(req); // Check if the request has the correct content type

        const data = await req.json(); // Parse the incoming JSON data


        // Validate the incoming data using the Zod schema
        const parsedData = LeaveCreditFormSchema.safeParse(data);
        // console.log("Parsed: ", parsedData.data?.leave_credits.map(item => Number(item.leave_type_id)));
        console.log("Parsed: ", parsedData.data);
        if (!parsedData.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation error",
                    errors: parsedData.error.errors.map(error => error.message), // Map to user-friendly error messages
                },
                { status: 400 }
            );
        }

        const addData = [];

        for (let i = 0; i < parsedData.data.leave_credits.length; i++) {
            const leaveType = parsedData.data.leave_credits[i];
            const leaveTypeData = {
                employee_id: parsedData.data.employee_id,
                year: new Date().getFullYear(),
                leave_type_id: Number(leaveType.leave_type_id),
                allocated_days: leaveType.allocated_days,
                remaining_days: leaveType.allocated_days,
                carry_forward_days: leaveType.carry_forward_days,
                created_at: new Date(),
                updated_at: new Date(),
            };
            addData.push(leaveTypeData);
        }


        // Create a new leave balance entry in the database
        await prisma.dim_leave_balances.createMany({
            data: addData
        });

        // Return a success response
        return NextResponse.json({
            success: true,
            message: "Leave credit successfully added!",
        });
    } catch (error) {
        console.error("Error adding leave credit:", error);

        // Return a generic error message for unexpected errors
        return NextResponse.json({
            success: false,
            message: "An unexpected error occurred. Please try again later.",
        }, { status: 500 });
    }
}

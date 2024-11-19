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
        if (!parsedData.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation error",
                    errors: parsedData.error.errors.map((error) => error.message), // Map to user-friendly error messages
                },
                { status: 400 }
            );
        }

        const updatePromises = parsedData.data.leave_credits.map((leaveType, index) => {
            return prisma.dim_leave_balances.update({
                where: {
                    id: data.id[index], // Match the correct ID for each record
                    year: data.year
                },
                data: {
                    year: new Date().getFullYear(),
                    allocated_days: leaveType.allocated_days,
                    remaining_days: leaveType.allocated_days,
                    carry_forward_days: leaveType.carry_forward_days,
                    updated_at: new Date(),
                },
            });
        });

        // Execute all updates
        await Promise.all(updatePromises);

        // Return a success response
        return NextResponse.json({
            success: true,
            message: "Leave credit successfully updated!",
        });
    } catch (error) {
        console.error("Error updating leave credit:", error);

        // Return a generic error message for unexpected errors
        return NextResponse.json(
            {
                success: false,
                message: "An unexpected error occurred. Please try again later.",
            },
            { status: 500 }
        );
    }
}

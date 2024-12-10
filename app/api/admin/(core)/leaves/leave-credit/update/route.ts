import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/prisma/prisma";

// Define the Zod schema for LeaveCreditUpdate validation
const LeaveCreditUpdateSchema = z.array(
    z.object({
        id: z.number().int().positive({ message: "Invalid ID provided." }), // ID must be a positive integer
        leave_type_id: z.number().int().positive({ message: "Invalid leave type ID provided." }), // Leave type ID must be positive
        allocated_days: z.number()
            .min(1, { message: "Allocated days must be at least 1." }) // Allocated days must be at least 1
            .max(365, { message: "Allocated days cannot exceed 365." }), // Example max value for sanity
        carry_forward_days: z.number()
            .min(0, { message: "Carry forward days cannot be negative." }) // Carry forward must be >= 0
            .max(365, { message: "Carry forward days cannot exceed 365." }) // Example max value for sanity
    })
);

export async function POST(req: NextRequest) {
    try {
        // Parse the incoming JSON data
        const data = await req.json();

        // Validate the incoming data against the Zod schema
        const parsedData = LeaveCreditUpdateSchema.parse(data);


        // Perform individual updates for each record
        for (const item of parsedData) {
            await prisma.dim_leave_balances.update({
                where: { id: item.id },
                data: {
                    year: new Date().getFullYear(),
                    allocated_days: item.allocated_days,
                    remaining_days: item.allocated_days,
                    carry_forward_days: item.carry_forward_days ?? 0,
                    updated_at: new Date(),
                },
            });
        }

        // Return a success response
        return NextResponse.json({
            success: true,
            message: "Leave credit successfully updated!",
        });
    } catch (error) {
        console.error("Error updating leave credit:", error);

        if (error instanceof z.ZodError) {
            // Handle Zod validation errors
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation error occurred.",
                    errors: error.errors.map(e => e.message), // Send user-friendly messages from Zod
                },
                { status: 400 }
            );
        }

        // Handle generic errors
        return NextResponse.json(
            {
                success: false,
                message: "An unexpected error occurred. Please try again later.",
            },
            { status: 500 }
        );
    }
}

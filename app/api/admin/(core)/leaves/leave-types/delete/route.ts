import {hasContentType} from "@/helper/content-type/content-type-check";
import {NextRequest, NextResponse} from "next/server";
import {z} from "zod";
import prisma from "@/prisma/prisma";

const LeaveType = z.object({
    id: z.number().min(1, "Id must be greater than 0"),
})

export async function POST(request: NextRequest) {
    try {
        // Check content type
        hasContentType(request);

        // Parse request body
        const data = await request.json();

        console.log(data)
        // Validate using Zod schema
        const parsedData = LeaveType.safeParse(data);

        // Update the leave type to mark as deleted
        const result = await prisma.ref_leave_types.update({
            where: {
                id: data
            },
            data: {
                deleted_at: new Date()
            }
        });

        // Return successful response
        return NextResponse.json({
            success: true,
            message: "Leave type deleted successfully.",
            data: result
        });

    } catch (error: any) {
        let errorMessage = "An unexpected error occurred.";

        // Handle Zod validation errors
        if (error instanceof z.ZodError) {
            errorMessage = error.errors.map(e => e.message).join(", ");
        }
        // Handle Prisma and other errors
        else if (error.code === "P2025") {
            errorMessage = "Leave type not found.";
        } else {
            errorMessage = "There was an issue with the server. Please try again later.";
        }

        // Return user-friendly error message
        return NextResponse.json({
            success: false,
            message: errorMessage
        }, { status: 400 });
    }
}

import {hasContentType} from "@/helper/content-type/content-type-check";
import {NextRequest, NextResponse} from "next/server";
import {z} from "zod";
import prisma from "@/prisma/prisma";


export async function POST(request: NextRequest) {
    try {
        // Check content type
        hasContentType(request);

        // Parse request body
        const data = await request.json();

        // const hasEmployeeAvail = await prisma.trans_leaves.groupBy({
        //     by: ['type_id'],
        //     where: {
        //         employee_id: {
        //             not: null
        //         }
        //     }, _count: {
        //         type_id: true
        //     }
        // })

        console.log("Ids: ", data);

        // Update the leave type to mark as deleted
        await prisma.ref_leave_types.updateMany({
            where: {
                id: {
                    in: data
                }
            },
            data: {
                deleted_at: new Date()
            }
        });

        // Return successful response
        return NextResponse.json({
            success: true,
            message: "Leave type deleted successfully.",
        });

    } catch (error: any) {
        console.log("Error: ", error);
        let errorMessage;

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

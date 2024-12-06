import {hasContentType} from "@/helper/content-type/content-type-check";
import {NextRequest, NextResponse} from "next/server";
import {z} from "zod";
import prisma from "@/prisma/prisma";
import {toGMT8} from "@/lib/utils/toGMT8";


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


        if(data.employee_status_id === "all"){
            await prisma.trans_leave_types.updateMany({
                where: {
                    leave_type_details_id: data.leave_type_id
                },
                data: {
                    deleted_at: toGMT8().toISOString()
                }
            });
        } else{
            await prisma.trans_leave_types.update({
                where: {
                    leave_type_details_id_employment_status_id: {
                        leave_type_details_id: data.leave_type_id,
                        employment_status_id: data.employee_status_id
                    }
                },
                data: {
                    deleted_at: toGMT8().toISOString()
                }
            });

        }
        // Update the leave type to mark as deleted

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

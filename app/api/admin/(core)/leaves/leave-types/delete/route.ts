import {hasContentType} from "@/helper/content-type/content-type-check";
import {NextRequest, NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {toGMT8} from "@/lib/utils/toGMT8";
import {getPrismaErrorMessage} from "@/server/errors/server-errors";

export async function POST(request: NextRequest) {
    try {
        // Check content type
        hasContentType(request);

        // Parse request body
        const data = await request.json();


        // Update leave type to mark as deleted

        await Promise.all([
            prisma.trans_leave_types.updateMany({
                where: {
                    leave_type_details_id: data.leave_type_id, employment_status_id: {
                        in: data.employee_status_id.map((id: { id: any; }) => id.id),
                    },
                }, data: {
                    deleted_at: toGMT8().toISOString(),
                },
            }),
        ])

        // Return successful response (status should be 200 for success)
        return NextResponse.json({success: true, message: "Leave type deleted successfully."}, {status: 200});

    } catch (error: any) {
        // Handle errors and return a meaningful response with the correct status code
        const errorMessage = getPrismaErrorMessage(error);
        console.error("Prisma Error while deleting leave type: ", errorMessage);
        return NextResponse.json({success: false, message: errorMessage}, {status: 500});
    }
}

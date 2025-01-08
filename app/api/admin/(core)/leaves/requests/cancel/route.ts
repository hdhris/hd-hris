import { NextRequest, NextResponse } from "next/server";
import { getPrismaErrorMessage } from "@/server/errors/server-errors";
import { hasContentType } from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { employee_basic_details } from "@/server/employee-details-map/employee-details-map";

export async function POST(req: NextRequest) {
    try {
        // Validate content type
        hasContentType(req);

        // Parse incoming request data
        const data = await req.json();

        // Fetch leave type information
        // Update leave status
        console.log({ data });
        await prisma.trans_leaves.update({
            where: {
                id: data.id,
            },
            data: {
                updated_at: toGMT8().toISOString(),
                status: "cancelled",
                total_days: data.used_leaved
            },
        });
        //
        // // Update leave balance (ensure a valid `where` clause and update logic)

        await prisma.dim_leave_balances.update({
            where: {
                id: data.leave_credit_id, // Assuming `id` is used to identify the leave balance record
            },
            data: {
                used_days: {
                    decrement: data.used_leaved,
                },
                remaining_days: {
                    increment: data.used_leaved,
                },
                updated_at: toGMT8().toISOString(),
            },
        });

        return NextResponse.json({
            success: true,
            message: "Cancel leave request successfully.",
        });
    } catch (error) {
        console.log("Error: ", error);
        return getPrismaErrorMessage(error);
    }
}

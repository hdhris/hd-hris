import {NextRequest, NextResponse} from "next/server";
import {hasContentType} from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import {toGMT8} from "@/lib/utils/toGMT8";
import {getPrismaErrorMessage} from "@/server/errors/server-errors";
export async function POST(req: NextRequest) {
    try {
        hasContentType(req);
        const body = await req.json();


        // const deleteDeduction = prisma.ref_payheads.update({
        //     where: { id: body.deduction_id },
        //     data: {
        //         deleted_at: toGMT8().toISOString()
        //     },
        // });

        const deletePlan = prisma.dim_employee_benefits.update({
            where: { id: body.id },
            data: {
                terminated_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString()
            },
        });

        // Execute only two operations if `advance_setting` is not required
        await prisma.$transaction([deletePlan]);


        return NextResponse.json({ message: "Removing plan successfully" }, { status: 200 });
    } catch (error: unknown) {
        console.error("Error:", error);
        return getPrismaErrorMessage(error);
    }
}
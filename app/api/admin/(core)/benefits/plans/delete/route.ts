import {NextRequest, NextResponse} from "next/server";
import {hasContentType} from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import {toGMT8} from "@/lib/utils/toGMT8";
export async function POST(req: NextRequest) {
    try {
        hasContentType(req);
        const body = await req.json();
        const deleteDeduction = prisma.ref_payheads.update({
            where: { id: body.deduction_id },
            data: {
                deleted_at: toGMT8().toISOString()
            },
        });

        const deletePlan = prisma.ref_benefit_plans.update({
            where: { id: body.id },
            data: {
                deleted_at: toGMT8(new Date()).toISOString(),
            },
        });

            // Execute only two operations if `advance_setting` is not required
            await prisma.$transaction([deleteDeduction, deletePlan]);


        return NextResponse.json({ message: "Plan updated successfully" }, { status: 200 });
    } catch (error: unknown) {
        console.error("Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
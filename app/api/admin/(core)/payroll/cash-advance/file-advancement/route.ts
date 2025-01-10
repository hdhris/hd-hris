import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { getSignatory } from "@/server/signatory";
import { objectExcludes } from "@/helper/objects/filterObject";

export async function POST(req: NextRequest) {
    const data = await req.json();
    // console.log(data);
    try {
        const evaluators = await getSignatory({
            path: "/payroll/cash-advance",
            applicant_id: data.employee_id,
            is_auto_approved: data.is_auto_approved ?? false
        });
        if (!evaluators) {
            return NextResponse.json({ status: 400 });
        }
        await prisma.trans_cash_advances.create({
            data: {
                evaluators: evaluators as unknown as any,
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
                ...objectExcludes(data, ["is_auto_approved"]),
                status: data.is_auto_approved ? "approved" : "pending",
            },
        });
        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Failed to post data" }, { status: 500 });
    }
}

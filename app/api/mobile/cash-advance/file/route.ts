import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { getSignatory } from "@/server/signatory";

export async function POST(req: NextRequest) {
    const data = await req.json();
    //   console.log(data);
    const evaluators = await getSignatory({
        path: "/payroll/cash-advance",
        applicant_id: data.employee_id,
    });
    if (!evaluators) {
        return NextResponse.json({ status: 400 });
    }
    const applicant = evaluators.users.find((user) => user.id === data.employee_id);
    try {
        await prisma.trans_cash_advances.create({
            data: {
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
                status: evaluators.evaluators.every((ev) => ev.decision) ? "approved" : "pending",
                ...data,
            },
        });
        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Failed to post data" }, { status: 500 });
    }
}

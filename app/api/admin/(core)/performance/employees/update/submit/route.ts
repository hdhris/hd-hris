import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { getSignatories, getSignatory } from "@/server/signatory";

export async function POST(req: NextRequest) {
    const { id, employee_id } = await req.json();

    const evaluators = await getSignatories({
        path: "/performance/employees/survey",
        applicant_id: employee_id,
        include_applicant: true,
    });
    if (!evaluators) {
        return NextResponse.json({status: false, message: "Signatories incomplete" },{ status: 400 });
    }

    try {
        await prisma.fact_performance_evaluations.update({
            where: {
                id,
            },
            data: {
                status: "pending",
                evaluator: evaluators as any,
            },
        });
        return NextResponse.json({status: true },{ status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

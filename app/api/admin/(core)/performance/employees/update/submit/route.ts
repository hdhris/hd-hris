import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { getSignatory } from "@/server/signatory";

export async function POST(req: NextRequest) {
    const { id, employee_id } = await req.json();

    const evaluators = await getSignatory("/performance/employees/survey", employee_id, false);
    if (!evaluators) {
        return NextResponse.json({ status: 400 });
    }

    try {
        await prisma.fact_performance_evaluations.update({
            where: {
                id,
            },
            data: {
                evaluator: evaluators as any,
            },
        });
        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

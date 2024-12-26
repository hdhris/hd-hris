import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
    const { id, compentencies_json } = await req.json();
    try {
        await prisma.fact_performance_evaluations.update({
            where: {
                id,
            },
            data: {
                compentencies_json,
                updated_at: toGMT8().toISOString(),
            },
        });
        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

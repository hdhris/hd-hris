// app/api/trainings-and-seminars/employee-records/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, status, feedback } = body;

        const record = await prisma.dim_training_participants.update({
            where: {
                id: parseInt(id),
            },
            data: {
                status,
                feedback,
                updated_at: new Date(),
                ...(status === 'completed' && {
                    terminated_at: new Date()
                })
            }
        });

        return NextResponse.json(record);
    } catch (error) {
        console.error("Error in updating record:", error);
        return NextResponse.json({ error: "Failed to update record: " + error }, { status: 500 });
    }
}
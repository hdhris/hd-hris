import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id } = body;

        await prisma.$transaction([
            prisma.ref_training_programs.update({
                where: {
                    id: id,
                },
                data: {
                    deleted_at: new Date(),
                },
            }),
            prisma.dim_training_participants.deleteMany({
                where: {
                    program_id: id,
                },
            }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete program: " + error }, { status: 500 });
    }
}
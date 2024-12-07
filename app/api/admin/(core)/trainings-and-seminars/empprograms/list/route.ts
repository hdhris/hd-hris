import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";
export async function GET() {
    try {
        const programs = await prisma.ref_training_programs.findMany({
            where: {
                deleted_at: null,
                type: 'training'
            },
            include: {
                dim_training_participants: true,
                trans_employees: {
                    select: {
                        first_name: true,
                        last_name: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return NextResponse.json(programs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch programs: " + error }, { status: 500 });
    }
}
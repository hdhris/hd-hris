import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";

// Fetch attendance logs and organize statuses by date range
export async function GET(req: NextRequest) {
    try {

        const timestamp = await prisma.log_attendances.findFirst({
            select: {
                timestamp: true,
            },
            orderBy: {
                timestamp: 'desc',
            }
        })

        return NextResponse.json({ timestamp: timestamp?.timestamp });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { AttendanceLog } from "@/types/attendance-time/AttendanceTypes";

export async function POST(req: NextRequest) {
    const body = (await req.json()) as AttendanceLog[];
    try {
        const newArray = body.map((item) => ({
            ...item,
            timestamp: toGMT8(item.timestamp).toISOString(),
            created_at: toGMT8().toISOString(),
        }));

        // Perform the transaction
        const createResponse = await prisma.log_attendances.createMany({
            data: newArray,
            // skipDuplicates: true,
        });

        return NextResponse.json({ rowsAffected: createResponse.count }, { status: 200 });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

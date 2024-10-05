
import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";


export async function GET() {
    const data = await prisma.ref_leave_types.findMany({
        where: {
            deleted_at: null
        }, select: {
            duration_days: true,
            id: true,
            name: true,
            code: true,
            is_active: true,
            is_carry_forward: true
        }
    });


    return NextResponse.json(data)
}

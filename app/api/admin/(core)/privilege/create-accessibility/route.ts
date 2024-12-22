import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
    const body = await req.json();
    try {
        const addPrivilege = await prisma.sys_privileges.create({
            data: {
                ...body,
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
            }
        })

        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

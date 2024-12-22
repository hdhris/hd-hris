import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
    const id = await req.json();
    try {
        await prisma.sys_privileges.update({
            where: {
                id,
            },
            data: {
                deleted_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
            }
        })

        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

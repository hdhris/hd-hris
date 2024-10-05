import { hasContentType } from "@/helper/content-type/content-type-check";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export async function POST(request: NextRequest) {
    try {
        hasContentType(request);

        const data = await request.json();

        await prisma.ref_leave_types.create({
            data: {
                name: data.name,
                code: data.code,
                duration_days: Number(data.duration_days),
                created_at: new Date(),
                updated_at: new Date(),
            },
        });

        return NextResponse.json({ message: "Leave type created successfully." });
    } catch (err: any) {
        console.error(err); // Log the error for debugging

        // User-friendly error messages based on the error type


        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

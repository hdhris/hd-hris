
import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);

    const skip = (page - 1) * limit;

    const [emp, totalLeavesType] = await Promise.all([
        await prisma.ref_leave_types.findMany({
            where: {
                is_active: true
            },
            select: {
                id: true,
                name: true,
                duration_days: true
            },
            skip,
            take: limit,
        }),
        await prisma.ref_leave_types.count({
            where: {
                is_active: true
            },
        })
    ])

    const totalPages = Math.ceil(totalLeavesType / limit);

    return NextResponse.json({
        data: emp,
        meta: {
            currentPage: page,
            totalPages
        }
    });
}

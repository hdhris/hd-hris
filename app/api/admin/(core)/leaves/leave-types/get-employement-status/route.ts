import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import {capitalize} from "@nextui-org/shared-utils";

export async function GET() {
    try {
        const employment_status = await prisma.ref_employment_status.findMany({
            where: {
                deleted_at: null,
            },
            select: {
                id: true,
                name: true,
            }
        });

        const data = employment_status.map((item) => ({
            id: item.id,
            name: capitalize(item.name)
        }))

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching employment status:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch data" },
            { status: 500 }
        );
    }
}

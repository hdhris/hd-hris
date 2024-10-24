import {NextRequest, NextResponse} from "next/server";
import {hasContentType} from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";

export async function POST(req: NextRequest) {
    try {
        hasContentType(req)
        const data = await req.json();
        // console.log("Data: ", data);
        await prisma.dim_leave_balances.update({
            where:{
                id: data
            },
            data: {
                deleted_at: new Date()
            }
        })
        return NextResponse.json({ status: 200, message: "Leave credit deleted successfully." });
    } catch (error) {
        console.error("Error deleting leave credit:", error);
        return NextResponse.json(
            { error: "Failed to delete leave credit" },
            { status: 500 }
        );
    }
}
import { NextRequest, NextResponse } from "next/server";
import { hasContentType } from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import dayjs from "dayjs";
import {auth} from "@/auth";

export async function POST(req: NextRequest) {
    try {
        // Check if content type is valid
        hasContentType(req);

        // Parse request body
        const data = await req.json();

        // Validate required fields
        // if (!data.id || !data.start_date || !data.end_date || !data.reason || !data.type_id) {
        //     throw new Error("Missing required fields");
        // }

        const session = await auth()
        console.log(data)

        const reviewer = await prisma.trans_employees.findUnique({
            where: {
                email: session?.user.email!
            }, select: {
                id: true
            }
        })

        // Create leave request in the database
        await prisma.trans_leaves.createMany({
            data: data.map((item: any) => ({
                employee_id: item.id,
                start_date: dayjs(item.start_date, "YYYY-MM-DD hh:mm A").toISOString(),
                end_date: dayjs(item.end_date, "YYYY-MM-DD hh:mm A").toISOString(),
                reason: item.reason,
                comment: item.comment,
                type_id: item.leave_id,
                status: "Approved",
                created_at: new Date(),
                approval_at: new Date(),
                approved_by: reviewer?.id
            })),
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        // Log the error for debugging
        // console.error(error);
        //
        // // Return user-friendly error messages
        // let message = "An unexpected error occurred. Please try again later.";
        //
        // if (error.message.includes("Missing required fields")) {
        //     message = "Please provide all required fields (id, start date, end date, reason, and type).";
        // } else if (error instanceof SyntaxError) {
        //     message = "Invalid request format. Please check the data you're sending.";
        // } else if (error.name === "PrismaClientKnownRequestError") {
        //     message = "Database error. Please contact support if the issue persists.";
        // }

        return NextResponse.json({ success: false, message: error.message });
    }
}

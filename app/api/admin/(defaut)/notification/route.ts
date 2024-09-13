import { hasContentType } from "@/helper/content-type/content-type-check";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";

export async function PUT(request: NextRequest) {
    try {
        // Check if the request has the correct Content-Type
        hasContentType(request);

        // Parse JSON data from the request body
        const data = await request.json();

        // Authenticate the session and get the user
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        // Fetch the employee_id of the authenticated user
        const user = await prisma.sys_accounts.findFirst({
            select: {
                employee_id: true,
            },
            where: {
                id: Number(session.user.id),
            },
        });

        if (!user?.employee_id) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }

        // Upsert notification settings for the user
        const notification = await prisma.sys_variables.upsert({
            where: {
                employee_id: user.employee_id,
            },
            update: {
                data: data as Prisma.JsonArray,
                updated_at: new Date(),
            },
            create: {
                key: "notification",
                data: data as Prisma.JsonArray,
                employee_id: user.employee_id,
                created_at: new Date(),
                updated_at: new Date(), // Set this on creation as well
            },
        });

        console.log(notification);

        // Return the notification data as a JSON response
        return NextResponse.json(notification);
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: "Something went wrong", details: e instanceof Error ? e.message : String(e) },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Fetch the notification settings with the key "notification"
        const notification = await prisma.sys_variables.findFirst({
            where: {
                key: "notification",
            },
        });

        // If no notification is found, return a 404 response
        if (!notification) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        // Return the found notification as JSON
        return NextResponse.json(notification);
    } catch (e) {
        console.error(e);

        // Return a 500 response in case of a server error
        return NextResponse.json(
            { error: "Something went wrong", details: e instanceof Error ? e.message : String(e) },
            { status: 500 }
        );
    }
}

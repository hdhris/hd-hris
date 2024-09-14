import prisma from "@/prisma/prisma";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest, {params}: { params: { id: string } }) {
    try {
        // Convert id to a number
        const employeeId = Number(params.id);

        // Check if the employee ID is valid
        if (isNaN(employeeId)) {
            return NextResponse.json({error: "Invalid Employee ID"}, {status: 400});
        }

        // Query the database for the notification
        const notification = await prisma.sys_variables.findFirst({
            where: {
                AND: [{
                    key: "notification",
                }, {
                    employee_id: employeeId,
                },],
            },
        });

        // If notification is not found, return a 404 response
        if (!notification) {
            return NextResponse.json({error: "Notification not found"}, {status: 404});
        }

        // Return the notification if found
        return NextResponse.json(notification, {status: 200});

    } catch (error) {
        // Handle any other errors
        console.error("Error fetching notification:", error);

        return NextResponse.json({error: "An error occurred while fetching the notification"}, {status: 500});
    }
}

import prisma from "@/prisma/prisma";
import { getEmployeeId } from "@/helper/employee_id/employee_id";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Retrieve employee ID
        const id = await getEmployeeId();

        // Check if employee ID is valid
        if (!id) {
            return NextResponse.json({ error: "Employee ID not found" }, { status: 400 });
        }

        // Query the database for the notification
        const notification = await prisma.sys_variables.findFirst({
            where: {
                AND: [
                    {
                        key: "notification",
                    },
                    {
                        employee_id: id,
                    },
                ],
            },
        });

        // If notification is not found, return a 404 response
        if (!notification) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        // Return the notification if found
        return NextResponse.json(notification, { status: 200 });

    } catch (error) {
        // Handle any other errors
        console.error("Error fetching notification:", error);

        return NextResponse.json(
            { error: "An error occurred while fetching the notification" },
            { status: 500 }
        );
    }
}

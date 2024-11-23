import { NextRequest, NextResponse } from "next/server";
import { hasContentType } from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import dayjs from "dayjs";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    try {
        // Check if the content type is valid
        hasContentType(req);

        // Parse request body
        const data = await req.json();
        console.log("Data: ", data)

        // Validate required fields
        if (!data.employee_id || !data.leave_date || !data.days_of_leave || !data.reason || !data.leave_type_id) {
            return NextResponse.json({
                success: false,
                message: "Missing required fields. Please provide employee ID, leave date, days of leave, reason, and leave type ID."
            }, {status: 400});
        }

        // Get the current user session
        const session = await auth();

        // Find the reviewer's ID based on the session email
        const reviewer = await prisma.trans_employees.findUnique({
            where: {
                email: session?.user.email!
            },
            select: {
                id: true
            }
        });

        if (!reviewer) {
            return NextResponse.json({
                success: false,
                message: "Reviewer not found. Ensure you are logged in with the correct account."
            }, {status: 400});
        }

        // Start the transaction
        await prisma.$transaction(async (tx) => {
            // Create a leave record
            const leaveRecord = {
                employee_id: data.employee_id,
                start_date: dayjs(data.leave_date).toISOString(),
                end_date: dayjs(data.leave_date).add(Number(data.days_of_leave), "day").toISOString(),
                reason: data.reason,
                comment: data.comment,
                type_id: data.leave_type_id,
                status: "Pending",
                created_at: new Date(),
                approval_at: new Date(),
                approved_by: reviewer.id
            };

            // Create leave request in the database within the transaction
            await tx.trans_leaves.create({
                data: leaveRecord
            });

            // Find the employee's leave balance ID
            const leaveBalance = await tx.dim_leave_balances.findFirst({
                where: {
                    deleted_at: null,
                    employee_id: data.employee_id,
                    leave_type_id: data.leave_type_id
                },
                select: {
                    id: true
                }
            });

            console.log("Leave Credit Id: ", leaveBalance?.id)

            if (!leaveBalance) {
                throw new Error("Leave balance not found for the specified employee.");
            }

            // Update the leave balance within the transaction
            await tx.dim_leave_balances.update({
                where: {
                    id: leaveBalance.id
                },
                data: {
                    remaining_days: {
                        decrement: Number(data.days_of_leave)
                    },
                    used_days: {
                        increment: Number(data.days_of_leave)
                    },
                    updated_at: new Date()
                }
            });
        });

        // If the transaction succeeds, return a success message
        return NextResponse.json({
            success: true,
            message: "Leave request approved and balance updated successfully."
        });
    } catch (error: any) {
        // Log the error for debugging purposes
        console.error(error);

        // Define user-friendly error messages
        let message = "An unexpected error occurred. Please try again later.";

        if (error.message.includes("Missing required fields")) {
            message = "Please provide all required fields (employee ID, leave date, days of leave, reason, and leave type ID).";
        } else if (error.message.includes("Leave balance not found")) {
            message = "Leave balance not found for the specified employee.";
        } else if (error instanceof SyntaxError) {
            message = "Invalid request format. Please check the data you're sending.";
        } else if (error.name === "PrismaClientKnownRequestError") {
            message = "Database error. Please contact support if the issue persists.";
        }

        return NextResponse.json({ success: false, message });
    }
}

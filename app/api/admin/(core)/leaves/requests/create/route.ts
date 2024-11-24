import { NextRequest, NextResponse } from "next/server";
import { hasContentType } from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import dayjs from "dayjs";
import { auth } from "@/auth";
import { v4 as uuidv4 } from 'uuid';
import {EvaluatorsTypes} from "@/types/leaves/leave-evaluators-types";
import {getEmpFullName} from "@/lib/utils/nameFormatter";

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
                id: true,
                prefix: true,
                first_name: true,
                last_name: true,
                suffix: true,
                extension: true,
                picture: true,
                email: true
            }
        });

        if (!reviewer) {
            return NextResponse.json({
                success: false,
                message: "Reviewer not found. Ensure you are logged in with the correct account."
            }, {status: 400});
        }

        const evaluators: EvaluatorsTypes = {
            approver: {
                approved_by: {
                    id: uuidv4(),
                    employee_id: reviewer.id,
                    name: getEmpFullName(reviewer),
                    picture: reviewer?.picture!,
                    email: reviewer?.email
                },
                decision: {
                    is_approved: true,
                    rejectedReason: null,
                    decisionDate: new Date()
                },
                comments: data.comment
            },
            // this is a brute force solution
            reviewers: {
                reviewed_by: {
                    id: uuidv4(),
                    employee_id: 2,
                    name: "Datumanong, Muhammad Nizam",
                    picture: "https://files.edgestore.dev/6bc0cgi3ynpz46db/publicFiles/_public/72b8b592-e919-4f88-af00-6966a6f1ca7c.jpg",
                    email: "ndatumanong05@gmail.com"
                },
                decision: {
                    is_reviewed: null,
                    rejectedReason: null,
                    decisionDate: null
                },
                comments: ""
            }
        }
        // Start the transaction
        await prisma.$transaction(async (tx) => {
            // Create a leave record
            const leaveRecord = {
                employee_id: data.employee_id,
                start_date: dayjs(data.leave_date).toISOString(),
                end_date: dayjs(data.leave_date).add(Number(data.days_of_leave), "day").toISOString(),
                reason: data.reason,
                comment: null,
                type_id: data.leave_type_id,
                status: "Pending",
                created_at: new Date(),
                created_by: reviewer.id,
                evaluators: evaluators
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


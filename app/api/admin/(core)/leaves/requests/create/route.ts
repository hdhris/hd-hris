import {NextRequest, NextResponse} from "next/server";
import {hasContentType} from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import {auth} from "@/auth";
import {v4 as uuidv4} from 'uuid';
import {LeaveApplicationEvaluation} from "@/types/leaves/leave-evaluators-types";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {toGMT8} from "@/lib/utils/toGMT8";
import {InputJsonValue} from "@prisma/client/runtime/library";
import {LeaveRequestFormValidation} from "@/helper/zodValidation/leaves/request-form/LeaveRequestFormValidation";

export async function POST(req: NextRequest) {
    try {
        // Check if the content type is valid
        hasContentType(req);

        // Parse request body
        const data = await req.json();
        // Validate required fields

        const validate = LeaveRequestFormValidation.safeParse(data)
        const remainingLeaveCredit = Number(data.total_days / 1440).toFixed(2) // minutes to hrs

        const usedLeaveCredit = Number(data.used_leave / 1440).toFixed(2) // minutes to hrs
        console.log("Creating Data: ", data)

        if(Number(usedLeaveCredit) <= 0){
            return NextResponse.json({
                success: false,
                message: "Could not create leave. Duration is 0."
            }, {status: 400})
        }

        if (!validate.success) {
            return NextResponse.json({
                success: false, message: validate.error.message
            }, {status: 404})
        }

        if (data.total_days <= 0) {
            return NextResponse.json({
                success: false, message: "Invalid days of leave."
            }, {status: 404})
        }

        // Get the current user session
        const session = await auth();

        // Find the reviewer's ID based on the session email
        const reviewer = await prisma.trans_employees.findUnique({
            where: {
                email: session?.user.email!
            }, select: {
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

        const employee = await prisma.trans_employees.findUnique({
            where: {
                id: validate.data.employee_id,
            }, select: {
                prefix: true,
                first_name: true,
                middle_name: true,
                last_name: true,
                suffix: true,
                extension: true,
                email: true,
                picture: true
            }
        })

        if (!reviewer) {
            return NextResponse.json({
                success: false, message: "Reviewer not found. Ensure you are logged in with the correct account."
            }, {status: 400});
        }

        const approver_uuid = uuidv4()
        const reviewer_uuid = uuidv4()
        const emp_uuid = uuidv4()

        const attachmentLinks = {
            url: data.url
        }
        const evaluators: LeaveApplicationEvaluation = {
            reviewers: {
                decision: {
                    is_reviewed: true, decisionDate: toGMT8().toISOString(), rejectedReason: null
                }, reviewed_by: reviewer_uuid
            }, // this is a brute force solution
            approver: {
                decision: {
                    is_approved: true, decisionDate: null, rejectedReason: null
                }, approved_by: approver_uuid
            }, users: [{
                id: approver_uuid,
                name: "Cuello, John Rey",
                role: "approver",
                email: "johnreycuello2@gmail.com",
                picture: "https://img.freepik.com/free-photo/portrait-young-handsome-businessman-wearing-suit-standing-with-crossed-arms-with-isolated-studio-white-background_1150-63219.jpg?t=st=1730875405~exp=1730879005~hmac=74c3e9b73f3b8e12a79b50f93fffb6031b7d8eea8620f97444241c47bb854f9f&w=996",
                employee_id: 66
            }, {
                id: reviewer_uuid,
                name: "Datumanong, Muhammad Nizam",
                role: "reviewer",
                email: "ndatumanong05@gmail.com",
                picture: "https://files.edgestore.dev/6bc0cgi3ynpz46db/publicFiles/_public/72b8b592-e919-4f88-af00-6966a6f1ca7c.jpg",
                employee_id: 2
            }, {
                id: emp_uuid,
                name: getEmpFullName(employee),
                role: "applicant",
                picture: employee?.picture || "",
                email: employee?.email || "",
                employee_id: data.employee_id
            }], comments: []
        }
        // Start the transaction
        await prisma.$transaction(async (tx) => {
            // Create a leave record
            const leaveRecord = {
                employee_id: validate.data.employee_id,
                start_date: toGMT8(validate.data.leave_date_range.start).toISOString(),
                end_date: toGMT8(validate.data.leave_date_range.end).toISOString(),
                reason: validate.data.reason,
                leave_type_id: validate.data.leave_type_id,
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
                created_by: reviewer.id,
                status: "Approved",
                total_days: usedLeaveCredit, // mins to day
                evaluators: evaluators as unknown as InputJsonValue,
                files: attachmentLinks.url
            };

            // Create leave request in the database within the transaction
            await tx.trans_leaves.create({
                data: leaveRecord
            });

            // Find the employee's leave balance ID
            const leaveBalance = await tx.dim_leave_balances.findFirst({
                where: {
                    deleted_at: null, employee_id: validate.data.employee_id, leave_type_id: validate.data.leave_type_id
                }, select: {
                    id: true
                }
            });


            if (!leaveBalance) {
                return NextResponse.json({
                    success: false, message: "Leave balance not found for the specified employee."
                }, {status: 400});
            }

            // Update the leave balance within the transaction
            await tx.dim_leave_balances.update({
                where: {
                    id: leaveBalance.id
                }, data: {
                    remaining_days: remainingLeaveCredit, used_days: usedLeaveCredit, updated_at: new Date()
                }
            });
        });

        // If the transaction succeeds, return a success message
        return NextResponse.json({
            success: true, message: "Leave request approved and balance updated successfully."
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

        return NextResponse.json({success: false, message}, {status: 500});
    }
}


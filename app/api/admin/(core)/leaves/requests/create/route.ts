import { NextRequest, NextResponse } from "next/server";
import { hasContentType } from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { LeaveRequestFormValidation } from "@/helper/zodValidation/leaves/request-form/LeaveRequestFormValidation";
import { auth } from "@/auth";
import { getSignatory } from "@/server/signatory";
import { sendEmail } from "@/services/email-services";
import { InputJsonValue } from "@prisma/client/runtime/library";
import dayjs from "dayjs";
import {render} from "@react-email/components";
import {approved_leave_email} from "@/components/email-templates/leaves/leave-approved";
import {employee_basic_details} from "@/server/employee-details-map/employee-details-map";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {formatDaysToReadableTime} from "@/lib/utils/timeFormatter";

export async function POST(req: NextRequest) {
    try {
        // Check if the content type is valid
        hasContentType(req);

        // Parse request body
        const data = await req.json();

        console.log("Data Request: ", data)
        // Validate required fields
        const validate = LeaveRequestFormValidation.safeParse(data);
        const remainingLeaveCredit = Number(data.total_days / 1440); // minutes to hrs
        const usedLeaveCredit = Number(data.used_leave / 1440); // minutes to hrs

        if (Number(usedLeaveCredit) <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Could not create leave. Duration is 0.",
                },
                { status: 400 }
            );
        }

        if (!validate.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: validate.error.message,
                },
                { status: 404 }
            );
        }

        if (data.total_days <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid days of leave.",
                },
                { status: 404 }
            );
        }

        const signatory = await getSignatory(
            "/leaves/leave-requests",
            validate.data.employee_id,
            true
        );

        if (!signatory) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Could not apply leave. Check the applicant details before continuing.",
                },
                { status: 404 }
            );
        }

        const attachmentLinks = {
            url: data.url,
        };

        const session = await auth();

        // Fetch the employee's leave balance outside the transaction
        const [leaveBalance, leave_type] = await Promise.all([
            prisma.dim_leave_balances.findFirst({
                where: {
                    deleted_at: null,
                    employee_id: validate.data.employee_id,
                    leave_type_id: validate.data.leave_type_id,
                },
                select: {
                    id: true,
                    allocated_days: true,
                    trans_employees: {
                        select: {
                            ...employee_basic_details
                        }
                    },
                },
            }),
            prisma.trans_leave_types.findUnique({
                where: {
                    id: validate.data.leave_type_id,
                },
                select: {
                   ref_leave_type_details:{
                       select: {
                           name: true
                       }
                   }
                }
            })
        ])
        // const leaveBalance = await prisma.dim_leave_balances.findFirst({
        //     where: {
        //         deleted_at: null,
        //         employee_id: validate.data.employee_id,
        //         leave_type_id: validate.data.leave_type_id,
        //     },
        //     select: {
        //         id: true,
        //         trans_employees: {
        //             select: {
        //                 ...employee_basic_details
        //             }
        //         },
        //     },
        // });

        if (!leaveBalance) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Leave balance not found for the specified employee.",
                },
                { status: 400 }
            );
        }

        // Start the transaction
        await prisma.$transaction(
            async (tx) => {
                // Create a leave record
                const leaveRecord = {
                    employee_id: validate.data.employee_id,
                    start_date: toGMT8(
                        validate.data.leave_date_range.start
                    ).toISOString(),
                    end_date: toGMT8(
                        validate.data.leave_date_range.end
                    ).toISOString(),
                    reason: validate.data.reason,
                    leave_type_id: validate.data.leave_type_id,
                    created_at: toGMT8().toISOString(),
                    updated_at: toGMT8().toISOString(),
                    created_by: Number(session?.user.employee_id),
                    status: "Approved",
                    total_days: usedLeaveCredit, // mins to day
                    evaluators: signatory as unknown as InputJsonValue,
                    files: attachmentLinks.url,
                };

                // Create leave request in the database
                await tx.trans_leaves.create({
                    data: leaveRecord,
                });

                // Update the leave balance
                await tx.dim_leave_balances.update({
                    where: {
                        id: leaveBalance.id,
                    },
                    data: {
                        remaining_days: remainingLeaveCredit,
                        used_days: usedLeaveCredit,
                        updated_at: new Date(),
                    },
                });
            },
            {
                timeout: 10000, // Set the timeout to 10 seconds
            }
        );

        const approvedLeave = await approved_leave_email({
            name: getEmpFullName(leaveBalance.trans_employees),
            leave_type: leave_type?.ref_leave_type_details.name!,
            start_date: toGMT8(data.leave_date_range.start).format("MMMM DD, YYYY hh:mm A"),
            end_date: toGMT8(data.leave_date_range.end).format("MMMM DD, YYYY hh:mm A"),
            status: "Approved",
            allocated_days: leaveBalance.allocated_days.toNumber(),
            remaining_days: formatDaysToReadableTime(remainingLeaveCredit)
        })

        // Send email outside the transaction
        await sendEmail({
            to: leaveBalance.trans_employees.email!,
            subject: "Leave Request Approved",
            html: approvedLeave
        });

        // If the transaction succeeds, return a success message
        return NextResponse.json({
            success: true,
            message: "Leave request approved and balance updated successfully.",
        });
    } catch (error: any) {
        // Log the error for debugging purposes
        console.error(error);

        // Define user-friendly error messages
        let message = "An unexpected error occurred. Please try again later.";

        if (error.message.includes("Missing required fields")) {
            message =
                "Please provide all required fields (employee ID, leave date, days of leave, reason, and leave type ID).";
        } else if (error.message.includes("Leave balance not found")) {
            message =
                "Leave balance not found for the specified employee.";
        } else if (error instanceof SyntaxError) {
            message =
                "Invalid request format. Please check the data you're sending.";
        } else if (error.name === "PrismaClientKnownRequestError") {
            message =
                "Database error. Please contact support if the issue persists.";
        }

        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}

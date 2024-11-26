import { NextRequest, NextResponse } from "next/server";
import { hasContentType } from "@/helper/content-type/content-type-check";
import { LeaveCreditFormSchema } from "@/helper/zodValidation/leaves/leave-credits-form/leave-credit-form-schema";
import prisma from "@/prisma/prisma";

export async function POST(req: NextRequest) {
    try {
        hasContentType(req); // Check if the request has the correct content type

        const data = await req.json(); // Parse the incoming JSON data

        console.log("Data: ", data)

        // Validate the incoming data using the Zod schema
        const parsedData = LeaveCreditFormSchema.safeParse(data);
        if (!parsedData.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation error",
                    errors: parsedData.error.errors.map((error) => error.message), // Map to user-friendly error messages
                },
                { status: 400 }
            );
        }

        // Current date
        const today = new Date();

// Check for pending or ongoing leave requests
        const isThereAPendingOrOngoingLeaveRequest = await prisma.trans_leaves.findMany({
            where: {
                employee_id: parsedData.data.employee_id!,
                end_date: {
                    gte: today // Filters only leaves with an end_date >= today (ongoing leaves)
                }
            }
        });

        console.log("Pending or Ongoing Leaves: ", isThereAPendingOrOngoingLeaveRequest);


        if (Array.isArray(isThereAPendingOrOngoingLeaveRequest) && isThereAPendingOrOngoingLeaveRequest.length > 0) {
            return NextResponse.json({
                success: false,
                message: "Cannot Update Leave Credit. There is a pending or ongoing leave request.",
            }, {status: 400});
        }


        const getTheLeaveCreditID = await prisma.dim_leave_balances.findMany({
            where: {
                employee_id: parsedData.data.employee_id!,
                leave_type_id: {
                    in: parsedData.data.leave_credits.map(leave => Number(leave.leave_type_id))
                },
                year: new Date().getFullYear()
            },
            select: {
                id: true
            },
        });

        console.log("Leave Credit ID: ", getTheLeaveCreditID)

        // const result = await prisma.dim_leave_balances.updateMany({
        //     where:{
        //         id: {
        //             in: getTheLeaveCreditID.map(leave_credit => leave_credit.id)
        //         }
        //     },
        //     data: parsedData.data.leave_credits.map(leave => {
        //         return{
        //             allocated_days: leave.allocated_days,
        //             remaining_days: leave.allocated_days,
        //             carry_forward_days: leave.carry_forward_days ?? 0,
        //             updated_at: new Date(),
        //         }
        //
        //     })
        // })

        const updatePromises = getTheLeaveCreditID.map((leave_credit, index) => {
            return prisma.dim_leave_balances.update({
                where: {
                    id: leave_credit.id
                },
                data: {
                    allocated_days: parsedData.data.leave_credits[index].allocated_days,
                    remaining_days: parsedData.data.leave_credits[index].allocated_days,
                    carry_forward_days: parsedData.data.leave_credits[index].carry_forward_days ?? 0,
                    updated_at: new Date(),
                }
            });
        });

// Execute all updates
        const result = await Promise.all(updatePromises);

        console.log("Update Results: ", result);


        console.log("Result: ", result)
        // const updatePromises = parsedData.data.leave_credits.map((leaveType, index) => {
        //
        //     return prisma.dim_leave_balances.update({
        //         where: {
        //             id: data.id[index], // Match the correct ID for each record
        //             year: data.year
        //         },
        //         data: {
        //             year: new Date().getFullYear(),
        //             allocated_days: leaveType.allocated_days,
        //             remaining_days: leaveType.allocated_days,
        //             carry_forward_days: leaveType.carry_forward_days ?? 0,
        //             updated_at: new Date(),
        //         },
        //     });
        // });
        //
        // // Execute all updates
        // await Promise.all(updatePromises);

        // Return a success response
        return NextResponse.json({
            success: true,
            message: "Leave credit successfully updated!",
        });
    } catch (error) {
        console.error("Error updating leave credit:", error);

        // Return a generic error message for unexpected errors
        return NextResponse.json(
            {
                success: false,
                message: "An unexpected error occurred. Please try again later.",
            },
            { status: 500 }
        );
    }
}

import {NextRequest, NextResponse} from "next/server";
import {hasContentType} from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";

export async function POST(req: NextRequest) {
    try {
        hasContentType(req)
        const data = await req.json();
        console.log("Data: ", data);

// Get the employee IDs
        const getTheEmployeeID = await prisma.dim_leave_balances.findMany({
            where: {
                id: {
                    in: data
                }
            },
            select: {
                employee_id: true
            },
            distinct: ["employee_id"]
        });

// Current date
        const today = new Date();

// Check for pending or ongoing leave requests
        const isThereAPendingOrOngoingLeaveRequest = await prisma.trans_leaves.findMany({
            where: {
                employee_id: {
                    in: getTheEmployeeID.map(emp => emp.employee_id)
                },
                end_date: {
                    gte: today // Filters only leaves with an end_date >= today (ongoing leaves)
                }
            }
        });

        console.log("Pending or Ongoing Leaves: ", isThereAPendingOrOngoingLeaveRequest);

        // console.log("Data: ", data);

        // const getLeaveCreditId = await prisma.dim_leave_balances.findMany({
        //     where: {
        //         employee_id: data,
        //         deleted_at: null
        //     },
        //     select: {
        //         id: true
        //     }
        // })
        // await prisma.dim_leave_balances.updateMany({
        //     where:{
        //         id: data
        //     },
        //     data: {
        //         deleted_at: new Date()
        //     }
        // })
        return NextResponse.json({ status: 200, message: "Leave credit deleted successfully." });
    } catch (error) {
        console.error("Error deleting leave credit:", error);
        return NextResponse.json(
            { error: "Failed to delete leave credit" },
            { status: 500 }
        );
    }
}
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export async function POST(req: NextRequest) {
    try {
        // Parse the incoming JSON payload
        const data = await req.json();

        const { employee_id, leave_credits, apply_for } = data;


        if(employee_id.length === 0) return NextResponse.json({
            success: false,
            message: "No Employee have been assigned to this status."
        }, {status: 400})
        // Prepare records to insert
        const recordsToCreate: any[] = [];

        for (const leaveCredit of leave_credits) {
            // Fetch the leave type ID based on leave_type_details_id and employment_status_id
            const employee_leave_type = await prisma.trans_leave_types.findUnique({
                where: {
                    leave_type_details_id_employment_status_id: {
                        leave_type_details_id: Number(leaveCredit.leave_type_id),
                        employment_status_id: apply_for,
                    },
                },
                select: {
                    id: true,
                },
            });

            if (!employee_leave_type) {
                console.warn(`Leave type not found for leave_type_id ${leaveCredit.leave_type_id} and employment_status_id ${apply_for}`);
                continue; // Skip this leave credit if the leave type isn't found
            }

            // Add records for all employees
            for (const id of employee_id) {
                recordsToCreate.push({
                    leave_type_id: employee_leave_type.id,
                    employee_id: id,
                    year: new Date().getFullYear(),
                    allocated_days: leaveCredit.allocated_days,
                    remaining_days: leaveCredit.allocated_days,
                    carry_forward_days: leaveCredit.carry_forward_days ?? 0,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
            }
        }

        // Bulk insert all records
        if (recordsToCreate.length > 0) {
            await prisma.dim_leave_balances.createMany({
                data: recordsToCreate,
                skipDuplicates: true, // Skip duplicates if necessary
            });
        } else {
            return NextResponse.json({
                success: false,
                message: "No records to add. Ensure that all leave credits and employee details are valid.",
            });
        }

        // Return success response
        return NextResponse.json({
            success: true,
            message: "Leave credits successfully added!",
        });
    } catch (error) {
        console.error("Error adding leave credits:", error);
        // Return a generic error message
        return NextResponse.json(
            {
                success: false,
                message: "An unexpected error occurred. Please try again later.",
            },
            { status: 500 }
        );
    }
}

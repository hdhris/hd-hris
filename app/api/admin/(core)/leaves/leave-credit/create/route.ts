import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export async function POST(req: NextRequest) {
    try {
        // Parse the incoming JSON payload
        const data = await req.json();

        const { employee_id, leave_credits } = data;

        console.log("Leave Credit: ", leave_credits)

        const employee = await prisma.trans_employees.findMany({
            where: {
                id: {
                    in: employee_id
                }
            },
            select: {
                ref_employment_status: {
                    select: {
                        id: true,
                    },
                }
            },
        })

        console.log("Employees: ", employee)

        // Prepare an array of records for bulk creation
        const recordsToCreate = employee_id.flatMap((id: number) =>
            leave_credits.map((leaveType: { leave_type_id: string; allocated_days: number; carry_forward_days: number | null }) => ({
                leave_type_id: 1,
                employee_id: id,
                year: new Date().getFullYear(),
                allocated_days: leaveType.allocated_days,
                remaining_days: leaveType.allocated_days,
                carry_forward_days: leaveType.carry_forward_days ?? 0,
                created_at: new Date(),
                updated_at: new Date(),

            }))
        );


        // console.log("Records: ", recordsToCreate)
        // Bulk insert all records
        // await prisma.dim_leave_balances.createMany({
        //     data: recordsToCreate,
        // });

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

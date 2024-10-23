import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { getEmpFullName } from "@/lib/utils/nameFormatter";

export async function GET() {
    try {
        // Fetch current year leave balances where deleted_at is null
        const leave_balances = await prisma?.dim_leave_balances.findMany({
            where: {
                deleted_at: null,
                year: new Date().getFullYear(), // Only balances for the current year
            },
        });

        // Fetch employees who do not have leave balances for the current year
        const employees = await prisma?.trans_employees.findMany({
            where: {
                deleted_at: null, // Exclude deleted employees
                id: {
                    notIn: leave_balances.map((leave_balance) => leave_balance.employee_id), // Exclude employees with leave balances
                },
            },
            include: {
                ref_departments: true, // Include department data
            },
        });

        // Format the employee data for a user-friendly response
        const data = employees.map((emp) => {
            return {
                id: emp.id,
                name: getEmpFullName(emp), // Full name formatted from employee data
                picture: emp.picture,
                department: emp.ref_departments?.name ?? "No department", // Default to "No department" if department name is missing
            };
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to fetch employees or leave balances:", error);

        // Provide user-friendly feedback in case of an error
        return NextResponse.json({
            success: false,
            message: "An error occurred while fetching employee data or leave balances. Please try again later.",
        });
    }
}

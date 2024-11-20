import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {getEmpFullName} from "@/lib/utils/nameFormatter";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Fetch current year leave balances where deleted_at is null
        const leave_balances = await prisma?.dim_leave_balances.findMany({
            where: {
                deleted_at: null, year: new Date().getFullYear(), // Only balances for the current year
            },
        });

        // Fetch employees who do not have leave balances for the current year
        const [employees, leave_types] = await Promise.all([prisma.trans_employees.findMany({
            where: {
                deleted_at: null, // Exclude deleted employees
                id: {
                    notIn: leave_balances.map((leave_balance) => leave_balance.employee_id), // Exclude employees with leave balances
                },
            }, include: {
                ref_departments: true, // Include department data
            },
        }), prisma.ref_leave_types.findMany({
            where: {
                is_active: true, deleted_at: null
            }, select: {
                id: true, name: true, applicable_to_employee_types: true
            }, orderBy: {
                applicable_to_employee_types: "asc"
            }
        })

        ])

        // Format the employee data for a user-friendly response
        const data = employees.map((emp) => {
            return {
                id: emp.id, name: getEmpFullName(emp), // Full name formatted from employee data
                picture: emp.picture, department: emp.ref_departments?.name ?? "No department", // Default to "No department" if department name is missing
                is_regular: emp.is_regular
            };
        });


        return NextResponse.json({
            employees: data, leave_types
        });
    } catch (error) {
        console.error("Failed to fetch employees or leave balances:", error);

        // Provide user-friendly feedback in case of an error
        return NextResponse.json({
            success: false,
            message: "An error occurred while fetching employee data or leave balances. Please try again later.",
        });
    }
}

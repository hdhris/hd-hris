// app/api/employeemanagement/employees/schedule-history/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First verify the employee exists
    const employee = await prisma.trans_employees.findFirst({
      where: {
        id: parseInt(params.id),
        deleted_at: null
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Then fetch their complete schedule history
    const scheduleHistory = await prisma.dim_schedules.findMany({
      where: {
        employee_id: employee.id,
        deleted_at: null
      },
      select: {
        id: true,
        start_date: true,
        end_date: true,
        days_json: true,
        clock_in: true, // Ensure clock_in is selected
        clock_out: true, // Ensure clock_out is selected
        break_min: true, // Ensure break_min is selected
        ref_batch_schedules: {
          select: {
            id: true,
            name: true,
            clock_in: true,
            clock_out: true,
            break_min: true
          }
        },
        trans_employees: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      },
      orderBy: [
        {
          start_date: 'desc'
        },
        {
          created_at: 'desc'
        }
      ]
    });

    return NextResponse.json(scheduleHistory);
  } catch (error) {
    console.error("Failed to fetch schedule history:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule history" },
      { status: 500 }
    );
  }
}
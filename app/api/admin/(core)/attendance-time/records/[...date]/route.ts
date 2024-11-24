import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";
import {
  AttendaceStatuses,
  AttendanceLog,
  InStatus,
  OutStatus,
} from "@/types/attendance-time/AttendanceTypes";
import { min } from "lodash";

export const dynamic = "force-dynamic";

// Fetch attendance logs and organize statuses by date range
export async function GET(req: NextRequest) {
  try {
    // Destructure date range from params
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    //////////////////////////////////
    // Prepare and get attendance logs
    const isoStartDate = toGMT8(`${startDate}T00:00:00.000Z`).toISOString();
    const isoEndDate = toGMT8(`${endDate}T23:59:59.999Z`).toISOString();
    const attendanceLogs = (await prisma.log_attendances.findMany({
      where: {
        timestamp: {
          gte: isoStartDate,
          lt: isoEndDate, // Matches records within the range
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    })) as unknown as AttendanceLog[];
    // Extract unique employee IDs from logs
    const employeeIDsFromLogs = attendanceLogs.map((al) => al.employee_id);

    ///////////////////////////////////////////////////////////////
    // Prepare batch schedule and employee schedule info
    
    // Employee schedule
    const employeeSchedule = await prisma.dim_schedules.findMany({
      where: {
        trans_employees: {
          id: { in: employeeIDsFromLogs },
        },
      },
    });
    // Batch schedule
    const batchSchedule = await prisma.ref_batch_schedules.findMany({
      where: {
        dim_schedules: {
          some: {
            employee_id: { in: employeeIDsFromLogs },
          },
        },
      },
    });
    
    // Fetch employee details for reference
    const employees = await prisma.trans_employees.findMany({
      where: {
        id: { in: employeeIDsFromLogs },
      },
      ...emp_rev_include.employee_detail,
    });


    return NextResponse.json({
      attendanceLogs,
      employees,
      batchSchedule,
      employeeSchedule,
    });
  } catch (error) {
    console.error("Error fetching attendances:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

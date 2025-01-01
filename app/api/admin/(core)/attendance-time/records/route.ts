import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";
import { AttendanceLog } from "@/types/attendance-time/AttendanceTypes";

export const dynamic = "force-dynamic";

// Fetch attendance logs and organize statuses by date range
export async function GET(req: NextRequest) {
    try {
        // Destructure date range from params
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get("start");
        const endDate = searchParams.get("end");
        const empID = searchParams.get("employee_id");

        const is_single_date = startDate === endDate;

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
                ...(empID ? { employee_id: Number(empID) } : {}),
            },
            // orderBy: {
            //     timestamp: "desc",
            // },
        })) as unknown as AttendanceLog[];
        // Extract unique employee IDs from logs
        const employeeIDsFromLogs = attendanceLogs.map((al) => al.employee_id);

        ///////////////////////////////////////////////////////////////
        // Prepare batch schedule and employee schedule info
        const [employeeSchedule, employees, overtimes] = await Promise.all([
            // Employee schedule
            prisma.dim_schedules.findMany({
                where: {
                    employee_id: { in: employeeIDsFromLogs },
                    start_date: is_single_date ? { lte: isoStartDate } : { gte: isoStartDate },
                    OR: [{ end_date: is_single_date ? { gte: isoEndDate } : { lte: isoEndDate } }, { end_date: null }],
                },
            }),

            // Fetch employee details for reference
            prisma.trans_employees.findMany({
                where: {
                    id: { in: employeeIDsFromLogs },
                },
                ...emp_rev_include.employee_detail,
            }),

            // Fetch overtimes
            prisma.trans_overtimes.findMany({
                where: {
                    log_id: { in: attendanceLogs.map(item => item.id) },
                    status: "approved",
                }
            })
        ]);

        return NextResponse.json({
            attendanceLogs,
            employees,
            employeeSchedule,
            overtimes,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";
import { AttendanceLog } from "@/types/attendance-time/AttendanceTypes";
import { parseBoolean } from "@/lib/utils/parser/parseClass";

export const dynamic = "force-dynamic";

// Fetch attendance logs and organize statuses by date range
export async function GET(req: NextRequest) {
    try {
        // Destructure date range from params
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get("start");
        const endDate = searchParams.get("end");
        const empID = searchParams.get("employee_id");
        const allEmployee = parseBoolean(searchParams.get("all_employee"));
        // const department_id = searchParams.get("search");



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
                // ...(department_id ? { department_id: Number(department_id) } : {}),
            },
            // orderBy: {
            //     timestamp: "desc",
            // },
        })) as unknown as AttendanceLog[];
        // Extract unique employee IDs from logs
        const employeeIDsFromLogs = attendanceLogs.map((al) => al.employee_id);

        ///////////////////////////////////////////////////////////////
        // Prepare batch schedule and employee schedule info
        const [employeeSchedule, employees, overtimes, leaves] = await Promise.all([
            // Employee schedule
            prisma.dim_schedules.findMany({
                where: {
                    ...(!allEmployee
                        ? {
                              employee_id: { in: employeeIDsFromLogs },
                          }
                        : {}),
                    // start_date: is_single_date ? { lte: isoStartDate } : { gte: isoStartDate },
                    // OR: [{ end_date: is_single_date ? { gte: isoEndDate } : { lte: isoEndDate } }, { end_date: null }],
                    OR:[
                        // Starts within the range
                        {
                            start_date: { gte: isoStartDate, lte: isoEndDate },
                        },
                        // Ends within the range
                        {
                            end_date: { gte: isoStartDate, lte: isoEndDate },
                        },
                        // Spans the range
                        {
                            start_date: { lte: isoStartDate },
                            end_date: { gte: isoEndDate },
                        },
                        {
                            end_date: null,
                        }
                    ],
                },
            }),

            // Fetch employee details for reference
            prisma.trans_employees.findMany({
                where: {
                    ...(!allEmployee
                        ? {
                              id: { in: employeeIDsFromLogs },
                          }
                        : {}),
                },
                ...emp_rev_include.employee_detail,
            }),

            // Fetch overtimes
            prisma.trans_overtimes.findMany({
                where: {
                    log_id: { in: attendanceLogs.map((item) => item.id) },
                    status: "approved",
                },
            }),

            // Fetch leaves
            prisma.trans_leaves.findMany({
                where: {
                    ...(!allEmployee
                        ? {
                              employee_id: { in: employeeIDsFromLogs },
                          }
                        : {}),
                    OR: [
                        // Starts within the range
                        {
                            start_date: { gte: isoStartDate, lte: isoEndDate },
                        },
                        // Ends within the range
                        {
                            end_date: { gte: isoStartDate, lte: isoEndDate },
                        },
                        // Spans the range
                        {
                            start_date: { lte: isoStartDate },
                            end_date: { gte: isoEndDate },
                        },
                    ],
                    status: "approved",
                },
                include: {
                    trans_leave_types: {
                        select: {
                            ref_leave_type_details: {
                                select: {
                                    paid_leave: true,
                                },
                            },
                        },
                    },
                },
            }),
        ]);

        // console.log({ count: employees.length });
        return NextResponse.json({
            attendanceLogs,
            employees,
            employeeSchedule,
            overtimes,
            leaves,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

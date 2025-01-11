import { NextRequest, NextResponse } from "next/server";
import { getPrismaErrorMessage } from "@/server/errors/server-errors";
import prisma from "@/prisma/prisma";
import { AttendanceLogs } from "@/types/report/attendance/attendance-types";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { employee_basic_details } from "@/server/employee-details-map/employee-details-map";
import { toGMT8 } from "@/lib/utils/toGMT8";
import {capitalize} from "@nextui-org/shared-utils";
import {LeaveReports} from "@/types/report/leaves/leave-types";
import {formatDaysToReadableTime} from "@/lib/utils/timeFormatter";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        // const page = parseInt(searchParams.get('page') || '1', 10); // Default to page 1
        const search = Number(searchParams.get('search') || 0);
        // const perPage = 10; // Default to 10 results per page
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        if (!start || !end) {
            return NextResponse.json({ error: "Start and end dates are required." }, { status: 400 });
        }

        const startDate = toGMT8(`${toGMT8(start).format("YYYY-MM-DD")}T00:00:00`).toDate();
        const endDate = toGMT8(`${toGMT8(end).format("YYYY-MM-DD")}T23:59:59`).toDate(); // Include the entire end date

        // console.log("Start: ", startDate, "End: ", endDate);
        // if (page < 1 || perPage < 1) {
        //     return NextResponse.json({ error: "Page and limit must be positive integers." }, { status: 400 });
        // }
        //
        // const skip = (page - 1) * perPage;

        // Fetch data and total count in parallel
        const [data, count] = await Promise.all([
            prisma?.trans_leaves.findMany({
                where: {
                    status: {
                        not: "pending"
                    },
                    start_date: {
                        gte: startDate,
                    },
                    end_date: {
                        lte: endDate
                    },
                    trans_employees_leaves: {
                        ref_departments: {
                            id: search !== 0 ? search : undefined
                        }
                    }
                },
                include: {
                    trans_leave_types: {
                        select: {
                            id: true,
                            ref_leave_type_details: {
                                select: {
                                    name: true
                                }
                            },
                            ref_employment_status: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    trans_employees_leaves: {
                        select: {
                            ...employee_basic_details,
                            ref_departments: {
                                select: {
                                    name: true
                                }
                            },
                        }
                    }
                },
            }),
            prisma?.log_attendances.count({
                where: {
                    timestamp: {
                        gte: startDate,
                        lte: endDate
                    },
                    trans_employees: {
                        ref_departments: {
                            id: search !== 0 ? search : undefined
                        }
                    }
                }
            }),
        ]);

        const leaveCredits = await prisma?.dim_leave_balances.findMany({
            where: {
                leave_type_id: {
                    in: data?.map((leave) => leave.trans_leave_types.id)
                }
            }, select: {
                employee_id: true,
                allocated_days: true,
                remaining_days: true,
                carry_forward_days: true,
                used_days: true,
            }
        })
        if (!data) {
            return NextResponse.json({ error: "Failed to fetch data." }, { status: 500 });
        }
        //
        // const nextPage = page * perPage < count ? page + 1 : null;
        // const previousPage = page > 1 ? page - 1 : null;

        const results: LeaveReports[] = data.sort((a,b) => a.trans_employees_leaves.last_name.localeCompare(b.trans_employees_leaves.last_name)).map((item) => {
            const leave_credits = leaveCredits?.find((leave) => leave.employee_id === item.employee_id)!;
            return({
                // id: item.id,
                // status: capitalize(item.status),
                // employee: getEmpFullName(item.trans_employees_leaves),
                // department: item.trans_employees_leaves.ref_departments?.name!,
                // start_date: item.start_date,
                // end_date: item.end_date,
                // reason: item.reason,
                // leave_type: item.trans_leave_types?.ref_leave_type_details?.name!,
                id: item.id,
                employee: getEmpFullName(item.trans_employees_leaves),
                department: item.trans_employees_leaves.ref_departments?.name!,
                work_status: item.trans_leave_types.ref_employment_status.name!,
                leave_type: item.trans_leave_types?.ref_leave_type_details?.name!,
                leave_status: capitalize(item.status),
                leave_start_date: toGMT8(item.start_date).format("YYYY-MM-DD hh:mm A"),
                leave_end_date: toGMT8(item.end_date).format("YYYY-MM-DD hh:mm A"),
                leave_duration: formatDaysToReadableTime(item.total_days.toNumber()),
                leave_reason: item.reason,
                leave_allocated_days: formatDaysToReadableTime(leave_credits.allocated_days.toNumber()),
                leave_used_days: formatDaysToReadableTime(leave_credits.used_days.toNumber()),
                leave_carry_forward_days: formatDaysToReadableTime(leave_credits.carry_forward_days.toNumber()),
                leave_remaining_days: formatDaysToReadableTime(leave_credits.remaining_days.toNumber()),

            })
        });

        return NextResponse.json(
            {
                // count,
                // next: nextPage ? `${process.env.BASE_URL}/api/admin/reports/attendance-logs/?page=${nextPage}` : null,
                // previous: previousPage ? `${process.env.BASE_URL}/api/admin/reports/attendance-logs/?page=${previousPage}` : null,
                results,
            },
            { status: 200 }
        );
    } catch (error) {
        return getPrismaErrorMessage(error);
    }
}

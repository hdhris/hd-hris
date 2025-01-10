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
        const newEmployees = await prisma.trans_employees.findMany({
            where: {
                hired_at: {
                    gte: startDate,
                    lte: endDate
                },
            },
            select: {
                ...employee_basic_details,
                contact_no: true,
                ref_employment_status: {
                    select: {
                        name: true
                    }
                },
                ref_departments: {
                    select: {
                        name: true
                    }
                },
                ref_job_classes: {
                    select: {
                        name: true
                    }
                },
                hired_at: true
            },
            orderBy: {
                last_name: "asc"
            }

        })

        return NextResponse.json(
            {
                // count,
                // next: nextPage ? `${process.env.BASE_URL}/api/admin/reports/attendance-logs/?page=${nextPage}` : null,
                // previous: previousPage ? `${process.env.BASE_URL}/api/admin/reports/attendance-logs/?page=${previousPage}` : null,
                results: newEmployees.map(item => ({
                    id: item.id,
                    name: getEmpFullName(item),
                    email: item.email,
                    phone: item.contact_no,
                    department: item.ref_departments?.name,
                    job: item.ref_job_classes?.name,
                    working_status: item.ref_employment_status?.name,
                    hired_date: item.hired_at ? toGMT8(item.hired_at).format("YYYY-MM-DD") : null,
                })) as EmployeeRecruitement[]
            },
            { status: 200 }
        );
    } catch (error) {
        return getPrismaErrorMessage(error);
    }
}

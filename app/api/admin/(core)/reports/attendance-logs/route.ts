import { NextRequest, NextResponse } from "next/server";
import { getPrismaErrorMessage } from "@/server/errors/server-errors";
import prisma from "@/prisma/prisma";
import { AttendanceLogs } from "@/types/report/attendance/attendance-types";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { employee_basic_details } from "@/server/employee-details-map/employee-details-map";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1', 10); // Default to page 1
        const search = Number(searchParams.get('search') || 0);
        const perPage = 10; // Default to 10 results per page
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        if (!start || !end) {
            return NextResponse.json({ error: "Start and end dates are required." }, { status: 400 });
        }

        const startDate = toGMT8(`${toGMT8(start).format("YYYY-MM-DD")}T00:00:00`).toDate();
        const endDate = toGMT8(`${toGMT8(end).format("YYYY-MM-DD")}T23:59:59`).toDate(); // Include the entire end date

        console.log("Start: ", startDate, "End: ", endDate);
        if (page < 1 || perPage < 1) {
            return NextResponse.json({ error: "Page and limit must be positive integers." }, { status: 400 });
        }

        const skip = (page - 1) * perPage;

        // Fetch data and total count in parallel
        const [data, count] = await Promise.all([
            prisma?.log_attendances.findMany({
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
                },
                include: {
                    trans_employees: {
                        select: {
                            ...employee_basic_details,
                            ref_departments: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                },
                skip,
                take: perPage,
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

        if (!data) {
            return NextResponse.json({ error: "Failed to fetch data." }, { status: 500 });
        }

        const nextPage = page * perPage < count ? page + 1 : null;
        const previousPage = page > 1 ? page - 1 : null;

        const modeType = ["Password", "Fingerprint", "Card", "Face ID", "Other"];
        const punchType = ["IN", "OUT"];
        const results: AttendanceLogs[] = data.map((item) => ({
            id: item.id,
            timestamp: toGMT8(item.timestamp).format("YYYY-MM-DD hh:mm:ss A"), // Only format date
            status: modeType[item.status!],
            created_at: item.created_at?.toISOString()!,
            punch: punchType[item.punch!],
            employee: getEmpFullName(item.trans_employees),
            department: item.trans_employees.ref_departments?.name!
        }));

        return NextResponse.json(
            {
                count,
                next: nextPage ? `${process.env.BASE_URL}/api/admin/reports/attendance-logs/?page=${nextPage}` : null,
                previous: previousPage ? `${process.env.BASE_URL}/api/admin/reports/attendance-logs/?page=${previousPage}` : null,
                results,
            },
            { status: 200 }
        );
    } catch (error) {
        return getPrismaErrorMessage(error);
    }
}

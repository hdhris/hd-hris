import { getPrismaErrorMessage } from "@/server/errors/server-errors";
import prisma from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";
import { isEmployeeAvailable } from "@/helper/employee/unavailableEmployee";
import { toGMT8 } from "@/lib/utils/toGMT8";
import {DashboardDate, NewlyHiredEmployees} from "@/types/dashboard/stats-types";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const year = parseInt(searchParams.get("year")!);
        const sem = searchParams.get("sem");

        if (!year || isNaN(year)) {
            return NextResponse.json({ error: "Invalid year parameter." }, { status: 400 });
        }

        if (sem !== "1" && sem !== "2") {
            return NextResponse.json({ error: "Invalid semester parameter. Please provide '1' or '2'." }, { status: 400 });
        }

        // Define date ranges for first and second semesters
        const janToJunStart = new Date(year, 0, 1); // Jan 1st
        const janToJunEnd = new Date(year, 5, 30); // Jun 30th
        const julToDecStart = new Date(sem === "1" ? year - 1 : year, 6, 1); // Jul 1st
        const julToDecEnd = new Date(sem === "1" ? year - 1 : year, 11, 31); // Dec 31st

        // Convert to GMT+8
        const startFirstHalf = toGMT8(janToJunStart).toDate();
        const endFirstHalf = toGMT8(janToJunEnd).toDate();
        const startSecondHalf = toGMT8(julToDecStart).toDate();
        const endSecondHalf = toGMT8(julToDecEnd).toDate();

        // Query for employees hired in each semester
        const [firstHalfHires, secondHalfHires] = await Promise.all([
            prisma.trans_employees.findMany({
                where: {
                    hired_at: {
                        gte: startFirstHalf,
                        lte: endFirstHalf,
                    },
                    deleted_at: null,
                },
                select: {
                    suspension_json: true,
                    termination_json: true,
                    resignation_json: true,
                },
            }),
            prisma.trans_employees.findMany({
                where: {
                    hired_at: {
                        gte: startSecondHalf,
                        lte: endSecondHalf,
                    },
                    deleted_at: null,
                },
                select: {
                    suspension_json: true,
                    termination_json: true,
                    resignation_json: true,
                },
            }),
        ]);

        // Filter for available employees
        const firstHalfCount = firstHalfHires.filter(
            (emp) =>
                isEmployeeAvailable({
                    employee: emp,
                    find: ["termination", "resignation"]
                })
        ).length;

        const secondHalfCount = secondHalfHires.filter(
            (emp) =>
                isEmployeeAvailable({
                    employee: emp,
                    find: ["termination", "resignation"]
                })
        ).length;

        // Calculate percentage change if the user requests data for both semesters
        let percentageChange: number = 0;
        let status: string = "no change";

        if (sem === "1") {
            // Calculate percentage change from first semester to second semester
            if (firstHalfCount > 0 && secondHalfCount > 0) {
                percentageChange = ((firstHalfCount - secondHalfCount) / secondHalfCount) * 100;
            } else {
                percentageChange = 0;
            }
            status = percentageChange > 0 ? "increment" : percentageChange < 0 ? "decrement" : "no change";
        } else if (sem === "2") {
            // Calculate percentage change from second semester to first semester
            if (firstHalfCount > 0 && secondHalfCount > 0) {
                percentageChange = ((secondHalfCount - firstHalfCount) / firstHalfCount) * 100;
            } else {
                percentageChange = 0;
            }
            status = percentageChange > 0 ? "increment" : percentageChange < 0 ? "decrement" : "no change";
        }

        const employeesData: NewlyHiredEmployees = {
            employee_length: sem === "1" ? firstHalfCount : secondHalfCount,
            firstHalfCount,
            secondHalfCount,
            status: status as "increment" | "decrement" | "no change",
            percentageChange: percentageChange.toFixed(2),
        }
        return NextResponse.json({
            employeesData
        } as unknown as DashboardDate);

    } catch (err) {
        return getPrismaErrorMessage(err);
    }
}

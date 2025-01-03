import { getPrismaErrorMessage } from "@/server/errors/server-errors";
import prisma from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";
import { isEmployeeAvailable } from "@/helper/employee/unavailableEmployee";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const year = parseInt(searchParams.get("year")!);
        const sem = searchParams.get("sem");

        if (!year || isNaN(year)) {
            return NextResponse.json({ error: "Invalid year parameter." }, { status: 400 });
        }

        // Define date ranges for first and second semesters
        const janToJunStart = new Date(year, 0, 1); // Jan 1st
        const janToJunEnd = new Date(year, 5, 30); // Jun 30th
        const julToDecStart = new Date(year, 6, 1); // Jul 1st
        const julToDecEnd = new Date(year, 11, 31); // Dec 31st

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
                isEmployeeAvailable(emp as any, "resignation") &&
                isEmployeeAvailable(emp as any, "termination")
        ).length;

        const secondHalfCount = secondHalfHires.filter(
            (emp) =>
                isEmployeeAvailable(emp as any, "resignation") &&
                isEmployeeAvailable(emp as any, "termination")
        ).length;

        // Calculate percentage change
        const percentageChange =
            firstHalfCount === 0
                ? secondHalfCount > 0
                    ? Infinity // Undefined percentage increase if no employees in first half
                    : 0
                : (secondHalfCount / (secondHalfCount + firstHalfCount)) * 100;

        return NextResponse.json({
            firstHalfCount,
            secondHalfCount,
            percentageChange: percentageChange === Infinity ? "Infinity" : percentageChange.toFixed(2),
        });
    } catch (err) {
        return getPrismaErrorMessage(err);
    }
}

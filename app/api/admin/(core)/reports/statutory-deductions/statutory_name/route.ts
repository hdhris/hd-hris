import {getPrismaErrorMessage} from "@/server/errors/server-errors";
import prisma from "@/prisma/prisma";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
    try {
        const {searchParams} = new URL(req.url);

        const dateID = Number(searchParams.get("date"));

        const dates = await prisma.trans_payroll_date.findUnique({
            where: {
                id: dateID,
            }, select: {
                start_date: true, end_date: true,
            }
        })
        const statutory_name = await prisma.ref_benefit_plans.findMany({
            where: {
                deleted_at: {
                    gte: dates?.start_date, lte: dates?.end_date,
                },
            }, select: {
                id: true,
                name: true,
            }
        })
        return NextResponse.json(statutory_name)
    }catch (error) {
        console.log("error", error);
        return getPrismaErrorMessage(error);
    }
}
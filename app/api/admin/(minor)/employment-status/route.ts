import {Logger, LogLevel} from "@/lib/logger/Logger";
import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma"
import {EmploymentStatusDetails} from "@/types/employment-status/employment-status";

export async function GET() {
    const logger = new Logger(LogLevel.INFO)
    try {
        const employment_status_data = await prisma.ref_employment_status.findMany({
            where: {
                deleted_at: null
            }, select: {
                id: true,
                name: true
            }
        })

        const employment_status: EmploymentStatusDetails[] = employment_status_data.map(item => ({
            id: item.id,
            name: item.name
        }))

        return NextResponse.json(employment_status)
    } catch (error) {
        logger.error("Error: " + error)
        return NextResponse.json({message: "Something went wrong"
        }, {status: 500})
    }
}
import {NextResponse} from "next/server";
import {getPrismaErrorMessage} from "@/server/errors/server-errors";
import prisma from "@/prisma/prisma";
export async function GET() {
    try {
        const departments = await prisma.ref_departments.findMany({
            where: {
                deleted_at: null,
            }, select: {
                id: true, name: true
            }
        })
        return NextResponse.json(departments)
    } catch (e: any) {
        console.log("Error: ", e)
        return getPrismaErrorMessage(e)
    }
}
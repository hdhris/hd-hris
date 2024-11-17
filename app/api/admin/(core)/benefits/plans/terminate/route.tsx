import { NextRequest, NextResponse } from "next/server";
import { hasContentType } from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
    try {
        hasContentType(req);
        const data = await req.json();

        const employee = await prisma.dim_employee_benefits.findFirst({
            where: {
                employee_id: data.key,
                plan_id: data.plan_id
            },
            select: { id: true }
        });

        if (!employee) {
            return NextResponse.json({
                message: "Employee benefit record not found.",
                success: false
            }, { status: 404 });
        }

        const timestamp = toGMT8(new Date()).toISOString();

        await prisma.dim_employee_benefits.update({
            where: { id: employee.id },
            data: {
                terminated_at: timestamp,
                updated_at: timestamp
            }
        });

        return NextResponse.json({
            message: "Employee benefit termination was successful.",
            success: true
        });
    } catch (error) {
        console.error("Error terminating employee benefit:", error);
        return NextResponse.json({
            message: "An error occurred while attempting to terminate the employee benefit. Please try again or contact support.",
            success: false
        }, { status: 500 });
    }
}

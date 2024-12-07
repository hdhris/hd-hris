// app/api/admin/trainings-and-seminars/empprograms/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        let idString = searchParams.get("id");
        const id = idString ? Number(idString) : null;

        const employees = await prisma.trans_employees.findMany({
            where: {
                deleted_at: null
            },
            select: {
                id: true,
                first_name: true,
                middle_name: true,
                last_name: true,
                suffix: true,
                email: true,
                picture: true,
                ref_departments: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                ref_job_classes: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (id) {
            const program = await prisma.ref_training_programs.findFirst({
                where: {
                    id: id,
                    deleted_at: null,
                },
                include: {
                    dim_training_participants: true,
                    trans_employees: true,
                }
            });
            
            return NextResponse.json({ program, employees });
        }

        return NextResponse.json({ employees });
    } catch (error) {
        console.error("Error in read route:", error);
        return NextResponse.json({ error: "Failed to fetch data: " + error }, { status: 500 });
    }
}
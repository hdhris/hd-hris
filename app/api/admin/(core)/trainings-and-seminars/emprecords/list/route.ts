// app/api/trainings-and-seminars/employee-records/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const status = searchParams.get("active");

        const records = await prisma.dim_training_participants.findMany({
            where: {
                ref_training_programs: {
                    deleted_at: null,
                },
            },
            include: {
                ref_training_programs: {
                    select: {
                        name: true,
                        description: true,
                        type: true,
                        location: true,
                        start_date: true,
                        end_date: true,
                        instructor_name: true,
                        hour_duration: true,
                        is_active: true,
                        trans_employees: {
                            select: {
                                first_name: true,
                                last_name: true,
                            }
                        }
                    }
                },
                trans_employees: {
                    select: {
                        first_name: true,
                        last_name: true,
                        ref_departments: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return NextResponse.json(records);
    } catch (error) {
        console.error("Error in fetching records:", error);
        return NextResponse.json({ error: "Failed to fetch records: " + error }, { status: 500 });
    }
}
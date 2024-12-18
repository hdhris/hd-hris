import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Record ID is required" }, { status: 400 });
        }

        const record = await prisma.dim_training_participants.findUnique({
            where: {
                id: parseInt(id),
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
                        hour_duration: true,
                        instructor_name: true,
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
                        picture:true,
                        email:true,
                        first_name: true,
                        last_name: true,
                        ref_departments: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(record);
    } catch (error) {
        console.error("Error in fetching record:", error);
        return NextResponse.json({ error: "Failed to fetch record: " + error }, { status: 500 });
    }
}
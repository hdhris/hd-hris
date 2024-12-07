import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { data, participants } = body;

        const formattedData = {
            ...data,
            start_date: data.start_date ? 
                dayjs(data.start_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ') : 
                dayjs().format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            end_date: data.end_date ? 
                dayjs(data.end_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ') : 
                dayjs().add(7, 'day').format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            // employee_instructor_id: data.employee_instructor_id ? Number(data.employee_instructor_id) : null,
            type: data.type || 'seminars',
        };

        const seminar = await prisma.$transaction(async (tx) => {
            const seminar = await tx.ref_training_programs.upsert({
                where: {
                    id: data.id || -1,
                },
                create: {
                    name: formattedData.name,
                    description: formattedData.description,
                    hour_duration: formattedData.hour_duration,
                    location: formattedData.location,
                    start_date: formattedData.start_date,
                    end_date: formattedData.end_date,
                    max_participants: formattedData.max_participants,
                    is_active: formattedData.is_active,
                    type: formattedData.type,
                    instructor_name:formattedData.instructor_name,
                    created_at: new Date(),
                    updated_at: new Date(),
                   
                },
                update: {
                    name: formattedData.name,
                    description: formattedData.description,
                    hour_duration: formattedData.hour_duration,
                    location: formattedData.location,
                    start_date: formattedData.start_date,
                    end_date: formattedData.end_date,
                    max_participants: formattedData.max_participants,
                    instructor_name:formattedData.instructor_name,
                    is_active: formattedData.is_active,
                    type: formattedData.type,
                    updated_at: new Date(),
                    
                },
            });

            if (data.id) {
                await tx.dim_training_participants.deleteMany({
                    where: {
                        program_id: data.id,
                    },
                });
            }

            if (participants && participants.length > 0) {
                await tx.dim_training_participants.createMany({
                    data: participants.map((employee_id: number) => ({
                        program_id: seminar.id,
                        employee_id,
                        created_at: new Date(),
                        updated_at: new Date(),
                        status: 'enrolled'
                    })),
                });
            }

            return seminar;
        });

        return NextResponse.json({ id: seminar.id });
    } catch (error) {
        console.error("Error in upsert:", error);
        return NextResponse.json({ error: "Failed to save seminar: " + error }, { status: 500 });
    }
}
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { data } = body;

     
        const formattedData = {
            ...data,
            start_date: data.start_date ? 
                toGMT8(data.start_date).toISOString() : 
                toGMT8().toISOString(),
            end_date: data.end_date ? 
                toGMT8(data.end_date).toISOString() : 
                toGMT8().add(7, 'day').toISOString(),
            enrollement_date: data.enrollement_date ?
                toGMT8(data.enrollement_date).toISOString() :
                toGMT8().toISOString(),
            type: data.type || 'seminars',
        };

        const program = await prisma.$transaction(async (tx) => {
         
            const program = await tx.ref_training_programs.upsert({
                where: {
                    id: data.id || -1,
                },
                create: {
                    name: formattedData.name,
                    description: formattedData.description,
                    hour_duration: formattedData.hour_duration,
                    location: formattedData.location,
                    start_date: formattedData.start_date ? new Date(formattedData.start_date) : undefined,
                    end_date: formattedData.end_date ? new Date(formattedData.end_date) : undefined,
                    max_participants: formattedData.max_participants,
                    is_active: formattedData.is_active,
                    type: formattedData.type,
                    instructor_name: formattedData.instructor_name,
                    created_at: toGMT8().toDate(),
                    updated_at: toGMT8().toDate(),
                },
                update: {
                    name: formattedData.name,
                    description: formattedData.description,
                    hour_duration: formattedData.hour_duration,
                    location: formattedData.location,
                    start_date: formattedData.start_date ? new Date(formattedData.start_date) : undefined,
                    end_date: formattedData.end_date ? new Date(formattedData.end_date) : undefined,
                    max_participants: formattedData.max_participants,
                    instructor_name: formattedData.instructor_name,
                    is_active: formattedData.is_active,
                    type: formattedData.type,
                    updated_at: toGMT8().toDate(),
                },
            });

            // If updating an existing program, first delete existing participants
            if (data.id) {
                await tx.dim_training_participants.deleteMany({
                    where: {
                        program_id: data.id,
                    },
                });
            }

            // Add new participants with 'enrolled' status
            if (data.dim_training_participants && data.dim_training_participants.length > 0) {
                await tx.dim_training_participants.createMany({
                    data: data.dim_training_participants.map((participant: any) => ({
                        program_id: program.id,
                        employee_id: participant.employee_id,
                        // Use the program's enrollment date if participant doesn't have one
                        enrollement_date: participant.enrollement_date 
                            ? toGMT8(participant.enrollement_date).toDate() 
                            : new Date(formattedData.enrollement_date),
                        status: 'enrolled', 
                        created_at: toGMT8().toDate(),
                        updated_at: toGMT8().toDate(),
                        feedback: participant.feedback || null,
                    })),
                });
            }

            return program;
        });

        return NextResponse.json({ 
            id: program.id,
            start_date: program.start_date ? toGMT8(program.start_date).toISOString() : null,
            end_date: program.end_date ? toGMT8(program.end_date).toISOString() : null
        });
    } catch (error) {
        console.error("Error in upsert:", error);
        return NextResponse.json({ 
            error: "Failed to save program", 
            details: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
}
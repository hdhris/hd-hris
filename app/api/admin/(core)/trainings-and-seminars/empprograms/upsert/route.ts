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
            type: data.type || 'training',
        };

        const program = await prisma.$transaction(async (tx) => {
            // First update the program
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
                }
            });

            // If we have participants to manage
            if (data.dim_training_participants?.length > 0) {
                // Get current participants
                const existingParticipants = await tx.dim_training_participants.findMany({
                    where: { program_id: program.id }
                });

                // Create a map of existing participants for easy lookup
                const existingParticipantMap = new Map(
                    existingParticipants.map(p => [p.employee_id, p])
                );

                // Process each participant
                for (const participant of data.dim_training_participants) {
                    const existing = existingParticipantMap.get(participant.employee_id);
                    
                    if (!existing) {
                        // This is a new participant - create them
                        await tx.dim_training_participants.create({
                            data: {
                                program_id: program.id,
                                employee_id: participant.employee_id,
                                enrollement_date: new Date(formattedData.enrollement_date),
                                status: 'enrolled',
                                feedback: participant.feedback || null,
                                created_at: toGMT8().toDate(),
                                updated_at: toGMT8().toDate(),
                            }
                        });
                    }
                }

                // Set status to 'inactive' for removed participants
                const newParticipantIds = new Set(
                    data.dim_training_participants.map((p: { employee_id: number }) => p.employee_id)
                );
                
                const removedParticipants = existingParticipants.filter(
                    p => !newParticipantIds.has(p.employee_id)
                );

                // Update status instead of deleting
                for (const removed of removedParticipants) {
                    await tx.dim_training_participants.update({
                        where: { id: removed.id },
                        data: {
                            status: 'inactive',
                            updated_at: toGMT8().toDate(),
                        }
                    });
                }
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
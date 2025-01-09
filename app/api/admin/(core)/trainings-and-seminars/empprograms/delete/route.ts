import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id } = body;

        // First check if there are any associated participants
        const programWithParticipants = await prisma.ref_training_programs.findFirst({
            where: {
                id: id,
                dim_training_participants: {
                    some: {} // Check if there are any related participants
                } 
            }
        });

        if (programWithParticipants) {
            return NextResponse.json(
                {
                    status: "error",
                    message: "Cannot delete training program that has associated participants"
                },
                { status: 400 }
            );
        }

        // If no participants found, proceed with soft delete
        const deletedProgram = await prisma.ref_training_programs.update({
            where: {
                id: id
            },
            data: {
                deleted_at: new Date(),
                updated_at: new Date(),
            }
        });

        if (!deletedProgram) {
            return NextResponse.json(
                {
                    status: "error",
                    message: "Training program not found"
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            status: "success",
            message: "Training program marked as deleted",
            program: deletedProgram
        });

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json(
                {
                    status: "error",
                    message: "Database error occurred while deleting training program"
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                status: "error",
                message: "An unexpected error occurred"
            },
            { status: 500 }
        );
    }
}
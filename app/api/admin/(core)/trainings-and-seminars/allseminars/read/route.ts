import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        let idString = searchParams.get("id");
        
        const id = idString ? Number(idString) : null;

        // Get all employees
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
            },
            orderBy: {
                last_name: 'asc'
            }
        });

        // If ID is provided, get program details
        if (id) {
            const program = await prisma.ref_training_programs.findFirst({
                where: {
                    id: id,
                    deleted_at: null,
                    type: 'seminars'
                },
                include: {
                    dim_training_participants: {
                        select: {
                            employee_id: true,
                            enrollement_date: true,
                            status: true,
                            feedback: true,
                            trans_employees: {
                                select: {
                                    id: true,
                                    first_name: true,
                                    middle_name: true,
                                    last_name: true,
                                    email: true,
                                    picture: true
                                } 
                            }
                        },
                        orderBy: {
                            enrollement_date: 'desc'
                        }
                    },
                    trans_employees: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true
                        } 
                    }
                }
            });
            
            // Transform program data to include enrollment_date at program level
            const transformedProgram = program ? {
                ...program,
                enrollement_date: program.dim_training_participants.length > 0 
                    ? program.dim_training_participants[0].enrollement_date 
                    : null
            } : null;
            
            return NextResponse.json({ 
                program: transformedProgram, 
                employees 
            });
        }

        // If no ID, return just employees
        return NextResponse.json({ employees });

    } catch (error) {
        console.error("Error in read route:", error);
        return NextResponse.json({ 
            error: "Failed to fetch data", 
            details: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
}
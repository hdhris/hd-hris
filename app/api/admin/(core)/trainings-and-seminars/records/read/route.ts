import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

interface Participant {
  id: number;
  trans_employees: {
    id: number;
    first_name: string;
    last_name: string;
  };
}
export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const recordId = searchParams.get("id");
      const scheduleId = searchParams.get("scheduleId");
  
      // Fetch all active schedules
      const schedules = await prisma.dim_training_schedules.findMany({
        where: { deleted_at: null },
        select: {
          id: true,
          session_timestamp: true,
          ref_training_programs: {
            select: { id: true, name: true },
          },
        },
        orderBy: { session_timestamp: "desc" },
        distinct: ["id"],
      });
  
      let record = null;
    interface Employee {
      id: number;
      email: string | null;
      first_name: string;
      last_name: string;
      picture: string | null;
      ref_departments: {
        name: string | null;
      } | null;
    }

    interface TrainingParticipant {
      id: number;
      trans_employees: Employee | null;
    }

    let participants: TrainingParticipant[] = [];
  
      // If scheduleId provided, fetch participants for that schedule
      if (scheduleId) {
        participants = await prisma.dim_training_participants.findMany({
          where: {
            program_id: parseInt(scheduleId),
            terminated_at: null
          },
          select: {
            id: true,
            trans_employees: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                picture: true,
                ref_departments: {
                  select: { name: true }
                }
              }
            }
          }
        });
      }
  
      // If recordId provided, fetch specific record
      if (recordId) {
        record = await prisma.fact_training_records.findUnique({
          where: { id: parseInt(recordId) },
          include: {
            dim_training_participants: {
              include: {
                trans_employees: {
                  select: { 
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    picture: true,
                    ref_departments: {
                      select: { name: true }
                    }
                  },
                },
              },
            },
            dim_training_schedules: {
              include: {
                ref_training_programs: {
                  select: { id: true, name: true, type: true },
                },
              },
            },
          },
        });
  
        // Get participants for the record's schedule
        if (record?.dim_training_schedules?.id) {
          participants = await prisma.dim_training_participants.findMany({
            where: {
              program_id: record.dim_training_schedules.program_id,
              terminated_at: null
            },
            select: {
              id: true, 
              trans_employees: {
                select: {
                  id: true,
                  email: true,
                  first_name: true,
                  last_name: true,
                  picture: true,
                  ref_departments: {
                    select: { name: true }
                  }
                }
              }
            }
          });
        }
      }
  
      return NextResponse.json({ record, schedules, participants });
  
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
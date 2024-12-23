// app/api/admin/trainings-and-seminars/records/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export async function GET(req: NextRequest) {
  try {
    const records = await prisma.fact_training_records.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        dim_training_participants: {
          include: {
            trans_employees: {
              include: {
                ref_departments: true,
              }
            },
            ref_training_programs: {
              include: {
                trans_employees: {
                  select: {
                    first_name: true,
                    last_name: true,
                  }
                }
              }
            },
          }
        }
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const transformedRecords = records.map(({
      dim_training_participants: participant,
      ...record
    }) => {
      if (!participant) return null;

      const {
        trans_employees: employee,
        ref_training_programs: program,
        ...participantData
      } = participant;

      return {
        ...record,
        ...participantData,
        instructor_name: program?.instructor_name || "",
        ref_training_programs: {
          ...program,
          trans_employees: {
            first_name: program?.trans_employees?.first_name || "",
            last_name: program?.trans_employees?.last_name || "",
          }
        },
        trans_employees: {
          picture: employee?.picture || "",
          email: employee?.email || "",
          first_name: employee?.first_name || "",
          last_name: employee?.last_name || "",
          ref_departments: {
            name: employee?.ref_departments?.name || ""
          }
        }
      };
    }).filter(Boolean);

    return NextResponse.json(transformedRecords);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}
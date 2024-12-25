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
              select: {
                id: true,
                picture: true,
                email: true,
                first_name: true, 
                last_name: true,
                ref_departments: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        dim_training_schedules: {
          include: {
            ref_training_programs: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Failed to fetch training records:", error);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') as string;
    // const date = "2024-09-07";
    const isoDateStart = new Date(`${date}T00:00:00.000Z`).toISOString();
    const isoDateEnd = new Date(`${date}T23:59:59.999Z`).toISOString();
    const attendances = await prisma.log_attendances.findMany({
      include: {
        trans_employees: {
          select: {
            last_name: true,
            first_name: true,
            middle_name: true,
            picture: true,
          },
        },
      },
      where: {
        timestamp: {
          gte: isoDateStart,
          lt: isoDateEnd, // Matches records within the day
        },
      },
    });
    return NextResponse.json(attendances);
  } catch (error) {
    console.error("Error fetching attendances:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

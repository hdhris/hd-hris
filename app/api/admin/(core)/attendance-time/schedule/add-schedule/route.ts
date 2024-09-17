// /pages/api/batch-schedule.ts
import { PrismaClient } from "@prisma/client";
import { NextApiResponse } from "next";

const prisma = new PrismaClient();

export async function POST(req: Request, res: NextApiResponse) {
  try {
    const { name, startTime, endTime } = await req.json();

    // Get the current date and extract the date string
    const date = new Date();
    const dateString = date.toISOString().split("T")[0]; // Get YYYY-MM-DD format

    // Combine date with time
    const clockInDateTime = new Date(`${dateString}T${startTime}`);
    const clockOutDateTime = new Date(`${dateString}T${endTime}`);

    const batchSchedule = await prisma.ref_batch_schedules.create({
      data: {
        name: name,
        clock_in: clockInDateTime,
        clock_out: clockOutDateTime,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    res.status(201).json(batchSchedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating batch schedule" });
  }
}

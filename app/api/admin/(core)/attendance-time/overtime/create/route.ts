import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { number } from "zod";
import { toGMT8 } from "@/lib/utils/toGMT8";
import dayjs from "dayjs";

export async function POST(req: NextRequest) {
  const { data, empId } = await req.json();

  try {
    console.log(data,empId);
    const overtime = await prisma.trans_overtimes.create({
      data: {
        employee_id: empId,
        clock_out: toGMT8(data.clock_out),
        clock_in: toGMT8(data.clock_in),
        comment: data.comment,
        date: toGMT8(dayjs(data.date,'YYYY-mm-dd').toISOString()),
        created_at: toGMT8(new Date()),
        updated_at: toGMT8(new Date()),
      },
    });
    console.log(overtime);

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error: ", error);
    return NextResponse.json(
      { error: "Failed to post data" },
      { status: 500 }
    );
  }
}

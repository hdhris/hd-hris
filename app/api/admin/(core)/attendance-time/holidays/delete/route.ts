import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { HolidayEvent } from "@/types/attendance-time/HolidayTypes";
import { toGMT8 } from "@/lib/utils/toGMT8";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const request = await req.json();
  console.log(request);
  const { holidayID, transHolidayID } = request;
  try {
    await prisma.$transaction(async (pm) => {
      await pm.ref_holidays.update({
        where: {
          id: holidayID,
        },
        data: {
          deleted_at: toGMT8().toISOString(),
        },
      });

      transHolidayID &&
        (await pm.trans_holidays.update({
          where: {
            date: {
              not: null,
            },
            id: transHolidayID,
          },
          data: {
            deleted_at: toGMT8().toISOString(),
          },
        }));
    });
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

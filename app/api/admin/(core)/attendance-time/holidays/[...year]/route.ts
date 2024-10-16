import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { HolidayEvent } from "@/types/attendance-time/HolidayTypes";
import { toGMT8 } from "@/lib/utils/toGMT8";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";

// Helper function to determine if a holiday is public
const isPublicHoliday = (description: string): boolean => {
  return description.toLowerCase().includes("public holiday");
};

export async function GET(
  req: NextRequest,
  { params }: { params: { year: string } }
) {
  try {
    const year = Number(params.year);
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!calendarId || !apiKey) {
      throw new Error("Missing Google Calendar API credentials");
    }

    // Fetching holiday data from Google Calendar API
    const { data } = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}`
    );

    // Map and filter the relevant events
    const googleHolidays: HolidayEvent[] = data.items
      .map((event: any) => ({
        id: event.id,
        name: event.summary,
        start_date: event.start?.date || event.start?.dateTime,
        end_date: event.end?.date || event.end?.dateTime,
        created_at: event.created,
        updated_at: event.updated,
        type: isPublicHoliday(event.description || "")
          ? "Public Holiday"
          : "Observance",
      }))
      .filter(
        (event: HolidayEvent) => toGMT8(event.start_date).get("year") === year
      )
    // .filter((event: HolidayEvent) => event.isPublicHoliday); // Return only public holidays

    const privateHolidays = (await prisma.ref_holidays.findMany({
      where: {
        deleted_at: null,
      },
    }))
    .map((holiday) => ({
      ...holiday,
      start_date: toGMT8(holiday.start_date!).year(toGMT8().year()).toISOString(),
      end_date: toGMT8(holiday.end_date!).year(toGMT8().year()).toISOString(),
    })) as HolidayEvent[];
    

    const combinedHolidays = [...googleHolidays, ...privateHolidays].sort(
      (a: HolidayEvent, b: HolidayEvent) =>
        toGMT8(a.start_date).valueOf() - toGMT8(b.start_date).valueOf()
    );
    return NextResponse.json(combinedHolidays);
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';
import { HolidayEvent } from "@/types/attendance-time/HolidayTypes";
import { toGMT8 } from "@/lib/utils/toGMT8";

export const dynamic = "force-dynamic";


// Helper function to determine if a holiday is public
const isPublicHoliday = (description: string): boolean => {
  return description.toLowerCase().includes('public holiday');
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
    const holidays: HolidayEvent[] = data.items
      .map((event: any) => ({
        id: event.id,
        name: event.summary,
        // description: event.description || '',
        startDate: event.start?.date || event.start?.dateTime,
        endDate: event.end?.date || event.end?.dateTime,
        isPublicHoliday: isPublicHoliday(event.description || ''),
      }))
      .filter((event: HolidayEvent) => toGMT8(event.startDate).get('year') === year)
      .sort((a: HolidayEvent, b: HolidayEvent) => toGMT8(a.startDate).valueOf() - toGMT8(b.startDate).valueOf());
      // .filter((event: HolidayEvent) => event.isPublicHoliday); // Return only public holidays

    return NextResponse.json(holidays);
    
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

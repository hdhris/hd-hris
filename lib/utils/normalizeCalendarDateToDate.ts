import { CalendarDate } from "@internationalized/date";

export const normalizeCalendarDateToDate = (calendarDate: CalendarDate): Date => {
    // Use the year, month, and day to upsert a Date object
    return new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day);
};


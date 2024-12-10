import { CalendarDate, isWeekend } from "@internationalized/date";
import dayjs from "dayjs";

export function countDays(start: string, end: string, locale: string): string {
    const startDate = dayjs(start);
    const endDate = dayjs(end);

    let currentCalendarDate = new CalendarDate(startDate.year(), startDate.month() + 1, startDate.date());
    let currentDate = startDate;
    let businessDays = 0;

    while (startDate.isBefore(endDate, 'day')) {
        // Check if the current day is not a weekend or holiday
        if (!isWeekend(currentCalendarDate, locale)) {
            businessDays++;
        }
        currentDate = currentDate.add(1, 'day');
    }

    // Now calculate the remaining hours and minutes if needed
    const remainingHours = endDate.diff(currentDate, 'hour');
    const remainingMinutes = endDate.diff(currentDate, 'minute') % 60;

    return `${businessDays} business days, ${remainingHours} hours, ${remainingMinutes} minutes`;
}
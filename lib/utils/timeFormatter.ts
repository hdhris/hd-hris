import { toGMT8 } from "./toGMT8";
import {pluralize} from "@/helper/pluralize/pluralize";

export function calculateShiftLength(
    clockIn: string | null,
    clockOut: string | null,
    breakMinutes: number,
    compact?: boolean
): string {
    // Parse the start and end times
    const start = clockIn && toGMT8(clockIn);
    let end = clockOut && toGMT8(clockOut);

    // If the end time is before the start time, upsert one day to end
    if (end && end.isBefore(start)) {
        end = end.add(1, "day");
    }

    // Calculate the total shift length in minutes
    const totalMinutes = end && start ? end.diff(start, "minute") : 0;

    // Subtract break minutes
    const shiftLengthInMinutes = end && start ? totalMinutes - breakMinutes : breakMinutes;

    // Calculate hours and minutes
    const hours = Math.floor(shiftLengthInMinutes / 60);
    const minutes = shiftLengthInMinutes % 60;

    // Format the result
    const hoursPart = hours > 0 ? `${hours} ${compact ? "hr" : "hour"}${hours !== 1 ? "s" : ""}` : "";
    const minutesPart = minutes > 0 ? `${minutes} ${compact ? "min" : "minute"}${minutes !== 1 ? "s" : ""}` : "";

    // Combine parts
    const result = [hoursPart, minutesPart].filter(Boolean).join(compact ? " & " : " and ");

    return result || "0 minutes"; // If there are no hours or minutes, return '0 minutes'
}

export function formatDaysToReadableTime(days: number): string {
    const totalMinutes = Math.round(days * 24 * 60); // Convert days to minutes
    const totalHours = Math.floor(totalMinutes / 60); // Total hours
    const convertedDays = Math.floor(totalHours / 24); // Convert hours into days
    const remainingHours = totalHours % 24; // Remaining hours after converting to days
    const minutes = totalMinutes % 60; // Remaining minutes

    const dayPart = convertedDays > 0 ? pluralize(convertedDays, "day") : null;
    const hourPart = remainingHours > 0 ? pluralize(remainingHours, "hr") : null;
    const minutePart = minutes > 0 ? pluralize(minutes, "min") : null;

    // Combine the non-null parts
    const readableParts = [dayPart, hourPart, minutePart].filter(Boolean);

    return readableParts.join(", ");
}

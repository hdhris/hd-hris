import { toGMT8 } from "./toGMT8";

export function calculateShiftLength(
  clockIn: string | null,
  clockOut: string | null,
  breakMinutes: number
): string {

  // Parse the start and end times
  const start = clockIn && toGMT8(clockIn);
  let end = clockOut && toGMT8(clockOut);

  // If the end time is before the start time, add one day to end
  if (end && end.isBefore(start)) {
    end = end.add(1, 'day');
  }

  // Calculate the total shift length in minutes
  const totalMinutes = (end && start) ? end.diff(start, 'minute') : 0;

  // Subtract break minutes
  const shiftLengthInMinutes = (end && start) ? totalMinutes - breakMinutes : breakMinutes;

  // Calculate hours and minutes
  const hours = Math.floor(shiftLengthInMinutes / 60);
  const minutes = shiftLengthInMinutes % 60;

  // Format the result
  const hoursPart = hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''}` : '';
  const minutesPart = minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''}` : '';

  // Combine parts
  const result = [hoursPart, minutesPart].filter(Boolean).join(' and ');

  return result || '0 minutes'; // If there are no hours or minutes, return '0 minutes'
}

import { toGMT8 } from "@/lib/utils/toGMT8";
import { useQuery } from "@/services/queries";
import { HolidayData } from "@/types/attendance-time/HolidayTypes";
import { parseDate, DateValue } from "@internationalized/date";
import { useEffect, useMemo } from "react";

// Custom hook to handle holiday logic
export const useHolidays = () => {
  const { data: holidays } = useQuery<HolidayData>(`/api/admin/attendance-time/holidays/adjacents/${toGMT8().year()}`);

  // Compute disabled date ranges
  const disabledRanges = useMemo(() => {
    if (holidays) {
      return holidays.combinedHolidays
        .filter((holiday) => holiday.type === "Public Holiday")
        .map((holiday) => [
          parseDate(toGMT8(holiday.start_date).format("YYYY-MM-DD")),
          parseDate(toGMT8(holiday.end_date).format("YYYY-MM-DD")),
        ]);
    }
    return [];
  }, [holidays]);

  // Memoized function to check if a date is unavailable
  const isDateUnavailable = useMemo(() => {
    return (date: DateValue): boolean =>
      disabledRanges.some(([start, end]) => date.compare(start) >= 0 && date.compare(end) < 0);
  }, [disabledRanges]);

  return { isDateUnavailable };
};

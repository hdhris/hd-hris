import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

export function toGMT8(value?: string | Date): dayjs.Dayjs {
  if (value === undefined) {
    return dayjs.utc(new Date(new Date().getTime() + 8 * 60 * 60 * 1000));
  }

  if (value instanceof Date) {
    return dayjs.utc(new Date(value.getTime() + 8 * 60 * 60 * 1000));
  }

  const dateTimeString = typeof value === "string" ? value.trim() : "";

  if (dayjs(dateTimeString).isValid()) {
    return dayjs.utc(dateTimeString);

  } else if (dayjs(dateTimeString, "hh:mm", true).isValid()) {
    return dayjs.utc(dateTimeString, "hh:mm", true);
  } else if (dayjs(dateTimeString, "hh:mm:ss", true).isValid()) {
    return dayjs.utc(dateTimeString, "hh:mm:ss", true);

  } else if (dayjs(dateTimeString, "HH:mm", true).isValid()) {
    return dayjs.utc(dateTimeString, "HH:mm", true);
  } else if (dayjs(dateTimeString, "HH:mm:ss", true).isValid()) {
    return dayjs.utc(dateTimeString, "HH:mm:ss", true);

  } else if (dayjs(dateTimeString, "HH:MM", true).isValid()) {
    return dayjs.utc(dateTimeString, "HH:MM", true);
  } else if (dayjs(dateTimeString, "HH:MM:SS", true).isValid()) {
    return dayjs.utc(dateTimeString, "HH:MM:SS", true);
  }

  return dayjs.utc(value);
}

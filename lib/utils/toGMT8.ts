import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export function toGMT8(value: string | Date): dayjs.Dayjs {
  if (value instanceof Date) {
    return dayjs(value).utcOffset(8);
  }

  const dateTimeString = typeof value === 'string' ? value : '';

  const parsedDate = dayjs(dateTimeString);

  if (parsedDate.isValid()) {
    return dayjs.utc(dateTimeString);
  }
  throw new Error('Invalid input: Expected a date string or time string, or Date object.');
  
}
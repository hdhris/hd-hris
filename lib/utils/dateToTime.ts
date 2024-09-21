import { Time } from "@internationalized/date";

export function dateToTime(date: Date): Time {
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
  
    return new Time(hours, minutes, seconds);
  }
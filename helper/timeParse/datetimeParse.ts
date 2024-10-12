import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
export class Time {
  private _time: string;

  constructor(time: string) {
    const value = time.trim();

    // Check if the value is a valid ISO string
    const isISO = dayjs(value).isValid() && value === dayjs(value).toISOString();

    // Check if the value is a valid time (HH:mm or HH:mm:ss)
    const isTime = dayjs(value, "HH:mm", true).isValid() || dayjs(value, "HH:mm:ss", true).isValid();

    // Throw an error if the value is neither a valid ISO string nor a valid time
    if (!isISO && !isTime) {
      throw new Error("Value is not a valid ISO date or time");
    } else {
      this._time = value; // Assign the valid value to _time
    }
  }

  // Getter for the ISO string
  get isoString(): string {
    // return this._time;
    return this._time;
  }
}
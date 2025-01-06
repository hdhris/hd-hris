import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration';
import {toGMT8} from "@/lib/utils/toGMT8";
dayjs.extend(duration);

type TimeDifference = {
    years?: number;
    months?: number;
    days?: number;
    hours?: number;
    minutes?: number;
};
export const getDateRequestedAgo = (referenceDate: Date, isDay?: boolean): string => {
    const currentDate = new Date();
    // const formatter = new Intl.DateTimeFormat('en-US', {
    //     hour12: true,
    //     hour: 'numeric',
    //     minute: '2-digit',
    //     timeZone: 'UTC'
    // });
    const referenceTime = currentDate.getTime() - referenceDate.getTime(); // Calculate the difference in milliseconds

    // Convert milliseconds to minutes, hours, or days
    const minutes = Math.abs(Math.floor(referenceTime / (1000 * 60)));
    const hours = Math.abs(Math.floor(minutes / 60));
    const days = Math.abs(Math.floor(hours / 24));

    if(!isDay) {
        if (minutes < 60) {
            return `${referenceDate.toLocaleDateString()} - ${minutes} mins ago`;
        } else if (hours < 24) {
            return `${referenceDate.toLocaleDateString()} - ${hours} hrs ago`;
        } else {
            return `${referenceDate.toLocaleDateString()} - ${days} days ago`;
        }
    } else{
        return `${days} days ago`;
    }


};

export const  calculateRemainingDays = (targetDate: string) => {
    const now = dayjs(); // Current date
    const target = dayjs(targetDate); // Target date

    // Calculate the duration between now and the target date
    const diff = dayjs.duration(target.diff(now));

    // Create the result object with only non-zero values
    const result: TimeDifference = {
        years: diff.years() > 0 ? diff.years() : undefined,
        months: diff.months() > 0 ? diff.months() : undefined,
        days: diff.days() > 0 ? diff.days() : undefined,
        hours: diff.hours() > 0 ? diff.hours() : undefined,
        minutes: diff.minutes() > 0 ? diff.minutes() : undefined
    };

    // Construct the result string
    const timeUnits = [
        { unit: 'yr/s', value: result.years },
        { unit: 'mo/s', value: result.months },
        { unit: 'day/s', value: result.days },
        { unit: 'hr/s', value: result.hours },
        { unit: 'min/s', value: result.minutes }
    ];

    // Filter out zero or undefined values and format the string
    return timeUnits
        .filter(({ value }) => value !== undefined && value > 0)
        .map(({ unit, value }) => `${value}${unit}`)
        .join(' ');
};

export const getRandomDateTime = (startDate: Date, endDate: Date): Date => {
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();
    const randomTimestamp = startTimestamp + Math.random() * (endTimestamp - startTimestamp);
    const randomDate = new Date(randomTimestamp);

    // Randomize hours, minutes, seconds, and milliseconds
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    const seconds = Math.floor(Math.random() * 60);
    const milliseconds = Math.floor(Math.random() * 1000);

    randomDate.setHours(hours, minutes, seconds, milliseconds);

    return randomDate;
};

export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
export const getMonthAsDayjs = (month: string, year: number): string => dayjs(`${month}-01-${year}`).format('YYYY-MM-DD');

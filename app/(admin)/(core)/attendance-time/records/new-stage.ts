import { toGMT8 } from "@/lib/utils/toGMT8";
import {
    AttendanceLog,
    EmployeeSchedule,
    InStatus,
    LogStatus,
    OutStatus,
    punchIN,
    punchOUT,
} from "@/types/attendance-time/AttendanceTypes";

export async function getAttendanceStatus({
    date,
    schedules,
    logs,
    rate_per_minute,
    onLeave,
    overtime,
}: {
    onLeave?: {
        id: number;
        start_timestamp: string;
        end_timestamp: string;
    };
    overtime?: {
        id: number;
        requested_mins: number;
        timestamp: string;
    };
    date: string;
    schedules: EmployeeSchedule[];
    logs?: AttendanceLog[];
    rate_per_minute: number;
}): Promise<LogStatus> {
    const schedule = getAccurateEmployeeSchedule(schedules, date);
    // Skip if current employee has invalid schedule
    if (!schedule)
        return {
            amIn: {
                id: null,
                status: "unscheduled",
                time: null,
            },
            amOut: {
                id: null,
                status: "unscheduled",
                time: null,
            },
            pmIn: {
                id: null,
                status: "unscheduled",
                time: null,
            },
            pmOut: {
                id: null,
                status: "unscheduled",
                time: null,
            },
            renderedShift: 0,
            renderedUndertime: 0,
            renderedLeave: 0,
            renderedOvertime: 0,
            paidShift: 0,
            deductedUndertime: 0,
            paidLeave: 0,
            paidOvertime: 0,
        };

    const offset = 0; // Time offset for GMT+8
    const gracePeriod = 5; // 5 min grace period
    const organizedLogs = logs?.sort((a, b) => toGMT8(a.timestamp).diff(toGMT8(b.timestamp)));
    const currentDay = toGMT8(date);
    const dayNames = schedule?.days_json;

    let amIn: punchIN = {
        id: null,
        status: "absent",
        time: null,
    };

    let amOut: punchOUT = {
        id: null,
        status: "absent",
        time: null,
    };

    let pmIn: punchIN = {
        id: null,
        status: "absent",
        time: null,
    };

    let pmOut: punchOUT = {
        id: null,
        status: "absent",
        time: null,
    };

    let renderedOvertime = 0;
    let renderedLeave = 0;
    let renderedShift = 0;
    let renderedUndertime = 0;

    const scheduleTimeIn = toGMT8(schedule.clock_in).subtract(offset, "hours").year(currentDay.year()).month(currentDay.month()).date(currentDay.date());
    const scheduleTimeOut = toGMT8(schedule.clock_out).subtract(offset, "hours").year(currentDay.year()).month(currentDay.month()).date(currentDay.date());

    if (!dayNames?.includes(currentDay.format("ddd").toLowerCase())) {
        amIn = {
            id: null,
            status: "no work",
            time: null,
        };
        amOut = {
            id: null,
            status: "no work",
            time: null,
        };
        pmIn = {
            id: null,
            status: "no work",
            time: null,
        };
        pmOut = {
            id: null,
            status: "no work",
            time: null,
        };
    } else {
        if (organizedLogs) {
            if (organizedLogs) {
                // For each entry log of the employee
                organizedLogs.forEach((log) => {
                    // Convert the timestamp of the log to dayjs(toGMT8)
                    const timestamp = toGMT8(log.timestamp).subtract(offset, "hours");

                    // For punched IN logs or "Morning/Afternoon entry"
                    if (log.punch === 0) {
                        // If time-in is 4hrs closer to clock-in schedule...
                        // Consider it as an AM time in
                        if (timestamp.hour() - scheduleTimeIn.hour() < 4) {
                            // "LATE" if time-in is 5mins later than clock-in schedule...
                            const stat: InStatus =
                                timestamp.minute() - scheduleTimeIn.minute() > gracePeriod ? "late" : "ontime";
                            amIn = {
                                id: log.id, // Record the log ID for later reference
                                time: timestamp.toISOString(),
                                status: stat, // Record the status label for later reference
                            };
                            // If time-in is 4hrs further from clock-in schedule...
                            // Consider it as a PM time in
                        } else {
                            // Initialize as no break if the employee has not punched out at morning yet
                            // let stat: InStatus = "no break";
                            let stat: InStatus = "no break";

                            // If the employee has punched out at morning...
                            if (amOut) {
                                // Check if PM time-in has passed the break-mins schedule after AM time-out....
                                stat =
                                    timestamp.diff(toGMT8(amOut.time!).subtract(offset, "hours"), "minute") >
                                    schedule.break_min
                                        ? "late"
                                        : "ontime"; // Otherwise, its closer to break-mins duration schedule
                                // If the employee has no punch outs at morning. The employee might be absent at morning
                            } else {
                                // "ONTIME" if time-in is 5 mins earlier than grace period
                                if (timestamp.hour() === 13 && timestamp.minute() <= gracePeriod) {
                                    stat = "ontime";
                                    // Otherwise, "Late"
                                } else {
                                    stat = "late";
                                }
                            }
                            pmIn = {
                                id: log.id,
                                time: timestamp.toISOString(),
                                status: stat,
                            };
                        }

                        // For punched OUT logs or "Morning/Afternoon exit"
                    } else {
                        // If time-out is 4hrs earlier than clock-out schedule...
                        // Consider it as an AM time out
                        if (scheduleTimeOut.hour() - timestamp.hour() > 4) {
                            // Initialize as "LUNCH" if the employee has not punched in at afternoon yet
                            let stat: OutStatus = "lunch";
                            // Prepare to check if AM time-out is today and if PM time-in doesn't exist
                            const today = toGMT8().subtract(offset, "hours").startOf("day");
                            const logDate = timestamp.startOf("day");
                            // If not today, its history
                            if (!logDate.isSame(today, "day")) {
                                // If employee has not punched in at afternoon...
                                // considered it as "EARLY OUT"
                                if (!pmIn) stat = "early-out";
                            }
                            amOut = {
                                id: log.id,
                                time: timestamp.toISOString(),
                                status: stat,
                            };

                            // If time-out is 4hrs closer to clock-out schedule...
                            // Consider it as a PM time out
                        } else {
                            // Overtime if time-out is 5mins later than clock-out schedule
                            // Temporary variable to match dates between clock-out and time-out date
                            const tempTimeOut = scheduleTimeOut
                                .year(timestamp.year())
                                .month(timestamp.month())
                                .date(timestamp.date());
                            const stat: OutStatus =
                                timestamp.diff(tempTimeOut, "minutes") > gracePeriod
                                    ? "overtime"
                                    : timestamp.diff(tempTimeOut, "minutes") < -gracePeriod
                                    ? "early-out" // Early if time-out is 5mins earlier than clock-out schedule
                                    : "ontime"; // Otherwise, its closer to clock out schedule
                            pmOut = {
                                id: log.id,
                                time: timestamp.toISOString(),
                                status: stat,
                            };
                        }
                    }
                });
            }
        }

        // After iteration of existing logs, there maybe
        // some attendance category (e.g AM-in, AM-out, PM-in, and PM-out) is left unstated.
        // Perform a validation if it is considered "ABSENT" or "NO BREAK"

        // If not punched IN at morning, mark as absent
        if (!amIn.time) {
            amIn = {
                id: null,
                time: null,
                status: "absent",
            };
        }
        // If not punched OUT at morning...
        if (!amOut.time) {
            // Mark absent if not also punched OUT at afternoon
            // or not also punched IN at morning
            if (!amIn?.time || !pmOut?.time) {
                amOut = {
                    id: null,
                    time: null,
                    status: "absent",
                };

                // Mark no break if employee had eventually punched OUT at afternoon
            } else {
                amOut = {
                    id: null,
                    time: null,
                    status: "no break",
                };
            }
        }
        // If not punched IN at afternoon...
        if (!pmIn.time) {
            // Mark absent if not also punched IN at morning
            if (!amIn?.time) {
                pmIn = {
                    id: null,
                    time: null,
                    status: "absent",
                };

                // Mark no break if employee had actually punched IN at morning
            } else {
                pmIn = {
                    id: null,
                    time: null,
                    status: "no break",
                };
            }
        }
        // If not punched OUT at afternoon, mark as absent
        if (!pmOut.time) {
            pmOut = {
                id: null,
                time: null,
                status: "absent",
            };
        }
        // Get the minutes rendered from overall log entry
        // Ignore entry such as:
        // MORNING: punch OUT but no punch IN
        // AFTERNOON: punch OUT but no punch IN
        const shiftLength = ((): number => {
            // Initializing morning and afternoon duration
            let morning = 0;
            let afternoon = 0;
            // If time-in and time-out for morning is valid
            if (amIn?.time && amOut.time) {
                morning = toGMT8(amOut.time)
                    .subtract(offset, "h")
                    .diff(toGMT8(amIn.time).subtract(offset, "h"), "minute");
            }
            // If time-in and time-out for afternoon is valid
            if (pmIn?.time && pmOut.time) {
                afternoon = toGMT8(pmOut.time)
                    .subtract(offset, "h")
                    .diff(toGMT8(pmIn.time).subtract(offset, "h"), "minute");
            }

            // For special cases with employees who took no breaks
            // such as when an employee had punched IN at morning
            // but never punched OUT at morning and never punched IN
            // at afternoon but had punched OUT at afternoon
            //    amIN:  time-in
            //    amOUT: x
            //    pmIN:  x
            //    pmOUT: time-out
            // this can be considered as valid, but lunch break still won't
            // be added with rendered work minutes (unless applied for overtime)
            if (amIn?.time && !amOut?.time && !pmIn?.time && pmOut?.time) {
                afternoon = toGMT8(pmOut.time)
                    .subtract(offset, "h")
                    .diff(toGMT8(amIn.time).subtract(offset, "h"), "minute");
            }
            // Return the combined shift length
            return morning + afternoon;
        })();

        // Get the actual shift length of an employee
        const factShiftLength = scheduleTimeOut.diff(scheduleTimeIn, "minute") - schedule.break_min;

        // Rendered shift lenght must never exceed actaul shift length
        renderedShift = Math.min(shiftLength, factShiftLength);
        // Instead, record the overtime length for employee's log record
        // renderedOvertime = shiftLength > factShiftLength ? shiftLength - factShiftLength : 0;
        renderedOvertime = pmOut.time ? toGMT8(pmOut.time).diff(scheduleTimeOut,'minutes') : 0;
        // Also record the undertime length for employee's log record
        renderedUndertime = shiftLength < factShiftLength ? factShiftLength - shiftLength : 0;

        if (onLeave) {
            const startTimestamp = toGMT8(onLeave.start_timestamp).subtract(offset, "h");
            const endTimestamp = toGMT8(onLeave.end_timestamp).subtract(offset, "h");

            if (startTimestamp.hour() < 12) {
                amIn = {
                    id: onLeave.id,
                    status: "on leave",
                    time: onLeave.start_timestamp,
                };
            } else {
                pmIn = {
                    id: onLeave.id,
                    status: "on leave",
                    time: onLeave.start_timestamp,
                };
            }

            if (endTimestamp.hour() < 13) {
                amOut = {
                    id: onLeave.id,
                    status: "on leave",
                    time: onLeave.end_timestamp,
                };
            } else {
                pmOut = {
                    id: onLeave.id,
                    status: "on leave",
                    time: onLeave.end_timestamp,
                };
            }

            renderedLeave = Math.abs(endTimestamp.diff(startTimestamp, "minutes"));
        }
    }

    return {
        amIn,
        amOut,
        pmIn,
        pmOut,
        clockIn: schedule.clock_in,
        clockOut: schedule.clock_out,
        renderedShift,
        renderedUndertime,
        renderedLeave,
        renderedOvertime,
        paidShift: renderedShift * rate_per_minute,
        deductedUndertime: renderedUndertime * rate_per_minute,
        paidLeave: renderedLeave * rate_per_minute,
        paidOvertime: overtime ? overtime.requested_mins * rate_per_minute : 0,
    };
}

export const getAccurateEmployeeSchedule = (employeeSchedules: EmployeeSchedule[], logDate: string) => {
    // Parse logDate with Day.js
    const logDay = toGMT8(logDate);

    // Try to find a schedule where logDay is within the range
    const rangedDateSchedule = employeeSchedules.find((schedule) => {
        if (!schedule.end_date) return false;

        // Parse startDate and endDate
        const startDate = toGMT8(schedule.start_date.split("T")[0]);
        const endDate = toGMT8(schedule.end_date.split("T")[0]);

        // Check if logDay is within the date range
        return logDay.isSameOrAfter(startDate) && logDay.isSameOrBefore(endDate);
    });

    // If no schedule found in range, check for open-ended schedules
    if (!rangedDateSchedule) {
        return (
            employeeSchedules.find((schedule) => {
                const startDate = toGMT8(schedule.start_date.split("T")[0]);
                const endDate = schedule.end_date;

                // Check if logDay is after startDate and the schedule has no endDate
                return logDay.isSameOrAfter(startDate) && !endDate;
            }) || null
        );
    }

    return rangedDateSchedule;
};

import { isEmployeeAvailable } from "@/helper/employee/unavailableEmployee";
import { BasicEmployee } from "@/helper/include-emp-and-reviewr/include";
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
import { result } from "lodash";

const emptyAmount = {
    renderedShift: 0,
    renderedUndertime: 0,
    renderedLeave: 0,
    renderedOvertime: 0,
    paidShift: 0,
    deductedUndertime: 0,
    paidLeave: 0,
    paidOvertime: 0,
};
export async function getAttendanceStatus({
    employee,
    date,
    schedules,
    logs,
    rate_per_minute,
    increase_rate,
    leave,
    overtime,
}: {
    employee: BasicEmployee;
    increase_rate: number;
    leave?: {
        id: number;
        start_date: string;
        end_date: string;
        trans_leave_types: {
            ref_leave_type_details: {
                paid_leave: boolean;
            };
        };
    };
    overtime?: {
        id: number;
        requested_mins: number;
        timestamp: string;
    };
    date: string;
    schedules: EmployeeSchedule[] | null | undefined;
    logs?: AttendanceLog[];
    rate_per_minute: number;
}): Promise<LogStatus> {
    if (!isEmployeeAvailable({ employee, find: ["resignation", "termination", "hired"], date, })){
        return {
            amIn: {
                id: null,
                status: "unhired",
                time: null,
            },
            amOut: {
                id: null,
                status: "unhired",
                time: null,
            },
            pmIn: {
                id: null,
                status: "unhired",
                time: null,
            },
            pmOut: {
                id: null,
                status: "unhired",
                time: null,
            },
            ...emptyAmount,
        };
    }
        
    const schedule = getAccurateEmployeeSchedule({ logDate: date, employeeSchedules: schedules ?? [] });
    // Skip if current employee has invalid schedule
    if (!schedule){
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
            ...emptyAmount,
        };
    }
        
    const notSuspended = isEmployeeAvailable({employee, find:["suspension"]});
    const offset = 0; // Time offset for GMT+8
    const gracePeriod = 5; // 5 min grace period
    const organizedLogs = logs?.sort((a, b) => toGMT8(a.timestamp).diff(toGMT8(b.timestamp)));
    const currentDay = toGMT8(date).startOf('day');
    const today = toGMT8().subtract(offset, "hours").startOf("day");
    const dayNames = schedule?.days_json;
    let renderedOvertime = 0;
    let renderedLeave = 0;
    let renderedShift = 0;
    let renderedUndertime = 0;

    const scheduleTimeIn = toGMT8(schedule.clock_in)
        .subtract(offset, "hours")
        .year(currentDay.year())
        .month(currentDay.month())
        .date(currentDay.date());
    const scheduleTimeOut = toGMT8(schedule.clock_out)
        .subtract(offset, "hours")
        .year(currentDay.year())
        .month(currentDay.month())
        .date(currentDay.date());

    const awaitMornningIn = today.isBefore(currentDay) || today.isSame(currentDay) && toGMT8().isSameOrBefore(scheduleTimeIn);
    const awaitMornningOut = today.isBefore(currentDay) || today.isSame(currentDay) && toGMT8().hour() <= 12;
    const awaitAfternoonIn = today.isBefore(currentDay) || today.isSame(currentDay) && toGMT8().hour() < 13;
    const awaitAfternoonOut = today.isBefore(currentDay) || today.isSame(currentDay) && toGMT8().isSameOrBefore(scheduleTimeOut);

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

    // console.log({scheduleTimeIn:scheduleTimeIn.toISOString(), scheduleTimeOut: scheduleTimeOut.toISOString()})

    if (!dayNames?.includes(currentDay.format("ddd").toLowerCase()) && notSuspended) {
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
                organizedLogs
                // .filter(()=> !notSuspended)
                .forEach((log) => {
                    // Convert the timestamp of the log to dayjs(toGMT8)
                    const timestamp = toGMT8(log.timestamp).subtract(offset, "hours");

                    // For punched IN logs or "Morning/Afternoon entry"
                    if (log.punch === 0) {
                        // If time-in is same or below 12pm...
                        // Consider it as an AM time in
                        if (timestamp.hour() <= 12) {
                            // "LATE" if time-in is 5mins later than clock-in schedule...
                            const stat: InStatus =
                                timestamp.diff(scheduleTimeIn) > gracePeriod ? "late" : "ontime";
                            amIn = {
                                id: log.id, // Record the log ID for later reference
                                time: timestamp.toISOString(),
                                status: stat, // Record the status label for later reference
                            };
                            // If time-in over 12pm...
                            // Consider it as a PM time in
                        } else {
                            // Initialize as no break if the employee has not punched out at morning yet
                            let stat: InStatus = "no break";

                            // If the employee has punched out at morning...
                            if (amOut.time) {
                                // Check if PM time-in has passed the break-mins schedule after AM time-out....
                                stat =
                                    timestamp.diff(toGMT8(amOut.time).subtract(offset, "hours"), "minute") >
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
                        // If time-out is same or below 12pm...
                        // Consider it as an AM time out
                        if (timestamp.hour() <= 12) {
                            // Initialize as "LUNCH" if the employee has not punched in at afternoon yet
                            let stat: OutStatus = "lunch";
                            // Prepare to check if AM time-out is today and if PM time-in doesn't exist
                            const logDate = timestamp.startOf("day");
                            // If not today, its history
                            if (!logDate.isSame(today, "day")) {
                                // If employee has not punched in at afternoon...
                                // considered it as "EARLY OUT"
                                // if (!pmIn.time) stat = "early-out";
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
        } else {
            // Revalidate punch OUT at morning...
            if (amIn.time) {
                // If not today, its history
                const logDate = toGMT8(amIn.time).startOf("day");
                if (!logDate.isSame(today, "day")) {
                    // If employee has not punched in at afternoon...
                    // considered it as "EARLY OUT"
                    if (!pmIn.time) {
                        amOut = {
                            ...amOut,
                            status: "early-out",
                        };
                    }
                }
            }
        }
        // If not punched IN at afternoon...
        if (!pmIn.time) {
            // {Mark absent if not also punched IN at morning}
            // if (!amIn?.time) {

            // Mark absent if not also punched OUT at morning
            if (!pmOut?.time) {
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

        // Awaiting shift
        if(awaitMornningIn) amIn.status = "awaiting"
        if(awaitMornningOut) amOut.status = "awaiting"
        if(awaitAfternoonIn) pmIn.status = "awaiting"
        if(awaitAfternoonOut) pmOut.status = "awaiting"


        // If suspended
        if (notSuspended === false){
            amIn = {
                id: null,
                status: "suspended",
                time: null,
            };
            amOut = {
                id: null,
                status: "suspended",
                time: null,
            };
            pmIn = {
                id: null,
                status: "suspended",
                time: null,
            };
            pmOut = {
                id: null,
                status: "suspended",
                time: null,
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
                afternoon -= schedule.break_min;
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
        renderedOvertime = pmOut.time ? toGMT8(pmOut.time).diff(scheduleTimeOut, "minutes") : 0;
        // Also record the undertime length for employee's log record
        renderedUndertime = shiftLength < factShiftLength ? factShiftLength - shiftLength : 0;

        if (!!leave) {
            const start = toGMT8(leave.start_date).startOf('day').toDate();
            const end = toGMT8(leave.end_date).startOf('day').toDate();

            let leaveIN = "";
            let leaveOUT = "";
            for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
                const le_in = toGMT8(leave.start_date)
                    .subtract(offset, "hours")
                    .year(currentDay.year())
                    .month(currentDay.month())
                    .date(currentDay.date())
                    .toISOString();
                const le_out = toGMT8(leave.end_date)
                    .year(currentDay.year())
                    .month(currentDay.month())
                    .date(currentDay.date())
                    .toISOString();

                if (current.getTime() === start.getTime() && current.getTime() === end.getTime()) {
                    // if(employee.id === 2) console.log("Equal", start.toISOString(), end.toISOString())
                    leaveIN = le_in;
                    leaveOUT = le_out;
                } else if (current.getTime() === start.getTime()) {
                    // if(employee.id === 2) console.log("Start", current.toISOString(), start.toISOString())
                    leaveIN = le_in;
                    leaveOUT = scheduleTimeOut.toISOString();
                } else if (current.getTime() === end.getTime()) {
                    // if(employee.id === 2) console.log("End")
                    leaveIN = scheduleTimeIn.toISOString();
                    leaveOUT = le_out;
                } else {
                    // if(employee.id === 2) console.log("Scheduled");
                    leaveIN = scheduleTimeIn.toISOString();
                    leaveOUT = scheduleTimeOut.toISOString();
                }

                // if(employee.id === 2){
                //     console.log({ct: current.toISOString(), cd: currentDay.toDate().toISOString()})
                // }
                if (current.getTime() === currentDay.toDate().getTime()) break;
            }

            // console.log({leaveIN, leaveOUT})

            const leaveTimeIn = toGMT8(leaveIN);
            const leaveTimeOut = toGMT8(leaveOUT);
            if (leaveTimeIn.hour() < 12) {
                amIn = {
                    id: leave.id,
                    status: "on leave",
                    time: leaveTimeIn.toISOString(),
                };
            } else {
                pmIn = {
                    id: leave.id,
                    status: "on leave",
                    time: leaveTimeIn.toISOString(),
                };
            }

            if (leaveTimeOut.hour() < 13) {
                amOut = {
                    id: leave.id,
                    status: "on leave",
                    time: leaveTimeOut.toISOString(),
                };
            } else {
                pmOut = {
                    id: leave.id,
                    status: "on leave",
                    time: leaveTimeOut.toISOString(),
                };
            }

            if (amOut.status != "on leave") {
                if (amIn.status === "on leave") {
                    amOut = {
                        id: leave.id,
                        status: "on leave",
                        time: null,
                    };
                }
            }
            if (pmIn.status != "on leave") {
                if (amOut.status === "on leave") {
                    pmIn = {
                        id: leave.id,
                        status: "on leave",
                        time: null,
                    };
                }
            }

            // Get the minutes rendered from overall log entry
            // Ignore entry such as:
            // MORNING: punch OUT but no punch IN
            // AFTERNOON: punch OUT but no punch IN
            const leaveLength = ((): number => {
                // Initializing morning and afternoon duration
                let morning = 0;
                let afternoon = 0;
                // If time-in and time-out for morning is valid
                if (amIn?.time && amOut.time && amIn.status === "on leave" && amOut.status === "on leave") {
                    morning = toGMT8(amOut.time)
                        .subtract(offset, "h")
                        .diff(toGMT8(amIn.time).subtract(offset, "h"), "minute");
                }
                // If time-in and time-out for afternoon is valid
                if (pmIn?.time && pmOut.time && pmIn.status === "on leave" && pmOut.status === "on leave") {
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
                if (
                    amIn?.time &&
                    amIn.status === "on leave" &&
                    !amOut?.time &&
                    !pmIn?.time &&
                    pmOut?.time &&
                    pmOut.status === "on leave"
                ) {
                    afternoon = toGMT8(pmOut.time)
                        .subtract(offset, "h")
                        .diff(toGMT8(amIn.time).subtract(offset, "h"), "minute");
                    afternoon -= schedule.break_min;
                }
                // Return the combined shift length
                return morning + afternoon;
            })();

            // Rendered shift lenght must never exceed actaul shift length
            renderedLeave = Math.min(leaveLength, factShiftLength);
        }
    }

    const leave_rate = leave?.trans_leave_types.ref_leave_type_details.paid_leave ? rate_per_minute : 0;
    renderedUndertime = renderedUndertime - (leave_rate > 0 ? renderedLeave : 0);
    if(awaitMornningIn && awaitMornningOut && awaitAfternoonIn && awaitAfternoonOut){
        renderedUndertime = 0;
    }

    return {
        amIn,
        amOut,
        pmIn,
        pmOut,
        clockIn: schedule.clock_in,
        clockOut: schedule.clock_out,
        dayNames,
        renderedShift,
        renderedUndertime,
        renderedLeave,
        renderedOvertime,
        paidShift: (renderedShift * rate_per_minute) * increase_rate,
        deductedUndertime: renderedUndertime * rate_per_minute,
        paidLeave: (renderedLeave * leave_rate) * increase_rate,
        paidOvertime: (overtime ? overtime.requested_mins * rate_per_minute : 0) * increase_rate,
    };
}

export const getAccurateEmployeeSchedule = ({
    logDate,
    employeeSchedules,
}: {
    logDate: string;
    employeeSchedules: EmployeeSchedule[];
}) => {
    // Parse logDate with Day.js
    const logDay = toGMT8(logDate);

    // Try to find a schedule where logDay is within the range
    const rangedDateSchedule = employeeSchedules?.find((schedule) => {
        if (!schedule.end_date) return false;

        // Parse startDate and endDate
        const startDate = toGMT8(schedule.start_date).startOf('day');
        const endDate = toGMT8(schedule.end_date).subtract(1, 'day').startOf('day');

        // Check if logDay is within the date range
        return logDay.isSameOrAfter(startDate) && logDay.isSameOrBefore(endDate);
    });

    // If no schedule found in range, check for open-ended schedules
    if (!rangedDateSchedule) {
        return (
            employeeSchedules?.find((schedule) => {
                const startDate = toGMT8(schedule.start_date).startOf('day');
                const endDate = schedule.end_date;

                // Check if logDay is after startDate and the schedule has no endDate
                return logDay.isSameOrAfter(startDate) && !endDate;
            }) || null
        );
    }

    return rangedDateSchedule;
};

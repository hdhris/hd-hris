import { toGMT8 } from "@/lib/utils/toGMT8";
import {
    AttendaceStatuses,
    AttendanceData,
    AttendanceLog,
    InStatus,
    OutStatus,
} from "@/types/attendance-time/AttendanceTypes";
import { min } from "lodash";

export async function fetchAttendanceData(url: string): Promise<AttendanceData> {
    // const response = await fetch(`/api/attendance?start=${start}&end=${end}`);
    const response = await fetch(url);
    const params = new URLSearchParams(url.split("?")[1]);
    const startDate = params.get("start");
    const endDate = params.get("end");
    const data = await response.json();
    return await attendanceData({ ...data, startDate, endDate });
}

type Dates = {
    startDate: string;
    endDate: string;
};
async function attendanceData({
    attendanceLogs,
    employees,
    batchSchedule,
    employeeSchedule,
    startDate,
    endDate,
}: Omit<AttendanceData, "statusesByDate"> & Dates): Promise<AttendanceData> {
    // Reuse employee schedule map for references below
    const employeeScheduleMap = new Map(employeeSchedule.map((es) => [es.employee_id!, es]));
    // Reuse batch schedule map for references below
    const batchScheduleMap = new Map(batchSchedule.map((bs) => [bs.id, bs]));

    /////////////////////////////////////////////////////////////////////
    // Organize and sort attendance logs into a record by date and employee
    const organizedLogsByDate = attendanceLogs.reduce((acc, log) => {
        const logDate = toGMT8(log.timestamp).format("YYYY-MM-DD");
        const empId = log.employee_id;
        if (!acc[logDate]) acc[logDate] = {};
        if (!acc[logDate][empId]) acc[logDate][empId] = [];
        acc[logDate][empId].push(log);
        acc[logDate][empId].sort((a, b) => toGMT8(a.timestamp).diff(toGMT8(b.timestamp)));
        return acc;
    }, {} as Record<string, Record<number, AttendanceLog[]>>);

    // Generate a list of dates in the range
    const dateRange: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let current = start; current <= end; current.setDate(current.getDate() + 1)) {
        dateRange.push(toGMT8(current).format("YYYY-MM-DD"));
    }
    console.log("Date range: ", dateRange);

    ///////////////////////////////////////////////////////////////////////////////////
    // Arrange and label the time log for each entry and return the overall information
    // STRUCTURE:
    // AttendaceStatuses = {
    //  employeeID:{
    //               amIn?: {id: number; time: string | null; status: InStatus;};
    //               amOut?: {id: number; time: string | null; status: OutStatus;};
    //               pmIn?: {id: number; time: string | null; status: InStatus;};
    //               pmOut?: {id: number; time: string | null; status: OutStatus;};
    //               shift?: number;
    //               overtime?: number;
    //             }
    // };

    ///////////////////////////////////////////////////////////////////////////////////
    // Process attendance logs for each date and employee
    const statusesByDate: Record<string, AttendaceStatuses> = {};
    const offset = 0; // Time offset for GMT+8
    const gracePeriod = 5; // 5 min grace period

    console.time("Processing Attendance Logs");
    await Promise.all(
        // Object.entries(organizedLogsByDate).map(async ([date, logsByEmployee]) => {
        dateRange.map(async (date) => {
            // Initialize statuses for each date(s)
            statusesByDate[date] = {};
            const logsByEmployee = organizedLogsByDate[date];
            await Promise.all(
                employees.map(async (emp) => {
                    const employeeId = Number(emp.id);
                    const daySchedule = employeeScheduleMap.get(employeeId);
                    const timeSchedule = batchScheduleMap.get(daySchedule?.batch_id || 0);

                    // Initialize a record for the employee incase if it is null
                    if (!statusesByDate[date][employeeId]) {
                        statusesByDate[date][employeeId] = {};
                    }

                    // Get days of shifts
                    const daysArray = employeeScheduleMap.get(Number(emp.id))?.days_json;

                    // Skip if current employee has invalid schedule
                    if (!daySchedule || !timeSchedule) return;

                    const timeIn = toGMT8(timeSchedule.clock_in!).subtract(offset, "hours");
                    // console.log("Fetched: ", timeSchedule.clock_in, "Offsetted: ", timeIn.toISOString());
                    const timeOut = toGMT8(timeSchedule.clock_out!).subtract(offset, "hours");

                    // If current day does not exists in employee's schedule
                    // Consider the employee's holiday
                    const dayName = toGMT8(date).format("ddd").toLowerCase();
                    if (!daysArray?.includes(dayName)) {
                        statusesByDate[date][employeeId] = {
                            amIn: {
                                id: null,
                                status: "no work",
                                time: null,
                            },
                            amOut: {
                                id: null,
                                status: "no work",
                                time: null,
                            },
                            pmIn: {
                                id: null,
                                status: "no work",
                                time: null,
                            },
                            pmOut: {
                                id: null,
                                status: "no work",
                                time: null,
                            },
                            overtime: 0,
                            shift: 0,
                            undertime: 0,
                        };
                        return;
                    }

                    if (logsByEmployee) {
                        const logs = logsByEmployee[emp.id];
                        if (logs) {
                            // For each entry log of the employee
                            logs.forEach((log) => {
                                // Convert the timestamp of the log to dayjs(toGMT8)
                                const timestamp = toGMT8(log.timestamp).subtract(offset, "hours");

                                // For punched IN logs or "Morning/Afternoon entry"
                                if (log.punch === 0) {
                                    // If time-in is 4hrs closer to clock-in schedule...
                                    // Consider it as an AM time in
                                    if (timestamp.hour() - timeIn.hour() < 4) {
                                        // "LATE" if time-in is 5mins later than clock-in schedule...
                                        const stat: InStatus =
                                            timestamp.minute() - timeIn.minute() > gracePeriod ? "late" : "ontime";
                                        statusesByDate[date][employeeId].amIn = {
                                            id: log.id, // Record the log ID for later reference
                                            time: timestamp.format("HH:mm:ss"),
                                            status: stat, // Record the status label for later reference
                                        };
                                        // If time-in is 4hrs further from clock-in schedule...
                                        // Consider it as a PM time in
                                    } else {
                                        // Initialize as no break if the employee has not punched out at morning yet
                                        let stat: InStatus = "no break";
                                        // If the employee has punched out at morning...
                                        if (statusesByDate[date][employeeId].amOut) {
                                            // Check if PM time-in has passed the break-mins schedule after AM time-out....
                                            stat =
                                                timestamp.diff(
                                                    toGMT8(statusesByDate[date][employeeId].amOut.time!).subtract(
                                                        offset,
                                                        "hours"
                                                    ),
                                                    "minute"
                                                ) > timeSchedule.break_min!
                                                    ? "late"
                                                    : "ontime"; // Otherwise, its closer to break-mins duration schedule
                                        }
                                        statusesByDate[date][employeeId].pmIn = {
                                            id: log.id,
                                            time: timestamp.format("HH:mm:ss"),
                                            status: stat,
                                        };
                                    }

                                    // For punched OUT logs or "Morning/Afternoon exit"
                                } else {
                                    // If time-out is 4hrs earlier than clock-out schedule...
                                    // Consider it as an AM time out
                                    if (timeOut.hour() - timestamp.hour() > 4) {
                                        // Initialize as "LUNCH" if the employee has not punched in at afternoon yet
                                        let stat: OutStatus = "lunch";
                                        // Prepare to check if AM time-out is today and if PM time-in doesn't exist
                                        const today = toGMT8().subtract(offset, "hours").startOf("day");
                                        const logDate = timestamp.startOf("day");
                                        // If not today, its history
                                        if (!logDate.isSame(today, "day")) {
                                            // If employee has not punched in at afternoon...
                                            // considered it as "EARLY OUT"
                                            if (!statusesByDate[date][employeeId].pmIn) stat = "early-out";
                                        }
                                        statusesByDate[date][employeeId].amOut = {
                                            id: log.id,
                                            time: timestamp.format("HH:mm:ss"),
                                            status: stat,
                                        };

                                        // If time-out is 4hrs closer to clock-out schedule...
                                        // Consider it as a PM time out
                                    } else {
                                        // Overtime if time-out is 5mins later than clock-out schedule
                                        // Temporary variable to match dates between clock-out and time-out date
                                        const tempTimeOut = timeOut
                                            .year(timestamp.year())
                                            .month(timestamp.month())
                                            .date(timestamp.date());
                                        const stat: OutStatus =
                                            timestamp.minute() - tempTimeOut.minute() > gracePeriod
                                                ? "overtime"
                                                : timestamp.minute() - tempTimeOut.minute() < -gracePeriod
                                                ? "early-out" // Early if time-out is 5mins earlier than clock-out schedule
                                                : "ontime"; // Otherwise, its closer to clock out schedule
                                        statusesByDate[date][employeeId].pmOut = {
                                            id: log.id,
                                            time: timestamp.format("HH:mm:ss"),
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
                    if (statusesByDate[date][employeeId].amIn === null) {
                        statusesByDate[date][employeeId].amIn = {
                            id: null,
                            time: null,
                            status: "absent",
                        };
                    }
                    // If not punched OUT at morning...
                    if (!statusesByDate[date][employeeId].amOut) {
                        // Mark absent if not also punched OUT at afternoon
                        if (statusesByDate[date][employeeId].pmOut?.time === null) {
                            statusesByDate[date][employeeId].amOut = {
                                id: null,
                                time: null,
                                status: "absent",
                            };

                            // Mark no break if employee had eventually punched OUT at afternoon
                        } else {
                            statusesByDate[date][employeeId].amOut = {
                                id: null,
                                time: null,
                                status: "no break",
                            };
                        }
                    }
                    // If not punched IN at afternoon...
                    if (!statusesByDate[date][employeeId].pmIn) {
                        // Mark absent if not also punched IN at morning
                        if (!statusesByDate[date][employeeId].amIn?.time) {
                            statusesByDate[date][employeeId].pmIn = {
                                id: null,
                                time: null,
                                status: "absent",
                            };

                            // Mark no break if employee had actually punched IN at morning
                        } else {
                            statusesByDate[date][employeeId].pmIn = {
                                id: null,
                                time: null,
                                status: "no break",
                            };
                        }
                    }
                    // If not punched OUT at afternoon, mark as absent
                    if (!statusesByDate[date][employeeId].pmOut) {
                        statusesByDate[date][employeeId].pmOut = {
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
                        if (
                            statusesByDate[date][employeeId].amIn?.time &&
                            statusesByDate[date][employeeId].amOut.time
                        ) {
                            morning = toGMT8(statusesByDate[date][employeeId].amOut.time)
                                .subtract(offset, "h")
                                .diff(
                                    toGMT8(statusesByDate[date][employeeId].amIn.time).subtract(offset, "h"),
                                    "minute"
                                );
                        }
                        // If time-in and time-out for afternoon is valid
                        if (
                            statusesByDate[date][employeeId].pmIn?.time &&
                            statusesByDate[date][employeeId].pmOut.time
                        ) {
                            afternoon = toGMT8(statusesByDate[date][employeeId].pmOut.time)
                                .subtract(offset, "h")
                                .diff(
                                    toGMT8(statusesByDate[date][employeeId].pmIn.time).subtract(offset, "h"),
                                    "minute"
                                );
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
                            statusesByDate[date][employeeId].amIn?.time &&
                            !statusesByDate[date][employeeId].amOut?.time &&
                            !statusesByDate[date][employeeId].pmIn?.time &&
                            statusesByDate[date][employeeId].pmOut?.time
                        ) {
                            afternoon = toGMT8(statusesByDate[date][employeeId].pmOut.time)
                                .subtract(offset, "h")
                                .diff(
                                    toGMT8(statusesByDate[date][employeeId].amIn.time).subtract(offset, "h"),
                                    "minute"
                                );
                        }
                        // Return the combined shift length
                        return morning + afternoon;
                    })();

                    // Get the actual shift length of an employee
                    const factShiftLength =
                        toGMT8(timeSchedule?.clock_out!)
                            .subtract(offset, "h")
                            .diff(toGMT8(timeSchedule?.clock_in!).subtract(offset, "h"), "minute") -
                        timeSchedule?.break_min!;

                    // Rendered shift lenght must never exceed actaul shift length
                    statusesByDate[date][employeeId].shift = min([shiftLength, factShiftLength]);

                    // Instead, record the overtime length for employee's log record
                    statusesByDate[date][employeeId].overtime =
                        shiftLength > factShiftLength ? shiftLength - factShiftLength : 0;
                    // Also record the undertime length for employee's log record
                    statusesByDate[date][employeeId].undertime =
                        shiftLength < factShiftLength ? factShiftLength - shiftLength : 0;

                    // Calculate shift length, overtime, and undertime
                })
            );
        })
    );
    console.timeEnd("Processing Attendance Logs");
    return {
        attendanceLogs,
        employees,
        statusesByDate,
        batchSchedule,
        employeeSchedule,
    };
}

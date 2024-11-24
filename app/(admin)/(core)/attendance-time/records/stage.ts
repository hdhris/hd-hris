import { toGMT8 } from "@/lib/utils/toGMT8";
import { axiosInstance } from "@/services/fetcher";
import { AttendaceStatuses, AttendanceData, AttendanceLog, InStatus, OutStatus } from "@/types/attendance-time/AttendanceTypes";
import { min } from "lodash";

export async function fetchAttendanceData(url: string): Promise<AttendanceData> {
    // const response = await fetch(`/api/attendance?start=${start}&end=${end}`);
    const response = await axiosInstance.get(url).then((res) => res.data);
    return await attendanceData({...response})
}

async function attendanceData({
    attendanceLogs,
    employees,
    batchSchedule,
    employeeSchedule,
}: Omit<AttendanceData, "statusesByDate">): Promise<AttendanceData> {
    // Reuse employee schedule map for references below
    const employeeScheduleMap = new Map(employeeSchedule.map((es) => [es.employee_id!, es]));
    // Reuse batch schedule map for references below
    const batchScheduleMap = new Map(batchSchedule.map((bs) => [bs.id, bs]));

    /////////////////////////////////////////////////////////////////////
    // Organize and sort attendance logs into a record by date and employee
    const organizedLogsByDate = attendanceLogs.reduce(
        (acc, log) => {
          const logDate = toGMT8(log.timestamp).format("YYYY-MM-DD");
          const empId = log.employee_id;
          if (!acc[logDate]) acc[logDate] = {};
          if (!acc[logDate][empId]) acc[logDate][empId] = [];
          acc[logDate][empId].push(log);
          acc[logDate][empId].sort((a, b) =>
            toGMT8(a.timestamp).diff(toGMT8(b.timestamp))
          );
          return acc;
        },
        {} as Record<string, Record<number, AttendanceLog[]>>
      );

      
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
    const offset = 8; // Time offset for GMT+8
    const gracePeriod = 5; // 5 min grace period

    Object.entries(organizedLogsByDate).forEach(([date, logsByEmployee]) => {
        // Initialize statuses for the date
        statusesByDate[date] = {};

        Object.entries(logsByEmployee).forEach(([empId, logs]) => {
            const employeeId = Number(empId);
            const daySchedule = employeeScheduleMap.get(employeeId);
            const timeSchedule = batchScheduleMap.get(daySchedule?.batch_id || 0);

            // Skip if current employee has invalid schedule
            if (!daySchedule || !timeSchedule) return;

            const timeIn = toGMT8(timeSchedule.clock_in!).subtract(offset, "hours");
            const timeOut = toGMT8(timeSchedule.clock_out!).subtract(offset, "hours");

            // Initialize a record for the employee incase if it is null
            if (!statusesByDate[date][employeeId]) {
                statusesByDate[date][employeeId] = {};
            }

            // For each entry log of the employee
            logs.forEach((log) => {
                // Convert the timestamp of the log to dayjs(toGMT8)
                const timestamp = toGMT8(log.timestamp).subtract(offset, "hours");
                // For punched IN logs or Morning entry
                if (log.punch === 0) {
                    // If time-in is 4hrs closer to clock-in schedule...
                    // Consider it as an AM time in
                    if (timestamp.hour() - timeIn.hour() < 4) {
                        // Late if time-in is 5mins later than clock-in schedule...
                        const stat: InStatus = timestamp.diff(timeIn, "minute") > gracePeriod ? "late" : "ontime";
                        statusesByDate[date][employeeId].amIn = {
                            id: log.id, // Record the log ID for later reference
                            time: timestamp.format("HH:mm:ss"),
                            status: stat, // Record the status label for later reference
                        };
                        // If time-in is 4hrs over the clock-in schedule...
                        // Consider it as a PM time in
                    } else {
                        // Initialize as no break if the employee has not punched out at morning yet
                        let stat: InStatus = "no break";
                        // If the employee has punched out at morning...
                        if (statusesByDate[date][employeeId].amOut) {
                            // Check if PM time-in has passed the break-mins schedule after AM time-out....
                            stat =
                                timestamp.diff(
                                    toGMT8(statusesByDate[date][employeeId].amOut.time!).subtract(offset, "hours"),
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
                    // For punched OUT logs or Afternoon entry
                } else {
                    // If time-out is 4hrs earlier than clock-out schedule...
                    // Consider it as an AM time out
                    if (timeOut.hour() - timestamp.hour() > 4) {
                        // Initialize as lunch if the employee has not punched in at afternoon yet
                        let stat: OutStatus = "lunch";
                        // Prepare to check if AM time-out is today and if PM time-in doesn't exist
                        const today = toGMT8().subtract(offset, "hours").startOf("day");
                        const logDate = timestamp.startOf("day");
                        // If not today, its history
                        if (!logDate.isSame(today, "day")) {
                            // if individual has not punched in at afternoon...
                            // considered it as early out
                            if (!statusesByDate[date][employeeId].pmIn) stat = "early-out";
                        }
                        statusesByDate[date][employeeId].amOut = {
                            id: log.id,
                            time: timestamp.format("HH:mm:ss"),
                            status: stat,
                        };
                        // If time-out is 4hrs closer the clock-out schedule...
                        // Consider it as a PM time out
                    } else {
                        // Overtime if time-out is 5mins later than clock-out schedule
                        // Temporary variable to match dates between clock-out and time-out date
                        const tempTimeOut = timeOut
                            .year(timestamp.year())
                            .month(timestamp.month())
                            .date(timestamp.date());
                        const stat: OutStatus =
                            timestamp.diff(tempTimeOut, "minute") > gracePeriod
                                ? "overtime"
                                : timestamp.diff(tempTimeOut, "minute") < -gracePeriod
                                ? "early-out" // Early if time-out is 5mins earlier than clock-out schedule
                                : "ontime"; // Otherwise, its closer to clock out schedule
                        statusesByDate[date][employeeId].pmOut = {
                            id: log.id,
                            time: timestamp.format("HH:mm:ss"),
                            status: stat,
                        };
                    }
                }

                // If not punched IN at morning, mark as absent
                if (statusesByDate[date][employeeId].amIn === null) {
                    statusesByDate[date][employeeId].amIn = {
                        id: log.id,
                        time: null,
                        status: "absent",
                    };
                }
                // If not punched OUT at morning...
                if (!statusesByDate[date][employeeId].amOut) {
                    // Mark absent if not also punched OUT at afternoon
                    if (statusesByDate[date][employeeId].pmOut === null) {
                        statusesByDate[date][employeeId].amOut = {
                            id: log.id,
                            time: null,
                            status: "absent",
                        };
                        // Mark no break if individual has eventually punched OUT at afternoon
                    } else {
                        statusesByDate[date][employeeId].amOut = {
                            id: log.id,
                            time: null,
                            status: "no break",
                        };
                    }
                }
                // If not punched IN at afternoon...
                if (!statusesByDate[date][employeeId].pmIn) {
                    // Mark absent if not also punched IN at morning
                    if (!statusesByDate[date][employeeId].amIn) {
                        statusesByDate[date][employeeId].pmIn = {
                            id: log.id,
                            time: null,
                            status: "absent",
                        };
                        // Mark no break if individual has actually punched IN at morning
                    } else {
                        statusesByDate[date][employeeId].pmIn = {
                            id: log.id,
                            time: null,
                            status: "no break",
                        };
                    }
                }
                // If not punched OUT at afternoon, mark as absent
                if (!statusesByDate[date][employeeId].pmOut) {
                    statusesByDate[date][employeeId].pmOut = {
                        id: log.id,
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
                    if (statusesByDate[date][employeeId].amIn?.time && statusesByDate[date][employeeId].amOut.time) {
                        morning = toGMT8(statusesByDate[date][employeeId].amOut.time)
                            .subtract(offset, "h")
                            .diff(toGMT8(statusesByDate[date][employeeId].amIn.time).subtract(offset, "h"), "minute");
                    }
                    // If time-in and time-out for afternoon is valid
                    if (statusesByDate[date][employeeId].pmIn?.time && statusesByDate[date][employeeId].pmOut.time) {
                        afternoon = toGMT8(statusesByDate[date][employeeId].pmOut.time)
                            .subtract(offset, "h")
                            .diff(toGMT8(statusesByDate[date][employeeId].pmIn.time).subtract(offset, "h"), "minute");
                    }

                    // For special cases for individuals who took no breaks
                    // such as when individual has punched IN at morning
                    // and never punched OUT at morning & never punched IN at afternoon
                    // and has punched OUT at afternoong
                    //    amIN:  time-in
                    //    amOUT: x
                    //    pmIN:  x
                    //    pmOUT: time-out
                    // Consider as valid
                    if (
                        statusesByDate[date][employeeId].amIn?.time &&
                        !statusesByDate[date][employeeId].amOut?.time &&
                        !statusesByDate[date][employeeId].pmIn?.time &&
                        statusesByDate[date][employeeId].pmOut?.time
                    ) {
                        afternoon = toGMT8(statusesByDate[date][employeeId].pmOut.time)
                            .subtract(offset, "h")
                            .diff(toGMT8(statusesByDate[date][employeeId].amIn.time).subtract(offset, "h"), "minute");
                    }
                    // Return the combined shift length
                    return morning + afternoon;
                })();

                // Get the actual shift length of an individual
                const factShiftLength =
                    toGMT8(timeSchedule.clock_out!)
                        .subtract(offset, "h")
                        .diff(toGMT8(timeSchedule.clock_in!).subtract(offset, "h"), "minute") - timeSchedule.break_min!;

                // Rendered shift lenght must never exceed actaul shift length
                statusesByDate[date][employeeId].shift = min([shiftLength, factShiftLength]);

                // Instead, record the overtime length for individual's log record
                statusesByDate[date][employeeId].overtime =
                    shiftLength > factShiftLength ? shiftLength - factShiftLength : 0;
                // Also record the undertime length for individual's log record
                statusesByDate[date][employeeId].undertime =
                    shiftLength < factShiftLength ? factShiftLength - shiftLength : 0;
            });

            // Calculate shift length, overtime, and undertime
            // ... (Keep original comments and logic here)
        });
    });

    return {
        attendanceLogs,
        employees,
        statusesByDate,
        batchSchedule,
        employeeSchedule,
    };
}

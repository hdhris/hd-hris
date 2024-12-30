import { toGMT8 } from "@/lib/utils/toGMT8";
import {
    AttendaceStatuses,
    AttendanceData,
    AttendanceLog,
    EmployeeSchedule,
    InStatus,
    OutStatus,
} from "@/types/attendance-time/AttendanceTypes";
import { min } from "lodash";
import { getAttendanceStatus } from "./new-stage";

export async function fetchAttendanceData(url: string): Promise<AttendanceData> {
    // const response = await fetch(`/api/attendance?start=${start}&end=${end}`);
    const response = await fetch(url);
    const params = new URLSearchParams(url.split("?")[1]);
    const startDate = params.get("start");
    const endDate = params.get("end");
    const data = await response.json();
    const result = await attendanceData({ ...data, startDate, endDate });
    console.log({result})
    return result;
}

type Dates = {
    startDate: string;
    endDate: string;
};
async function attendanceData({
    attendanceLogs,
    employees,
    employeeSchedule,
    startDate,
    endDate,
}: Omit<AttendanceData, "statusesByDate"> & Dates): Promise<AttendanceData> {
    // Reuse employee schedule map for references below
    const employeeScheduleMap = employeeSchedule.reduce((acc, schedule) => {
        const { employee_id } = schedule;
        // If the employee_id does not exist in the accumulator, initialize it with an empty array
        if (!acc[employee_id]) {
            acc[employee_id] = [];
        }
        // Add the schedule to the array of the respective employee_id
        acc[employee_id].push(schedule);
        return acc;
    }, {} as Record<number, EmployeeSchedule[]>);

    // Reuse batch schedule map for references below
    // const batchScheduleMap = new Map(batchSchedule.map((bs) => [bs.id, bs]));

    /////////////////////////////////////////////////////////////////////
    // Organize and sort attendance logs into a record by date and employee
    const organizedLogsByDate = [...attendanceLogs].reduce((acc, log) => {
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
                    try{
                        statusesByDate[date][emp.id] = await getAttendanceStatus({
                            date,
                            rate_per_minute: 0,
                            logs: logsByEmployee[emp.id],
                            schedules: employeeScheduleMap[emp.id],
                        });
                    } catch(error) {
                        console.log(error);
                    }
                })
            );
        })
    );
    console.timeEnd("Processing Attendance Logs");
    return {
        attendanceLogs,
        employees,
        statusesByDate,
        // batchSchedule,
        employeeSchedule,
    };
}
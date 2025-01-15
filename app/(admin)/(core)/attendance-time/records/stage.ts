import { toGMT8 } from "@/lib/utils/toGMT8";
import {
    AttendaceStatuses,
    AttendanceData,
    AttendanceLog,
    EmployeeSchedule,
} from "@/types/attendance-time/AttendanceTypes";
import { getAttendanceStatus } from "./new-stage";
import { OvertimeEntry } from "@/types/attendance-time/OvertimeType";
import { LeaveApplication} from "@/types/leaves/LeaveRequestTypes";
import { HolidayData } from "@/types/attendance-time/HolidayTypes";

export async function fetchAttendanceData(url: string): Promise<AttendanceData> {
    // const response = await fetch(`/api/attendance?start=${start}&end=${end}`);
    const params = new URLSearchParams(url.split("?")[1]);
    const startDate = params.get("start");
    const endDate = params.get("end");
    const [response, holidaysData] = await Promise.all([fetch(url), fetch(`/api/admin/attendance-time/holidays/adjacents/${toGMT8(startDate ?? undefined).year()}`)]);
    const [data, holidays] = await Promise.all([response.json(), holidaysData.json()]);
    const result = await attendanceData({ ...data, holidays, startDate, endDate });
    return result;
}

type Dates = {
    startDate: string;
    endDate: string;
};
type LeaveEntry = LeaveApplication & { trans_leave_types: { ref_leave_type_details: { paid_leave: boolean } } };
async function attendanceData({
    attendanceLogs,
    employees,
    employeeSchedule,
    overtimes,
    leaves,
    startDate,
    endDate,
    holidays,
}: Omit<AttendanceData, "statusesByDate"> &
    Dates & {
        overtimes: OvertimeEntry[];
        leaves: LeaveEntry[];
        holidays: HolidayData;
    }): Promise<AttendanceData> {
    // Organize holidays
        
    // console.log({holidays})
      const holiday_detail = (date: string) => {
        const current = toGMT8(date).startOf('day');
        const holiday = holidays.transHolidays.find(item => toGMT8(item.date).startOf('day').isSame(current))
        return {
            no_work: holiday?.no_work ?? false,
            increase_rate: holiday?.pay_rate_percentage ? Number(holiday?.pay_rate_percentage)/100 : 1,
        }
      }

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

    const overtimeDateMap = overtimes.reduce((acc, overtime) => {
        const { timestamp, employee_id } = overtime;
        const splitTimestamp = toGMT8(timestamp).format("YYYY-MM-DD");
        if (!acc[splitTimestamp]) {
            acc[splitTimestamp] = {};
        }
        acc[splitTimestamp][employee_id] = overtime;
        return acc;
    }, {} as Record<string, Record<number, OvertimeEntry>>);

    const leaveDateMap = leaves.reduce((acc, leave) => {
        const { start_date, end_date, employee_id } = leave;
        const start = new Date(start_date);
        const end = new Date(end_date);
        for (let current = start; current <= end; current.setDate(current.getDate() + 1)) {
            const splitTimestamp = toGMT8(current).format("YYYY-MM-DD");
            if (!acc[splitTimestamp]) {
                acc[splitTimestamp] = {};
            }
            acc[splitTimestamp][employee_id] = leave;
        }

        return acc;
    }, {} as Record<string, Record<number, LeaveEntry>>);

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
            const overtimesByEmploye = overtimeDateMap[date];
            const leavetimesByEmployee = leaveDateMap[date];
            await Promise.all(
                employees.map(async (emp) => {
                    try {
                        // const thisDate = toGMT8(date).startOf('day');
                        // const holiday = toGMT8('2025-01-08').startOf('day');
                        // const employeeLogs = logsByEmployee[emp.id] ?? [];
                        // const overtime = overtimes[emp.id] ?? undefined;
                        statusesByDate[date][emp.id] = await getAttendanceStatus({
                            employee: emp,
                            date,
                            rate_per_minute: 0.75,
                            no_work: holiday_detail(date).no_work,
                            increase_rate: holiday_detail(date).increase_rate, //thisDate.isSame(holiday) ? 1.20 : 1,
                            schedules: employeeScheduleMap[emp.id],
                            logs: logsByEmployee ? logsByEmployee[emp.id] ?? [] : [],
                            overtime: overtimesByEmploye ? overtimesByEmploye[emp.id] ?? undefined : undefined,
                            leave: leavetimesByEmployee ? leavetimesByEmployee[emp.id] ?? undefined : undefined
                        });
                    } catch (error) {
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

import { MinorEmployee, MajorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { ReactNode } from "react";

export interface BatchSchedule {
    shift_hours: ReactNode;
    id: number;
    name: string;
    clock_in: string;
    clock_out: string;
    break_min: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface Schedules {
    batch: BatchSchedule[];
    employees: MajorEmployee[];
}

export interface AttendanceLog {
    id: number;
    unique_id: string;
    employee_id: number;
    timestamp: string; // ISO format string
    status: number;
    punch: number;
    created_at: string; // ISO format string
    // trans_employees: MajorEmployee;
}

export interface EmployeeSchedule {
    id: number;
    employee_id: number;
    days_json: string[]; // Array of day abbreviations
    batch_id: number;
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
    deleted_at: string | null; // ISO timestamp or null
    start_date: string; // ISO timestamp
    end_date: string | null; // ISO timestamp or null
    clock_in: string; // ISO timestamp or null
    clock_out: string; // ISO timestamp or null
    break_min: number;
    ref_batch_schedules: BatchSchedule;
    trans_employees: MinorEmployee;
}

export interface AttendanceData {
    attendanceLogs: AttendanceLog[]; // Renamed to plural to better reflect multiple logs
    employees: MajorEmployee[]; // List of employees involved in the logs
    statusesByDate: Record<string, AttendaceStatuses>; // Attendance statuses organized by date
    // batchSchedule: BatchSchedule[]; // Array of batch schedules for the employees
    employeeSchedule: EmployeeSchedule[]; // Array of individual schedules for employees
}

export function determineAttendance({
    amIn,
    pmIn,
    amOut,
    pmOut,
}: {
    amIn?: punchIN;
    amOut?: punchOUT;
    pmIn?: punchIN;
    pmOut?: punchOUT;
}): "Whole Day" | "Morning only" | "Afternoon only" | "Absent" | "On Leave" | "No Work" | "Unscheduled" {
    const validInStatuses: InStatus[] = ["ontime", "late", "no break"];
    const validOutStatuses: OutStatus[] = ["ontime", "overtime", "early-out", "lunch", "no break"];

    // Collect punch-ins and punch-outs, filter undefined values
    const morningPunches = [amIn, amOut].filter((punch): punch is punchIN => punch !== undefined);
    const afternoonPunches = [pmIn, pmOut].filter((punch): punch is punchOUT => punch !== undefined);

    if(morningPunches.some(item => item.status === "no work") && afternoonPunches.some(item => item.status === "no work")){
        return "No Work";
    } else if (afternoonPunches.some(item => item.status === "no work")){
        return "Morning only";
    } else if (morningPunches.some(item => item.status === "no work")){
        return "Afternoon only";
    }

    if(morningPunches.some(item => item.status === "unscheduled") || afternoonPunches.some(item => item.status === "unscheduled")){
        return "Unscheduled"
    }

    if(morningPunches.some(item => item.status === "on leave") || afternoonPunches.some(item => item.status === "on leave")){
        return "On Leave"
    }

    
    // Check if any punch-in or punch-out has a valid status
    const fullMorning = validInStatuses.some((status) => amIn?.status === status) && validOutStatuses.some((status) => amOut?.status === status);
    const fullAfternoon = validInStatuses.some((status) => pmIn?.status === status) && validOutStatuses.some((status) => pmOut?.status === status);

    // Determine attendance
    if (fullMorning && fullAfternoon) {
        return "Whole Day";
    } else if (fullMorning) {
        return "Morning only";
    } else if (fullAfternoon) {
        return "Afternoon only";
    } else {
        return "Absent";
    }
}


export type InStatus = "unscheduled" | "absent" | "late" | "ontime" | "no break" | "no work" | "on leave";
export type OutStatus =
    | "unscheduled"
    | "absent"
    | "early-out"
    | "overtime"
    | "ontime"
    | "lunch"
    | "no break"
    | "no work"
    | "on leave";

export type punchIN = {
    id: number | null;
    time: string | null;
    status: InStatus;
};
export type punchOUT = {
    id: number | null;
    time: string | null;
    status: OutStatus;
};

// export type LogStatus = {
//   amIn?: punchIN;
//   amOut?: punchOUT;
//   pmIn?: punchIN;
//   pmOut?: punchOUT;
//   shift?: number;
//   overtime?: number;
//   undertime?: number;
// };

export type LogStatus = {
    amIn?: punchIN;
    amOut?: punchOUT;
    pmIn?: punchIN;
    pmOut?: punchOUT;
    clockIn?: string;
    clockOut?: string;
    renderedShift: number;
    paidShift: number;
    renderedOvertime: number;
    paidOvertime: number;
    renderedUndertime: number;
    deductedUndertime: number;
    renderedLeave: number;
    paidLeave: number;
};

export type AttendaceStatuses = { [employeeID: string]: LogStatus };

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

export type InStatus = "absent" | "late" | "ontime" | "no break" | "no work" | "on leave";
export type OutStatus =
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

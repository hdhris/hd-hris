import { UserEmployee } from "@/helper/include-emp-and-reviewr/include";
import { ReactNode } from "react";

export interface EmployeeSchedule {
  id: number;
  employee_id: number;
  days_json: string[];
  batch_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  trans_employees: {
    last_name: string;
    first_name: string;
    middle_name: string;
  };
}

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
  emp_sched: EmployeeSchedule[];
}

export interface AttendanceLog {
  id: number;
  employee_id: number;
  timestamp: string; // ISO format string
  status: number;
  punch: number;
  created_at: string; // ISO format string
  // trans_employees: UserEmployee;
}

export interface EmployeeSchedule {
  id: number;
  employee_id: number;
  days_json: string[];
  batch_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  trans_employees: {
    last_name: string;
    first_name: string;
    middle_name: string;
  };
}

export interface AttendanceData {
  attendanceLog: AttendanceLog[];
  employees: UserEmployee[];
  statuses: AttendaceStatuses;
}

export type InStatus = "absent" | "late" | "ontime" | "no break";
export type OutStatus =
  | "absent"
  | "early-out"
  | "overtime"
  | "ontime"
  | "lunch"
  | "no break";

export type punchIN = {
  id: number;
  time: string | null;
  status: InStatus;
};
export type punchOUT = {
  id: number;
  time: string | null;
  status: OutStatus;
};

export type LogStatus = {
  amIn?: punchIN;
  amOut?: punchOUT;
  pmIn?: punchIN;
  pmOut?: punchOUT;
  shift?: number;
  overtime?: number;
  undertime?: number;
};

export type AttendaceStatuses = { [key: string]: LogStatus };

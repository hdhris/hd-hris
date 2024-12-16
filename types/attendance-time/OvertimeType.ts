
// interface Employee {
//   id: number;
//   picture: string;
//   last_name: string;
//   first_name: string;
//   middle_name: string;
//   email: string;
//   ref_departments: {
//     id: number;
//     name: string;
//   };
//   ref_job_classes: {
//     id: number;
//     name: string;
//     pay_rate: number;
//   };
// }

import { UserEmployee, UserReviewer } from "@/helper/include-emp-and-reviewr/include";
import { Evaluations } from "../leaves/leave-evaluators-types";

export type ApprovalStatusType = "pending" | "approved" | "rejected"; 
export const approvalStatusColorMap: Record<string, "danger" | "success" | "warning"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export interface OvertimeEntry {
  employee_id: number;
  status: ApprovalStatusType;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  id: number;
  date: string; // ISO date string
  clock_in: string; // ISO date string
  clock_out: string; // ISO date string
  requested_mins: number;
  reason: string;
  deleted_at: string | null; // Nullable for deleted entries
  trans_employees_overtimes: UserEmployee; // Employee details
  trans_employees_overtimes_approvedBy: UserReviewer; // Approver details
  full_name: string;
  approvedBy_full_name: string;
  evaluators: Evaluations;
};

export interface OvertimeResponse {
  overtime: OvertimeEntry;
  employees: UserEmployee[];
}
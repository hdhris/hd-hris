
import { MajorEmployee, MinorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { Evaluations } from "../leaves/leave-evaluators-types";

export type ApprovalStatusType = "pending" | "approved" | "rejected"; 
export const approvalStatusColorMap: Record<string, "danger" | "success" | "warning"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export interface OvertimeEntry {
  id: number;
  employee_id: number;
  created_by: number;
  status: ApprovalStatusType;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  requested_mins: number;
  reason: string;
  deleted_at: string | null; // Nullable for deleted entries
  trans_employees_overtimes: MajorEmployee; // Employee details
  trans_employees_overtimes_createdBy: MinorEmployee; // Approver details
  evaluators: Evaluations;
  log_id: number;
  files: string[] | null,
  timestamp: string;
};

export interface OvertimeResponse {
  overtime: OvertimeEntry;
  employees: MajorEmployee[];
}
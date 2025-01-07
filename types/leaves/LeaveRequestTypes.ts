import React from "react";
import {Evaluations} from "@/types/leaves/leave-evaluators-types";
import {MetadataProps} from "@/helper/file/getFileMetadata";

interface DimSchedule {
    days_json: string[];
    ref_batch_schedules: RefBatchSchedule;
}

interface RefBatchSchedule {
    clock_in: string; // ISO date string
    clock_out: string; // ISO date string
    break_min: number;
}


type ApprovedBy = {
    name: string; picture: string;
}

export type LeaveRequestTypes = {
    id: number;
    name: string;
    email: string;
    picture: string;
    leave_type: string;
    start_date: string | Date;
    end_date: string | Date;
    total_days: number;
    status: "Pending" | "Approved" | "Rejected";
    approvedBy: ApprovedBy;
}

export interface RequestFormTableType extends Omit<LeaveRequestTypes, "status" | "approvedBy" | "email"> {
    department: string;
    created_by: ApprovedBy;
    comment: string;
    reason: string;
    leave_id: number;
}


export interface EmployeeLeavesStatus {
    employees: EmployeeLeave[]
    availableLeaves: LeaveType[]
}

export interface LeaveBalance {
    leave_type_id: number;
    year: number;
    remaining_days: number;
    carry_forward_days: number;
}

export interface LeaveType {
    id: number;
    name: string;
    max: number;
    is_attachment_required: boolean
}


export interface LeaveTypesItems {
    key: React.Key;
    name: string;
    employee_count: number;
    code: string;
    carry_over: boolean;
    is_active: boolean;
    min_duration: number;
    max_duration: number;
}


interface LeaveRequestCreatedBy {
    id: number;
    name: string;
    picture: string;
}


interface EmployeeLeaveType {
    id: number;
    name: string;
    code: string;
    attachments?: MetadataProps[]
}


export interface LeaveRequest {
    id: number;
    employee_id: number;
    name: string;
    email: string;
    picture: string;
    created_by: LeaveRequestCreatedBy;
    leave_type: EmployeeLeaveType;
    leave_details: LeaveDetails;
    evaluators: Evaluations;
    schedule: DimSchedule

}


interface LeaveDetails {
    start_date: string; // ISO date string
    end_date: string;   // ISO date string
    total_days: string;
    reason: string;
    status: "Pending" | "Approved" | "Rejected"
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

//for leave applications

export interface EmployeeLeave {
    id: number;
    name: string;
    picture: string;
    department: string;
    leave_balances: LeaveBalance[]
    trans_leaves: LeaveApplication[]
    dim_schedules: DimSchedule[];
}

export interface LeaveApplication {
    employee_id: number;
    start_date: string; // ISO 8601 date string
    end_date: string; // ISO 8601 date string
    status: string | null;
    created_at: string; // ISO 8601 date string
    updated_at: string; // ISO 8601 date string
    id: number;
    leave_type_id: number;
    reason: string;
    created_by: number;
    deleted_at: string | null;
    evaluators: Evaluations;
    files: string[] | null; // Adjust based on the structure of "files" if available
}
//
// interface Evaluators {
//     users: EvaluatorUser[];
//     approver: ApproverDecision;
//     comments: any[]; // Replace `any` if comments structure is known
//     reviewers: ReviewerDecision;
// }
//
// interface EvaluatorUser {
//     id: string; // UUID
//     name: string;
//     role: string;
//     email: string;
//     picture: string; // URL string
//     employee_id: number;
// }
//
// interface ApproverDecision {
//     decision: Decision;
//     approved_by: string; // UUID
// }
//
// interface ReviewerDecision {
//     decision: Decision;
//     reviewed_by: string; // UUID
// }
//
// interface Decision {
//     is_approved?: boolean; // Present in approver decision
//     is_reviewed?: boolean; // Present in reviewer decision
//     decisionDate: string | null; // ISO 8601 date string
//     rejectedReason: string | null;
// }
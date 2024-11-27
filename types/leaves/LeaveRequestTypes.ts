import React from "react";
import {LeaveApplicationEvaluation} from "@/types/leaves/leave-evaluators-types";

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

export interface EmployeeLeave {
    id: number;
    name: string;
    picture: string;
    department: string;
    leave_balances: LeaveBalance[];
}

export interface LeaveType {
    id: number;
    name: string;
    min: number;
    max: number;
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


// export interface LeaveRequest {
//     id: number;
//     name: string;
//     email: string;
//     picture: string;
//     leave_type: string;
//     start_date: string | Date;
//     end_date: string | Date;
//     total_days: number;
//     trans_employees_leaves: EmployeeLeaveRequest;
//     status: "Pending" | "Approved" | "Rejected";
//     trans_employees_leaves_approvedBy: EmployeeLeaveRequest;
//     ref_leave_types: LeaveType
// }

interface LeaveRequestCreatedBy {
    id: number;
    name: string;
    picture: string;
}


interface EmployeeLeaveType {
    id: number;
    name: string;
    code: string;
}


interface LeaveDetails {
    start_date: string; // ISO date string
    end_date: string;   // ISO date string
    total_days: number;
    reason: string;
    status: "Pending" | "Approved" | "Rejected"
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
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
    evaluators: LeaveApplicationEvaluation;
}

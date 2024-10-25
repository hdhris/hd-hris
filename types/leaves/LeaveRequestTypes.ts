import React from "react";

type ApprovedBy = {
    name: string;
    picture: string;
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

export interface RequestFormTableType extends Omit<LeaveRequestTypes, "status" | "approvedBy" | "email">{
    department: string;
    created_by: ApprovedBy;
    comment: string;
    reason: string;
    leave_id: number;
}



export interface EmployeeLeavesStatus{
    employees: EmployeeLeave[]
    availableLeaves: LeaveType[]
}

export interface LeaveBalance {
    year: number;
    remaining_days: number;
    carry_forward_days: number;
}

export interface EmployeeLeave {
    id: number;
    name: string;
    picture: string;
    department: string;
    leave_balances: LeaveBalance;
}

export interface LeaveType {
    id: number;
    name: string;
    min: number;
    max: number;
    isAttachmentRequired: boolean;
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

interface EmployeeLeaveRequest {
    id: number;
    email: string;
    prefix: string | null;
    first_name: string;
    last_name: string;
    middle_name: string;
    suffix: string | null;
    extension: string | null;
    picture: string;
}
export interface LeaveRequest {
    id: number;
    name: string;
    email: string;
    picture: string;
    leave_type: string;
    start_date: string | Date;
    end_date: string | Date;
    total_days: number;
    trans_employees_leaves: EmployeeLeaveRequest;
    status: "Pending" | "Approved" | "Rejected";
    trans_employees_leaves_approvedBy: EmployeeLeaveRequest;
    ref_leave_types: LeaveType
}
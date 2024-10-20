import React from "react";
import {LeaveTypesItems} from "@/types/leaves/LeaveRequestTypes";

export interface LeaveTypesKey {
    key: React.Key,
    data?: LeaveTypesItems
}

export interface LeaveType {
    id: number;
    accrual_frequency: 'Annually' | 'Monthly' | 'Weekly' |'Daily'; // Adjust as needed for other options
    accrual_rate: number;
    applicable_to_employee_types: 'regular' | 'probationary'; // Adjust if needed
    attachment_required: boolean;
    code: string;
    created_at: string; // You might consider using Date if you want to handle dates directly
    description: string;
    is_active: boolean;
    max_accrual: number;
    max_duration: number;
    min_duration: number;
    name: string;
    notice_required: number;
    paid_leave: boolean;
    updated_at: string; // Same consideration as created_at
    carry_over: boolean;
    employee_count: number;
}


export interface LeaveRequestPaginate {
    data: LeaveType[];
    currentPage: number
    perPage: number
    totalItems: number
}



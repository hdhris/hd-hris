import React from "react";
import {LeaveTypesItems} from "@/types/leaves/LeaveRequestTypes";
import {EmployeeDetails} from "@/types/employeee/EmployeeType";

export interface LeaveTypesKey {
    key: React.Key,
    data?: LeaveTypesItems
}
interface ApplicableTo{
    id: number
    name: string
}
export interface LeaveType {
    id: number;
    applicable_to_employee_types: ApplicableTo[]; // Adjust if needed
    attachment_required: boolean;
    code: string;
    created_at: string; // You might consider using Date if you want to handle dates directly
    description: string;
    is_active: boolean;
    max_duration: number;
    min_duration: number;
    name: string;
    paid_leave: boolean;
    updated_at: string; // Same consideration as created_at
    carry_over: boolean;
    current_employees: EmployeeDetails[];
}


export interface LeaveRequestPaginate {
    data: LeaveType[];
    currentPage: number
    perPage: number
    totalItems: number
}

export interface LeaveTypeForEmployee{
    id: number;
    name: string;
    applicable_to_employee_types: string[];
}



import {LeaveType} from "@/types/leaves/LeaveTypes";

export interface LeaveBalance {
    id: number;
    employee_id: number;
    year: number;
    allocated_days: number;
    used_days: number;
    remaining_days: number;
    carry_forward_days: number;
    created_at: string; // ISO 8601 format
    updated_at: string; // ISO 8601 format
    deleted_at: string | null;
    total_earned_days: number; // It seems to be a string, possibly due to its calculation or formatting
}


// Define types for the expected structures
export interface LeaveEarning {
    leave_type_name: string;
    leave_type_code: string;
    earned_days: number;
    date_earned: Date;
}

export interface UsedLeave {
    id: number;
    leave_type_name: string;
    leave_type_code: string;
    used_days: number;
    approval_date?: Date;
    created_at?: Date;
    status?: string;
}

export interface EmployeeLeaveBalance {
    id: number;
    allocated_days: number;
    remaining_days: number;
    carry_forward_days: number;
    leave_type: Pick<LeaveType, "id" | "name">
    used_days: number;
    created_at: string;
    updated_at: string;
}

export interface LeaveCredits {
    id: number;
    name: string;
    picture: string | null;
    department: string;
    employment_status: "regular" | "probationary";
    job: string
    leave_balance: EmployeeLeaveBalance[] | null;

}

export interface EmployeeLeaveCredits {
    data: LeaveCredits[],
    meta_data: {
        totalItems: number, years: number[]
    }
}

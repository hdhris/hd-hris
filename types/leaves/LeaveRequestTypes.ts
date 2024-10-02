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

export interface RequestFormWithMethod {
    method: "Add" | "Edit" | "Delete" | "Reset"
    data: RequestFormTableType
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
    duration_days: number;
}
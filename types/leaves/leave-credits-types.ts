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

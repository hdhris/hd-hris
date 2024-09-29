import {z} from "zod";

export const LeaveRequestFormValidation = z.object({
    employee_name: z.string().min(1, {message: "Employee name is required."}),
    leave_type: z.string().min(1, {message: "Leave type is required."}),
    start_date: z.string().min(1, {message: "Start date is required."}),
    end_date: z.string().min(1, {message: "End date is required."}),
    reason: z.string().min(5, {message: "Reason is required."}),
    status: z.string().min(1, {message: "Status is required."}),
})
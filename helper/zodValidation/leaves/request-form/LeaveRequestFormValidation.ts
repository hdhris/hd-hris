import {z} from "zod";

export const LeaveRequestFormValidation = z.object({
    employee_id: z.number().min(1, { message: "Employee is required." }),
    leave_type_id: z.number().min(1, { message: "Leave type is required." }),
    days_of_leave: z.string().min(1, { message: "Days of leave is required." }),
    leave_date: z.string(),
    //
    // leave_date_range: z.object({
    //     start: z.string().date(), end: z.string().date(),
    // }),
    reason: z.string().min(5, { message: "Reason is required." }),
    comment: z.string().optional(),
});

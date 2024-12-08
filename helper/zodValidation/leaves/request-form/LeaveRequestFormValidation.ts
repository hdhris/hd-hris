import {z} from "zod";

export const LeaveRequestFormValidation = z.object({
    employee_id: z.number().min(1, { message: "Employee is required." }),
    leave_type_id: z.number().min(1, { message: "Leave type is required." }),
    leave_date_range: z.object({
        start: z.string(), end: z.string(),
    }),
    reason: z.string().min(5, { message: "Reason is required." }),
});

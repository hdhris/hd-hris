import {z} from "zod";

export const LeaveRequestFormValidation = z.object({
    employee_id: z.number().min(1, { message: "Employee is required." }),
    leave_type_id: z.number().min(1, { message: "Leave type is required." }),
    leave_date_range: z.object({
        start: z.string({
            required_error: "Start date is required.",
        }).min(1, { message: "Start date is required." }), end: z.string({
            required_error: "End date is required.",
        }).min(1, { message: "End date is required." }),
    }).refine(data => data.start && data.end, {
        message: "Start and end dates are required.",
    }),
    reason: z.string().min(5, { message: "Reason is required." }),
});

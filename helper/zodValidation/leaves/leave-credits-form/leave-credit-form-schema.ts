import {z} from "zod";

export const LeaveCreditFormSchema = z.object({
    apply_for: z.string(),
    employee_id: z.number({
        required_error: "Employee is required.", invalid_type_error: "Employee must be a number",
    }).nullable(),
    leave_credits: z.array(z.object({
        leave_type_id: z.string(), allocated_days: z.number({
            required_error: "Allocated Days is required.",
            invalid_type_error: "Allocated Days must be a number",
        }), carry_forward_days: z.number().nullable().default(0)
    }).refine((data => data.allocated_days >= (data.carry_forward_days || 0)), {path:["carry_forward_days"],message: "Carry forward must be less than the allocated days"})),
});

export const EditLeaveCreditForm = z.object({
    apply_for: z.string(),
    employee_id: z.number({
        required_error: "Employee is required.", invalid_type_error: "Employee must be a number",
    }).nullable(),
    leave_credits: z.array(z.object({
        leave_type_id: z.string(), allocated_days: z.number({
            required_error: "Allocated Days is required.",
            invalid_type_error: "Allocated Days must be a number",
        }), carry_forward_days: z.number().nullable().default(0)
    }).refine((data => data.allocated_days >= (data.carry_forward_days || 0)), {path:["carry_forward_days"],message: "Carry forward must be less than the allocated days"})),

})


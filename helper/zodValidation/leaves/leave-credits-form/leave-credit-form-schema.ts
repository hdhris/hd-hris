import {z} from "zod";


export const LeaveCreditFormSchema = z.object({
    employee_id: z.number({required_error: "Employee is required.", invalid_type_error: "Employee must be a number"}),
    allocated_days: z.number({
        required_error: "Allocated Days is required.",
        invalid_type_error: "Allocated Days must be a number"
    }),
    carry_forward_days: z.number({
        required_error: "Carry Forward Days is required.",
        invalid_type_error: "Carry Forward Days must be a number"
    }),
})
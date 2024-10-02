import {z} from "zod";

export const LeaveTypeFormSchema = z.object({
    name: z.string().min(1, {message: "Name is required."}),
    code: z.string().min(1, {message: "Code is required."}),
    duration_days: z.number().min(1, {message: "Duration Days is required."}),
    is_active: z.boolean({message: "Is Active is required."}),
    is_carry_forward: z.boolean({message: "Is Carry Forward is required."}),
});

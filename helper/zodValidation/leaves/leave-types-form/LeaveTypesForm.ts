import {z} from "zod";

export const LeaveTypeFormSchema = z.object({
    name: z.string().min(1, {message: "Name is required."}),
    code: z.string().min(1, {message: "Code is required."}),
    duration_days: z.string().min(1, {message: "Duration Days is required."}).refine((data) =>
        parseInt(data) > 0, {message: "Duration Days must be greater than 0."}),
});

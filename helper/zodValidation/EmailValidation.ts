import {z} from "zod";

export const recoveryFormSchema = z.object({
    email: z
        .string()
        .email("Please enter a valid email address.")
})
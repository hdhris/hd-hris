import {z} from "zod";

export const NewPasswordValidation = z.object({
    current_password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
    new_password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }), confirm_password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    })
});
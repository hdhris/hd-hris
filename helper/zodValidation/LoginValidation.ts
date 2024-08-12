import {z} from "zod";

export const LoginValidation = z.object({
    username: z.string().min(4, {
        message: "Username must be at least 4 characters."
    }),
    password: z.string()
        .min(8, {message: "Password must be at least 8 characters long."})
        // .regex(/[a-z]/, {message: "Password must contain at least one lowercase letter."})
        // .regex(/[A-Z]/, {message: "Password must contain at least one uppercase letter."})
        // .regex(/\d/, {message: "Password must contain at least one digit."})
        // .regex(/[@$!%*?&]/, {message: "Password must contain at least one special character."})
})
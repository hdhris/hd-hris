import {z} from "zod";
import {PasswordValidation} from "@/helper/zodValidation/PasswordValidation";

export const LoginValidation = z.object({
    username: z.string().min(4, {
        message: "Username must be at least 4 characters."
    })
}).merge(PasswordValidation)
import {z} from "zod";
import {PasswordValidation} from "@/helper/zodValidation/PasswordValidation";

export const LoginValidation = z.object({
    username: z.string().min(1, {
        message: "Username is required"
    })
}).merge(PasswordValidation)
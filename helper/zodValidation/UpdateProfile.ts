import {z} from "zod";
import {recoveryFormSchema} from "@/helper/zodValidation/EmailValidation";
import {AddressValidation} from "@/helper/zodValidation/AddressValidation";

const yearLimit = new Date();
yearLimit.setFullYear(new Date().getFullYear() - 21);


export const updateProfileSchema = z.object({
    display_name: z.string().min(4, {message: "Username must be at least 4 characters."}),
    username: z.string().min(4, "Username must be at least 4 characters long"),
});
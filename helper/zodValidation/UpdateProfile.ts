import {z} from "zod";
import {recoveryFormSchema} from "@/helper/zodValidation/EmailValidation";
import {AddressValidation} from "@/helper/zodValidation/AddressValidation";

const yearLimit = new Date();
yearLimit.setFullYear(new Date().getFullYear() - 21);


export const updateProfileSchema = z.object({
    username: z.string().min(4, {message: "Username must be at least 4 characters."}),
    first_name: z.string().min(2, {message: "First Name must be at least 2 characters."}),
    last_name: z.string().min(2, {message: "Last Name must be at least 2 characters."}),
    birth_date: z.string(),
    civil_status: z.enum(["single", "married", "widowed", "separated", "divorced", "others"]),
    // email: z.string().email("Invalid email address."),
    phone_no: z.string().length(11, {message: "Invalid phone number."}),
    // street_or_purok: z.string().min(5, {message: "Street or Purok must be at least 5 characters."}),
}).merge(recoveryFormSchema).merge(AddressValidation);
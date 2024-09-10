import {z} from "zod";


export const AddressValidation = z.object({
    barangay: z.string().min(5, {message: "Barangay must be at least 5 characters."}),
    city: z.string().min(5, {message: "City must be at least 5 characters."}),
    province: z.string().min(5, {message: "Province must be at least 5 characters."}),
    reqion: z.string().min(5, {message: "Region must be at least 5 characters."})
})
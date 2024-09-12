import {z} from "zod";


export const AddressValidation = z.object({
    barangay: z.string().min(1, {message: "Barangay is required."}),
    city: z.string().min(1, {message: "City is required."}),
    province: z.string().min(1, {message: "Province is required."}),
    region: z.string().min(1, {message: "Region is required."}),
})
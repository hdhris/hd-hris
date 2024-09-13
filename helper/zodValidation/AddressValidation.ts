import {z} from "zod";


export const AddressValidation = z.object({
    addr_baranggay: z.string().min(1, {message: "Barangay is required."}),
    addr_municipal: z.string().min(1, {message: "City is required."}),
    addr_province: z.string().min(1, {message: "Province is required."}),
    addr_region: z.string().min(1, {message: "Region is required."}),
})
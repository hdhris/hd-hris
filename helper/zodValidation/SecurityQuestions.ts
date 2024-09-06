import {z} from "zod";

export const questionnairesFormSchema = z.object({
    questions: z.string().min(1, {
        message: "Questions is required."
    }).max(100, {message: "Questions must be less than 100 characters."}), answers: z.string().min(1, {
        message: "Answers is required."
    }).max(100, {message: "Answers must be less than 100 characters."})
})
import {z} from "zod";

export const PlanFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    plan_type: z.string(),
    eligibility_criteria: z.string().min(2, { message: "Eligibility criteria is required." }),
    advance_setting: z.boolean().default(false),
    coverage_details: z.string().min(10, { message: "Coverage details must be at least 10 characters." }),
    employer_contribution: z.number().min(0, { message: "Employer contribution must be a positive number." }).optional(),
    employee_contribution: z.number().min(0, { message: "Employee contribution must be a positive number." }).optional(),
    effective_date: z.string({ required_error: "Effective date is required.", invalid_type_error: "Effective date must be a string." }),
    expiration_date: z.string({ required_error: "Expiration date is required.", invalid_type_error: "Expiration date must be a string." }),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    is_active: z.boolean().default(false),

})
import {z} from "zod";

export const PlanFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    type: z.enum(["Health", "Dental", "Vision", "Life", "Retirement", "Disability"]),
    eligibility_criteria: z.string().min(2, { message: "Eligibility criteria is required." }),
    has_reference_table: z.boolean().default(false),
    coverage_details: z.string().min(10, { message: "Coverage details must be at least 10 characters." }),
    employer_contribution: z.number().min(0, { message: "Employer contribution must be a positive number." }).optional(),
    employee_contribution: z.number().min(0, { message: "Employee contribution must be a positive number." }).optional(),
    effective_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Effective date must be in YYYY-MM-DD format." }),
    expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Expiration date must be in YYYY-MM-DD format." }),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    is_active: z.boolean().default(false),
})
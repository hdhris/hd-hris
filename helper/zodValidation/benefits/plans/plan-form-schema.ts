import {z} from "zod";

// Base Plan Schema
export const PlanFormSchema = z.object({
    name: z.string().min(2, {message: "Name must be at least 2 characters."}),
    plan_type: z.string().min(1, {message: "Plan type is required."}),
    coverage_details: z.string().min(10, {message: "Coverage details must be at least 10 characters."}),
    effective_date: z.string({
        required_error: "Effective date is required.", invalid_type_error: "Effective date must be a string.",
    }).min(10, {message: "Effective date is required"}),
    expiration_date: z.string({
        required_error: "Expiration date is required.", invalid_type_error: "Expiration date must be a string.",
    }).min(1, {message: "Expiration date is required"}),
    description: z.string().min(10, {message: "Description must be at least 10 characters."}),
    is_active: z.boolean(),
    contribution_type: z.enum(["fixed", "percentage", "others"]),
    min_salary: z.number({required_error: "Minimum salary is required", invalid_type_error: "Minimum salary must be a number."}).min(0, {message: "Minimum salary must be a positive number."}),
    max_salary: z.number({required_error: "Minimum salary is required", invalid_type_error: "Minimum salary must be a number."}).min(0, {message: "Maximum salary must be a positive number."}),
})
//
// Fixed Amount Schema
export const PlanFormFixedAmountSchema = z.object({
    fixed_amount: z.number({required_error: "Minimum salary is required", invalid_type_error: "Minimum salary must be a number."}).min(0, {message: "Fixed amount must be a positive number."}),
});

// Percentage Schema
export const PlanFormPercentageSchema = z.object({
    percentage_amount: z.number({required_error: "Percentage is required", invalid_type_error: "Percentage must be a number."}).min(0, {message: "Percentage must be a positive number."}),
});

// Others Schema
export const PlanFormOthersSchema = z.object({
    tiers: z.array(z
        .object({
            employer_contribution: z.number({required_error: "Minimum salary is required", invalid_type_error: "Minimum salary must be a number."}).min(0, {message: "Employer contribution must be a positive number."}).optional(),
            employee_contribution: z.number({required_error: "Minimum salary is required", invalid_type_error: "Minimum salary must be a number."}).min(0, {message: "Employee contribution must be a positive number."}).optional(),
            min_salary: z.number({
                required_error: "Minimum salary is required", invalid_type_error: "Minimum salary must be a number",
            }).min(0, {message: "Minimum salary must be a positive number."}),
            max_salary: z.number({
                required_error: "Maximum salary is required", invalid_type_error: "Maximum salary must be a number",
            }).min(0, {message: "Maximum salary must be a positive number."}),
            minMSC: z.number({invalid_type_error: "Minimum MSC must be a number",
            }).nullable(), maxMSC: z.number({invalid_type_error: "Maximum MSC must be a number",
            }).nullable(), mscStep: z.number({invalid_type_error: "MSC step must be a number",
            }).nullable(), ecThreshold: z.number({invalid_type_error: "EC threshold must be a number",
            }).nullable(), ecLowRate: z.number({invalid_type_error: "EC low rate must be a number",
            }).nullable(), ecHighRate: z.number({
                invalid_type_error: "EC high rate must be a number",
            }).nullable(), wispThreshold: z.number({
               invalid_type_error: "WISP threshold must be a number",
            }).nullable(),
        })
        .refine((data) => {
            if(!data.ecLowRate || !data.ecHighRate) return true
            else return data.ecLowRate > data.ecHighRate
        }, {
            message: "Maximum EC must be greater than to Minimum EC", path: ["ecHighRate"],
        })
        .refine((data) => {
            if(!data.maxMSC || !data.minMSC ) return true
            else return data.maxMSC > data.minMSC
        }, {
            message: "Maximum MSC must be greater than or equal to MSC step", path: ["maxMSC"],
        })
        .refine((data) => data.max_salary > data.min_salary, {
            message: "Maximum salary must be greater than or equal to Minimum salary", path: ["max_salary"],
        })),
});

export const EditPlanFormOthersSchema = z.object({
    tiers: z.array(z
        .object({
            id: z.number(),
            employer_contribution: z.number({required_error: "Minimum salary is required", invalid_type_error: "Minimum salary must be a number."}).min(0, {message: "Employer contribution must be a positive number."}).optional(),
            employee_contribution: z.number({required_error: "Minimum salary is required", invalid_type_error: "Minimum salary must be a number."}).min(0, {message: "Employee contribution must be a positive number."}).optional(),
            min_salary: z.number({
                required_error: "Minimum salary is required", invalid_type_error: "Minimum salary must be a number",
            }).min(0, {message: "Minimum salary must be a positive number."}),
            max_salary: z.number({
                required_error: "Maximum salary is required", invalid_type_error: "Maximum salary must be a number",
            }).min(0, {message: "Maximum salary must be a positive number."}),
            minMSC: z.number({invalid_type_error: "Minimum MSC must be a number",
            }).nullable(), maxMSC: z.number({invalid_type_error: "Maximum MSC must be a number",
            }).nullable(), mscStep: z.number({invalid_type_error: "MSC step must be a number",
            }).nullable(), ecThreshold: z.number({invalid_type_error: "EC threshold must be a number",
            }).nullable(), ecLowRate: z.number({invalid_type_error: "EC low rate must be a number",
            }).nullable(), ecHighRate: z.number({
                invalid_type_error: "EC high rate must be a number",
            }).nullable(), wispThreshold: z.number({
               invalid_type_error: "WISP threshold must be a number",
            }).nullable(),
        })
        .refine((data) => {
            if(!data.ecLowRate || !data.ecHighRate) return true
            else return data.ecLowRate < data.ecHighRate
        }, {
            message: "Maximum EC must be greater than to Minimum EC", path: ["ecHighRate"],
        })
        .refine((data) => {
            if(!data.maxMSC || !data.minMSC ) return true
            else return data.maxMSC > data.minMSC
        }, {
            message: "Maximum MSC must be greater than or equal to MSC step", path: ["maxMSC"],
        })
        .refine((data) => data.max_salary > data.min_salary, {
            message: "Maximum salary must be greater than or equal to Minimum salary", path: ["max_salary"],
        })),
});

// Unified Schema with Conditional Refinement
// export const contribution_type_schema = z
// PlanFormSchema.merge(PlanFormFixedAmountSchema).merge(PlanFormPercentageSchema).merge(PlanFormOthersSchema)
//     .refine(
//         (data) => new Date(data.effective_date) <= new Date(data.expiration_date),
//         {
//             message: "Effective date must be less than or equal to Expiration date",
//             path: ["expiration_date"],
//         }
//     );

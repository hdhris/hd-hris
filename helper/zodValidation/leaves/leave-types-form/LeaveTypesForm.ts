import {z} from "zod";
import {toPascalCase} from "@/helper/strings/toPascalCase";

export const LeaveTypeSchema = z.object({
    //general information
    name: z.string().min(1, {message: "Name is required"}).transform(data => toPascalCase(data)),
    code: z.string().min(1, {message: "Code is required"}).transform((data) => data.toUpperCase()),
    description: z.string().min(1, {message: "Description is required"}), //accrual setting
    accrualRate: z.number().optional(),
    accrualFrequency: z.string().optional(),
    maxAccrual: z.number().optional(),
    carryOver: z.boolean(), //Leave Duration
    minDuration: z.number({
        required_error: "Min Duration is required",
        invalid_type_error: "Min Duration must be a number"
    }),
    maxDuration: z.number({
        required_error: "Max Duration is required",
        invalid_type_error: "Max Duration must be a number"
    }),
    noticeRequired: z.number({
        required_error: "Notice is required",
        invalid_type_error: "Notice must be a number"
    }), //Additional Settings
    paidLeave: z.boolean(),
    isActive: z.boolean(),
    attachmentRequired: z.boolean(),
    applicableToEmployeeTypes: z.string(),
}).refine(data => data.maxDuration >= data.minDuration, {
    message: "Max Duration must be greater than or equal to Min Duration", path: ["maxDuration"],
});

// .transform((data) => parseInt(data))
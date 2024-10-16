import {z} from "zod";

export const LeaveTypeSchema = z.object({
    //general information
    name: z.string().min(1, { message: "Name is required" }),
    code: z.string().min(1, { message: "Code is required" }).transform((data) => data.toUpperCase()),
    description: z.string().min(1, { message: "Description is required" }),
    //accrual setting
    accrualRate: z.number({required_error: "Accrual Rate is required"}).optional(),
    accrualFrequency: z.string().min(1, { message: "Accrual Frequency is required" }).optional(),
    maxAccrual: z.number({required_error: "Max Accrual is required"}).optional(),
    carryOver: z.boolean(),
    //Leave Duration
    minDuration: z.number({required_error: "Min Duration is required"}),
    maxDuration: z.number({required_error: "Max Duration is required"}),
    noticeRequired: z.number({required_error: "Notice is required"}),
    //Additional Settings
    paidLeave: z.boolean(),
    isActive: z.boolean(),
    attachmentRequired: z.boolean(),
    applicableToEmployeeTypes: z.string(),
});

// .transform((data) => parseInt(data))
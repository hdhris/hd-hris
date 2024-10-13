import {z} from "zod";

export const LeaveTypeSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    code: z.string().min(1, { message: "Code is required" }).transform((data) => data.toUpperCase()),
    description: z.string().min(1, { message: "Description is required" }),
    accrualRate: z.string().min(1, { message: "Accrual Rate is required" }).transform((data) => parseInt(data)),
    accrualFrequency: z.string().min(1, { message: "Accrual Frequency is required" }),
    maxAccrual: z.string().min(1, { message: "Max Accrual is required" }).transform((data) => parseInt(data)),
    carryOver: z.boolean(),
    paidLeave: z.boolean(),
    affectsOvertime: z.boolean(),
    requiresSignatories: z.boolean(),
    isActive: z.boolean(),
    minDuration: z.string().min(1, { message: "Min Duration is required" }).transform((data) => parseInt(data)),
    maxDuration: z.string().min(1, { message: "Max Duration is required" }).transform((data) => parseInt(data)),
    noticeRequired: z.string().min(1, { message: "Notice is required" }).transform((data) => parseInt(data)),
    proRatedForProbationary: z.boolean(),
    attachmentRequired: z.boolean(),
    payRate: z.string().transform((data) => parseInt(data)).optional(),
    payRateFrequency: z.string().optional(),
    applicableToEmployeeTypes: z.string(),
});

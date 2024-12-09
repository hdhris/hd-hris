// app/api/employeemanagement/employees/types.ts

import { z } from "zod";

// Employee validation schema
export const employeeSchema = z.object({
  branch_id: z.number().optional(),
  picture: z.string().optional(),
  first_name: z.string().max(45),
  last_name: z.string().max(45),
  middle_name: z.string().max(45).optional(),
  suffix: z.string().max(10).optional().nullable(),
  extension: z.string().max(10).optional().nullable(),
  email: z.string().email().max(45).optional(),
  contact_no: z.string().max(45).optional(),
  birthdate: z.string().optional(),
  hired_at: z.string().optional(),
  gender: z.string().max(10).optional(),
  job_id: z.number().optional(),
  salary_grade_id: z.number().optional(),
  employement_status_id: z.number().optional(),
  department_id: z.number().optional(),
  addr_region: z.number().optional(),
  addr_province: z.number().optional(),
  addr_municipal: z.number().optional(),
  addr_baranggay: z.number().optional(),
  prefix: z.string().max(10).optional(),
  statutory_no_json: z.any().optional(),
  family_bg_json: z.any().optional(),
  educational_bg_json: z.any().optional(),
  civil_service_eligibility_json: z.any().optional(),
  work_experience_json: z.any().optional(),
  voluntary_organizations_json: z.any().optional(),
  training_programs_attended_json: z.any().optional(),
  government_issued_id_json: z.any().optional(),
  suspension_json: z.any().optional(),
  resignation_json: z.any().optional(),
  termination_json: z.any().optional(),
  schedules: z.array(
    z.object({
      batch_id: z.number(),
      days_json: z.array(z.string()),
    })
  ).optional(),
});

export const statusUpdateSchema = z.object({
  status: z.enum(["active", "suspended", "resigned", "terminated"]),
  reason: z.string().optional(),
  date: z.string().optional(),
  endDate: z.string().optional(),
});

export const createEmployeeSchema = z.object({
  employee: employeeSchema,
  credentials: z.object({
    username: z.string(),
    password: z.string(),
  }),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;
export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;
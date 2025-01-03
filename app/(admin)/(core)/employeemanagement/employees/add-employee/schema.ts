// app/employeemanagement/employee/addemployees/schema.ts
import axios from "axios";
import dayjs from "dayjs";
import { z } from "zod";

// Single Certificate type definition
export type Certificate = {
  name?: string;
  url: string | File;
  fileName?: string;
};

// const checkEmailExists = async (email: string) => {
//   try {
//     const response = await axios.get(
//       `/api/employeemanagement/check-email?email=${email}`
//     );
//     return !response.data.exists;
//   } catch (error) {
//     return false;
//   }
// };

export const employeeSchema = z.object({
  privilege_id: z.string().min(1, "Access level is required"),
  prefix: z.string().optional(),
  picture: z.union([z.instanceof(File), z.string()]).optional(),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z
    .string()
    .min(1, "First name is required")
    .regex(/^[a-zA-Z\s]*$/, "First name should only contain letters"),
  middle_name: z
    .string()
    .regex(/^[a-zA-Z\s]*$/, "Middle name should only contain letters")
    .optional(),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .regex(/^[a-zA-Z\s]*$/, "Last name should only contain letters"),
  suffix: z.string().optional().nullable(),
  extension: z.string().optional().nullable(),
  gender: z.string().min(1, "Gender is required"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  contact_no: z
    .string()
    .min(1, "Contact number is required")
    .regex(
      /^(09|\+639|9)\d{9}$/,
      "Contact number should start with 09, +639, or 9 followed by 9 digits"
    )
    .transform((val) => {
      if (val.startsWith("09")) return val.substring(1);
      if (val.startsWith("+639")) return val.substring(3);
      return val;
    })
    .refine(
      (val) => val.length === 10,
      "Contact number must be exactly 10 digits"
    ),
    birthdate: z.string()
  .min(1, "Birthdate is required")
  .refine((date) => {
    const birthDate = dayjs(date);
    const maxAge = dayjs().subtract(100, 'years');
    return birthDate.isAfter(maxAge);
  }, "Age cannot be over 100 years")
  .refine((date) => {
    const birthDate = dayjs(date);
    const minAge = dayjs('2006-12-31');
    return birthDate.isBefore(minAge) || birthDate.isSame(minAge);
  }, "Employee must be at least 18 years old"),
  
  addr_region: z.string().min(1, "Region is required"),
  addr_province: z.string().min(1, "Province is required"),
  addr_municipal: z.string().min(1, "Municipal is required"),
  addr_baranggay: z.string().min(1, "Baranggay is required"),

  // Family background fields
  fathers_first_name: z.string().optional(),
  fathers_middle_name: z.string().optional(),
  fathers_last_name: z.string().optional(),
  mothers_first_name: z.string().optional(),
  mothers_middle_name: z.string().optional(),
  mothers_last_name: z.string().optional(),
  guardian_first_name: z.string().optional(),
  guardian_middle_name: z.string().optional(),
  guardian_last_name: z.string().optional(),

  // Educational background fields
  elementary: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "School name should only contain letters and numbers"
    )
    .optional(),
  highSchool: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "School name should only contain letters and numbers"
    )
    .optional(),
  seniorHighSchool: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "School name should only contain letters and numbers"
    )
    .optional(),
  seniorHighStrand: z
    .string()
    .regex(/^[a-zA-Z0-9\s]*$/, "Strand should only contain letters and numbers")
    .optional(),
  tvlCourse: z
    .string()
    .regex(/^[a-zA-Z0-9\s]*$/, "Course should only contain letters and numbers")
    .optional()
    .nullable(),
  universityCollege: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "School name should only contain letters and numbers"
    )
    .optional(),
  course: z
    .string()
    .regex(/^[a-zA-Z0-9\s]*$/, "Course should only contain letters and numbers")
    .optional(),
  highestDegree: z.string().optional(),

  // Masters details
  masters: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "Masters institution should only contain letters and numbers"
    )
    .optional(),
  mastersCourse: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "Masters course should only contain letters and numbers"
    )
    .optional(),
  mastersYear: z
    .union([
      z.string().regex(/^\d{4}-\d{4}$/, "Year should be in format YYYY-YYYY"),
      z.string().length(0),
      z.null(),
      z.undefined(),
    ])
    .optional(),

  // Doctorate details
  doctorate: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "Doctorate institution should only contain letters and numbers"
    )
    .optional(),
  doctorateCourse: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "Doctorate course should only contain letters and numbers"
    )
    .optional(),
  doctorateYear: z
    .union([
      z.string().regex(/^\d{4}-\d{4}$/, "Year should be in format YYYY-YYYY"),
      z.string().length(0),
      z.null(),
      z.undefined(),
    ])
    .optional(),

    certificates: z
    .array(z.union([z.instanceof(File), z.string()]))
    .optional()
    .default([]),
  mastersCertificates: z
    .array(z.union([z.instanceof(File), z.string()]))
    .optional()
    .default([]),
  doctorateCertificates: z
    .array(z.union([z.instanceof(File), z.string()]))
    .optional()
    .default([]),

  // Employment details
  hired_at: z.string()
  .min(1, "Hire date is required")
  .refine((date) => {
    const hireDate = dayjs(date);
    const minimumHireDate = dayjs('1970-01-01');
    return hireDate.isAfter(minimumHireDate);
  }, "Hire date seems invalid. Please select a more recent date"),
  
  department_id: z.string().min(1, "Department is required"),
  job_id: z.string().min(1, "Job is required"),
  // is_regular: z.preprocess((val) => {
  //   if (typeof val === "string") return val === "true";
  //   return val;
  // }, z.boolean()),
  branch_id: z.string().min(1, "Branch is required"),
  salary_grade_id: z.string().min(1, "Salary Grade is required"),
  batch_id: z.string().min(1, "Batch is required"),
  days_json: z.array(z.string()),
  employement_status_id: z.string().min(1, "Employement status is required"),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

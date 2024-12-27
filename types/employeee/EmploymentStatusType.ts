import { Decimal } from "@prisma/client/runtime/library";

export type EmploymentStatus = {
  appraisal_interval: number | undefined;
id: number;
  name: string;
  employeeCount: number;
  created_at: string;
  updated_at: string;
  superior_id: number | null;
  };
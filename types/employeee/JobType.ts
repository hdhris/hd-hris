import { Decimal } from "@prisma/client/runtime/library";

export type JobPosition = {
  max_salary(max_salary: any): number | undefined;
  min_salary(min_salary: any): number | undefined;
  department_id: number;
id: number;
  name: string;
  superior_id: number;
  is_active: boolean;
  is_superior: boolean;
  max_employees: number;
  max_department_instances: number;
  created_at: string;
  updated_at: string;
  
  trans_employees?: Array<{
    id: number;
  }>;
  };
import { Decimal } from "@prisma/client/runtime/library";

export type JobPosition = {
id: number;
  name: string;
  pay_rate: number;
  basic_salary: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  for_probi: boolean;
  trans_employees?: Array<{
    id: number;
  }>;
  };
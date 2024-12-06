import { Decimal } from "@prisma/client/runtime/library";

export type SalaryGrade = {
  id: number;
  name: string;
  amount: number;
  updated_at: string;
  created_at: string;
};

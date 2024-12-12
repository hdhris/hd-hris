import { Decimal } from "@prisma/client/runtime/library";

export type JobPosition = {
id: number;
  name: string;
  superior_id: number;

  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  trans_employees?: Array<{
    id: number;
  }>;
  };
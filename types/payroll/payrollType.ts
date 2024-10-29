import { UserEmployee } from "@/helper/include-emp-and-reviewr/include";
import { Payhead } from "./payheadType";

export interface ProcessDate {
  id: number;
  start_date: string;
  end_date: string;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}


export interface PayrollTable {
  // pr_dates: PRDate[];
  employees: UserEmployee[];
}


export interface Payroll {
  employee_id: number;
  gross_total_amount: string;
  deduction_total_amount: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  id: number;
  date_id: number;
  deleted_at: string | null; // ISO date string or null
}

// interface Earning {
//   calculation: string;
//   created_at: string; // ISO date string
//   updated_at: string; // ISO date string
//   deleted_at: string | null; // ISO date string or null
//   id: number;
//   is_active: boolean;
//   name: string;
//   type: string;
//   affected_json: {
//     mandatory: {
//       probationary: boolean;
//       regular: boolean;
//     };
//     department: number[];
//     job_classes: number[];
//   };
// }

// interface Deduction {
//   calculation: string;
//   created_at: string; // ISO date string
//   updated_at: string; // ISO date string
//   deleted_at: string | null; // ISO date string or null
//   id: number;
//   is_active: boolean;
//   name: string;
//   type: string;
//   affected_json: {
//     mandatory: {
//       probationary: boolean;
//       regular: boolean;
//     };
//     department: number[];
//     job_classes: number[];
//   };
// }

export type PayslipPayhead = Omit<Payhead,"dim_payhead_affecteds"|"type">
export interface PayslipEmployee extends UserEmployee {
  dim_payhead_affecteds: {
    payhead_id: number;
  }[];
}
export interface PayslipData {
  payrolls: Payroll[];
  employees: PayslipEmployee[];
  earnings: PayslipPayhead[];
  deductions: PayslipPayhead[];
}

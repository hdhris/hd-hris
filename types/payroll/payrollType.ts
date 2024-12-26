import { MajorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { Payhead } from "./payheadType";
import { VariableAmountProp } from "@/helper/payroll/calculations";

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
  employees: MajorEmployee[];
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

export interface Breakdown {
  payroll_id: number;
  payhead_id: number;
  amount: string;
  id: number;
  created_at: string;  // Using ISO string format for date fields
  updated_at: string;
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

type Benefit = {
  ref_benefit_plans: {
    deduction_id: number;
  }[];
}

export type PayslipPayhead = Payhead & Benefit;

export interface PayslipData {
  payrolls: Payroll[];
  breakdowns: Breakdown[];
  employees: MajorEmployee[];
  earnings: PayslipPayhead[];
  deductions: PayslipPayhead[];
  calculatedAmountList:  {
    [employeeId: number]: VariableAmountProp[];
  }
}

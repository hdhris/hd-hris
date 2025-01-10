import {
  MajorEmployee,
} from "@/helper/include-emp-and-reviewr/include";
import { ApprovalStatusType } from "../attendance-time/OvertimeType";
import { Evaluations } from "../leaves/leave-evaluators-types";
import { MetadataProps } from "@/helper/file/getFileMetadata";

export type PaymentMethod =  "payroll" | "cash" | "bank_transfer" | "other";
export interface LoanRequest {
  id: number;
  employee_id: number;
  amount_requested: string;
  reason: string;
  status: ApprovalStatusType; // "pending" | "approved" | "rejected"
  payment_method: PaymentMethod;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  evaluators: Evaluations;
  trans_employees_trans_cash_advances_employee_idTotrans_employees: MajorEmployee;
  trans_cash_advance_disbursements: LoanDisbursement[];
  files: string[];
  meta_files: MetadataProps[];
}

export interface LoanDisbursement {
  id: number;
  cash_advance_id: number;
  disbursed_at: string;
  amount: string;
  payment_method: PaymentMethod;
  repayment_status: "to_be_paid" | "full_paid" | "cancelled"; // Add other potential statuses
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  trans_cash_advance_repayments: LoanRepayment[];
}

export interface LoanRepayment {
  id: number;
  disbursement_id: number;
  repaid_at: string;
  amount_repaid: string;
  payment_method: PaymentMethod;
  // status: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

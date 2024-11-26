import {
  UserEmployee,
  UserReviewer,
} from "@/helper/include-emp-and-reviewr/include";
import { ApprovalStatusType } from "../attendance-time/OvertimeType";

export interface LoanRequest {
  id: number;
  employee_id: number;
  amount_requested: string;
  reason: string;
  status: ApprovalStatusType; // "pending" | "approved" | "rejected"
  approval_by: number;
  approval_at: string;
  comment: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  trans_employees_trans_cash_advances_employee_idTotrans_employees: UserEmployee;
  trans_employees_trans_cash_advances_approval_byTotrans_employees: UserReviewer;
  trans_cash_advance_disbursements: LoanDisbursement[];
}

export interface LoanDisbursement {
  id: number;
  cash_advance_id: number;
  disbursed_at: string;
  amount: string;
  payment_method: "payroll" | "cash" | "bank_transfer" | "other";
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
  payment_method: "payroll" | "cash" | "bank_transfer" | "other";
  // status: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Employee {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  contact_no: string;
  picture: string;
  ref_departments: {
    id: number;
    name: string;
  };
  ref_branches: {
    id: number;
    name: string;
  };
  ref_job_classes: {
    id: number;
    name: string;
  };
}

interface Approver {
  first_name: string;
  middle_name: string;
  last_name: string;
  picture: string;
}

interface Employee {
  id: number;
  picture: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  ref_departments: {
    id: number;
    name: string;
  };
  ref_job_classes: {
    id: number;
    name: string;
  };
}

export interface OvertimeEntry {
  employee_id: number;
  status: "pending" | "approved" | "denied";
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  id: number;
  date: string; // ISO date string
  clock_in: string; // ISO date string
  clock_out: string; // ISO date string
  requested_mins: number;
  reason: string;
  approved_by: number;
  approved_at: string; // ISO date string
  rate_per_hour: string;
  comment: string;
  rendered_mins: number;
  deleted_at: string | null; // Nullable for deleted entries
  trans_employees_overtimes: Employee; // Employee details
  trans_employees_overtimes_approvedBy: Approver; // Approver details
  full_name: string;
  approvedBy_full_name: string;
};

export interface OvertimeResponse {
  overtime: OvertimeEntry;
  employees: Employee[];
}
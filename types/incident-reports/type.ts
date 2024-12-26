import { MinorEmployee, MajorEmployee } from "@/helper/include-emp-and-reviewr/include";

export interface IncidentReport {
  id: number;
  employee_id: number;
  occurance_date: string; // ISO date string
  type: string;
  location: string;
  severity: "minor" | "major" | "critical";
  description: string;
  reported_by: number;
  comments: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  deleted_at: string | null;
  trans_employees_dim_incident_reports_employee_idTotrans_employees: MajorEmployee,
  trans_employees_dim_incident_reports_reported_byTotrans_employees: MinorEmployee,
};

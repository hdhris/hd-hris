export interface Payhead {
  calculation: string; // Assuming calculation will be a string (like "1000")
  created_at: string; // ISO 8601 formatted date string
  updated_at: string; // ISO 8601 formatted date string
  deleted_at: string | null; // Nullable ISO 8601 formatted date string
  id: number; // Unique identifier for the payhead
  is_active: boolean; // Indicates if the payhead is active
  is_mandatory: boolean; // Indicates if the payhead is mandatory
  name: string; // Name of the payhead
  type: 'earning' | 'deduction'; // Restricts to "earning" or "deduction"
  dim_payhead_affecteds: Affected[]; // Array of affected entries
}
  export interface Affected {
    id: number;
    payhead_id: number;
    employee_id: number;
    created_at: string; // ISO 8601 formatted date string
    updated_at: string; // ISO 8601 formatted date string
  }
  
  export interface AffectedEmployee {
    id: number,
    picture: string;
    last_name: string;
    first_name: string;
    middle_name: string;
    ref_departments: {
      name : string
    };
    ref_job_classes: {
      name : string
    };
  }
  
  export interface PayheadAffected {
    affected: Affected[];
    employees: AffectedEmployee[];
    payhead: Payhead;
  }
  
  
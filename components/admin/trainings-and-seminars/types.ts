// types.ts
export interface EnrolledRecord {
  id: number;
  status: string;
  feedback?: string;
  instructor_name: string;
  trans_employees: {
    email: string;
    first_name: string;
    last_name: string;
    picture?: string;
    ref_departments?: {
      name: string;
    };
  };
  ref_training_programs: {
    name: string;
    type: string;
    location: string;
    start_date: string;
    end_date: string;
    hour_duration: number;
    is_active: boolean;
  };
}

export interface Schedule {
  id: number;
  program_id?: number;
  location?: string;
  session_timestamp?: string;
  hour_duration?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  ref_training_programs?: {
    id: number;
    name: string;
    type: string;
    instructor_name?: string;
  };
}

// Update the searchable keys to match the exact nested structure
export type NestedKeysRecord = 
  | "trans_employees.first_name" 
  | "trans_employees.last_name"
  | "ref_training_programs.name";

export type NestedKeysSchedule =
  | "ref_training_programs.name"
  | "location";

// Keep SearchableKeys for backward compatibility
export type SearchableKeys = NestedKeysRecord | NestedKeysSchedule;

// Define sortable paths
export type SortableKeys = 
  | "ref_training_programs.name"
  | "ref_training_programs.start_date"
  | "status"
  | "enrollment_date";



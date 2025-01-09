// types.ts
import { NestedKeys } from "@/hooks/types/types";
export interface TrainingRecord {
  id: number;
  schedule_id?: number;
  participant_id?: number;
  rating?: number;
  feedback?: string;
  suggestion?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  dim_training_participants?: {
    id: number;
    employee_id?: number;
    status: string;
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
      instructor_name: string;
      name: string;
      type: string;
      location: string;
      start_date: string;
      end_date: string;
      hour_duration: number;
      is_active: boolean;
    };
  };
  dim_training_schedules?: {
    id: number;
    location: string;
    session_timestamp: string;
    hour_duration: number;
    ref_training_programs: {
      name: string;
      type: string;
      instructor_name: string;
    };
  };
}

export type Participant = {
  id: number;

  trans_employees: {
    first_name: string;

    last_name: string;
  };
};

export interface EnrolledRecord {
  enrollement_date: string;
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
    instructor_name: string;
    name: string;
    type: string;
    location: string;
    start_date: string;
    end_date: string;
    hour_duration: number;
    is_active: boolean;
    locationDetails?: {
      addr_region?: {
        address_code: number;
        address_name: string;
      } | null;
      addr_province?: {
        address_code: number;
        address_name: string;
      } | null;
      addr_municipal?: {
        address_code: number;
        address_name: string;
      } | null;
      addr_baranggay?: {
        address_code: number;
        address_name: string;
      } | null;
    } | null;
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
  locationDetails: {
    addr_region: { address_name: string } | null;
    addr_province: { address_name: string } | null;
    addr_municipal: { address_name: string } | null;
    addr_baranggay: { address_name: string } | null;
  } | null;
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

export type NestedKeysSchedule = "ref_training_programs.name" | "location";

// Keep SearchableKeys for backward compatibility
export type SearchableKeys = NestedKeysRecord | NestedKeysSchedule;

// Define sortable paths
export type SortableKeys =
  | "ref_training_programs.name"
  | "ref_training_programs.start_date"
  | "status"
  | "enrollment_date";

export type NestedKeysTrainingRecord =
  | "dim_training_participants.trans_employees.first_name"
  | "dim_training_participants.trans_employees.last_name"
  | "dim_training_participants.ref_training_programs.name";

  export type TrainingRecordSearchKeys = 
  | "dim_training_participants.trans_employees.first_name"
  | "dim_training_participants.trans_employees.last_name"
  | "dim_training_schedules.ref_training_programs.name";

  declare module "@/hooks/types/types" {
    interface NestedKeyTypes {
      TrainingRecord: TrainingRecordSearchKeys;
    }
  }

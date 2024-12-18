// types.ts
export interface TrainingRecord {
    id: number;
    employee_id: number;
    program_id: number;
    enrollement_date: string;
    status: string;
    feedback: string | null;
    instructor_name: string;
    ref_training_programs: {
        instructor_name: string;
        name: string;
        description: string;
        type: string;
        location: string;
        start_date: string;
        end_date: string;
        hour_duration: number;
        is_active: boolean;
        trans_employees: {
            first_name: string;
            last_name: string;
        };
    };
    trans_employees: {
        picture: string;
        email:string;
        first_name: string;
        last_name: string;
        ref_departments: {
            name: string;
        };
    };
}

// Define searchable paths for type safety
export type SearchableTrainingKeys = 
  | "trans_employees.first_name" 
  | "trans_employees.last_name"
  | "ref_training_programs.name"
  | "ref_training_programs.type"
  | "status";

// Define sortable paths
export type SortableTrainingKeys = 
  | "ref_training_programs.name"
  | "ref_training_programs.start_date"
  | "status"
  | "enrollement_date";
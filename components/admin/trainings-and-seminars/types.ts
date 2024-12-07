// components/admin/trainings-and-seminars/emprecords/types.ts
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
        first_name: string;
        last_name: string;
        ref_departments: {
            name: string;
        };
    };
}
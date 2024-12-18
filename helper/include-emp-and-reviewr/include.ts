import { BatchSchedule } from "@/types/attendance-time/AttendanceTypes";

export const emp_rev_include = {
    employee_full_detail: {
        select: {
            id: true,
            last_name: true,
            middle_name: true,
            first_name: true,
            prefix: true,
            suffix: true,
            extension: true,
            email: true,
            contact_no: true,
            picture: true,
            ref_salary_grades: {
                select: {
                    id: true,
                    name: true,
                    amount: true,
                },
            },
            ref_employment_status: {
                select: {
                    id: true,
                    name: true,
                },
            },
            ref_departments: {
                select: {
                    id: true,
                    name: true,
                },
            },
            ref_branches: {
                select: {
                    id: true,
                    name: true,
                },
            },
            ref_job_classes: {
                select: {
                    id: true,
                    name: true,
                },
            },
            dim_schedules: {
                where: {
                    end_date: null,
                },
                include: {
                    ref_batch_schedules: true,
                },
            },
        },
    },
    employee_detail: {
        select: {
            id: true,
            last_name: true,
            middle_name: true,
            first_name: true,
            prefix: true,
            suffix: true,
            extension: true,
            email: true,
            contact_no: true,
            picture: true,
            ref_employment_status: {
                select: {
                    id: true,
                    name: true,
                },
            },
            ref_departments: {
                select: {
                    id: true,
                    name: true,
                },
            },
            ref_branches: {
                select: {
                    id: true,
                    name: true,
                },
            },
            ref_job_classes: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
    reviewer_detail: {
        select: {
            last_name: true,
            middle_name: true,
            first_name: true,
            picture: true,
            email: true,
        },
    },
};

export interface UserEmployee {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    contact_no: string;
    picture: string;
    ref_salary_grades: {
        id: number;
        name: string;
        amount: number;
    };
    ref_employment_status: {
        id: number;
        name: string;
    };
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
    dim_schedules: EmployeeSchedule[];
}

interface EmployeeSchedule {
  id: number;
  employee_id: number;
  days_json: string[]; // Array of day abbreviations
  batch_id: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  deleted_at: string | null; // ISO timestamp or null
  start_date: string; // ISO timestamp
  end_date: string | null; // ISO timestamp or null
  clock_in: string | null; // ISO timestamp or null
  clock_out: string | null; // ISO timestamp or null
  break_min: number | null;
  ref_batch_schedules: BatchSchedule;
}

export interface UserReviewer {
    first_name: string;
    middle_name: string;
    last_name: string;
    picture: string;
    email: string;
}

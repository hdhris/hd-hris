import { BatchSchedule } from "@/types/attendance-time/AttendanceTypes";
import { UnavaliableStatusJSON } from "@/types/employeee/EmployeeType";

const minor_detail = {
    id: true,
    last_name: true,
    middle_name: true,
    first_name: true,
    picture: true,
    email: true,
    prefix: true,
    suffix: true,
    extension: true,
    contact_no: true,
};

const basic_detail = {
    ...minor_detail,
    hired_at: true,
    suspension_json: true,
    termination_json: true,
    resignation_json: true,
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
            appraisal_interval: true,
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
};

const major_detail = {
    ...basic_detail,
    dim_schedules: {
        where: {
            end_date: null,
        },
        include: {
            ref_batch_schedules: true,
        },
    },
};

export const emp_rev_include = {
    minor_detail: {
        select: minor_detail,
    },
    basic_detail: {
        select: basic_detail,
    },
    employee_detail: {
        select: major_detail,
    },
};

// export interface MajorEmployee {
//     id: number;
//     first_name: string;
//     middle_name: string;
//     last_name: string;
//     email: string;
//     picture: string;
//     contact_no: string;
// }

export interface MinorEmployee {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    picture: string;
    email: string;
}

export type BasicEmployee = MinorEmployee & {
    suspension_json: UnavaliableStatusJSON;
    termination_json: UnavaliableStatusJSON;
    resignation_json: UnavaliableStatusJSON;
    ref_salary_grades: {
        id: number;
        name: string;
        amount: number;
    };
    ref_employment_status: {
        id: number;
        name: string;
        appraisal_interval: number;
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
};

export type MajorEmployee = BasicEmployee & {
    dim_schedules: EmployeeSchedule[];
};

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
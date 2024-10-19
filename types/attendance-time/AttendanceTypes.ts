export interface AttendanceLog {
    id: number;
    employee_id: number;
    timestamp: string; // ISO format string
    status: number;
    punch: number;
    created_at: string; // ISO format string
    trans_employees: {
      last_name: string;
      first_name: string;
      middle_name: string;
      picture: string;
    };
  }

export interface EmployeeSchedule {
    id: number;
    employee_id: number;
    days_json: string[];
    batch_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    trans_employees: {
      last_name: string;
      first_name: string;
      middle_name: string;
    };
  }
  
  export  interface BatchSchedule {
    shift_hours: ReactNode;
    id: number;
    name: string;
    clock_in: string;
    clock_out: string;
    break_min: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }


  export interface Schedules {
    batch: BatchSchedule[];
    emp_sched: EmployeeSchedule[]
  }
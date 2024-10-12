interface PRDate {
  id: number;
  start_date: string;
  end_date: string;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface RefBranch {
  id: number;
  name: string;
}

interface RefJobClass {
  id: number;
  name: string;
}

interface RefDepartment {
  id: number;
  name: string;
}

interface Employee {
  last_name: string;
  first_name: string;
  middle_name: string;
  prefix: string | null;
  suffix: string | null;
  extension: string | null;
  picture: string;
  email: string;
  ref_branches: RefBranch | null;
  ref_job_classes: RefJobClass;
  ref_departments: RefDepartment;
}

export interface PayrollTable {
  pr_dates: PRDate[];
  employees: Employee[];
}

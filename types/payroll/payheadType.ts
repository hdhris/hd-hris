import { UserEmployee } from "@/helper/include-emp-and-reviewr/include";

export interface AffectedJson {
  mandatory : {
    probationary : boolean;
    regular : boolean;
  }
  departments : number[];
  job_classes : number[];
  employees: number[];
}


export interface Payhead {
  calculation: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  id: number;
  is_active: boolean;
  is_overwritable: boolean;
  system_only: boolean;
  name: string;
  type: 'earning' | 'deduction';
  variable?: string;
  affected_json: AffectedJson;
}
  export interface EmployeeAffected {
    id: number;
    payhead_id: number;
    employee_id: number;
    created_at: string;
    updated_at: string;
    default_amount: number;
  }

  // Main return of the api
  export interface PayheadAffected {
    affected: EmployeeAffected[];
    employees: UserEmployee[];
    payhead: Payhead;
    departments : {
      id: number;
      name : string;
    }[],
    job_classes : {
      id : number;
      name : string;
      department_id : number;
    }[],
  }
  
  
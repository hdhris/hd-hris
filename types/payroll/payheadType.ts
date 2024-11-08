export interface AffectedJson {
  mandatory : {
    probationary : boolean;
    regular : boolean;
  }
  department : number[];
  job_classes : number[];
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
  dim_payhead_affecteds: Affected[];
}
  export interface Affected {
    id: number;
    payhead_id: number;
    employee_id: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface AffectedEmployee {
    id: number,
    picture: string;
    last_name: string;
    first_name: string;
    middle_name: string;
    ref_departments: {
      id : number;
      name : string;
    };
    ref_job_classes: {
      id : number;
      department_id: number;
      name : string;
    };
  }
  
  export interface PayheadAffected {
    affected: Affected[];
    employees: AffectedEmployee[];
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
  
  
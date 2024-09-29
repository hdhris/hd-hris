interface AffectedJson {
  status : {
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
  is_mandatory: boolean;
  name: string;
  type: 'earning' | 'deduction';
  affected_json: AffectedJson;
  dim_payhead_affecteds: Affected[];
}
  export interface Affected {
    id: number;
    payhead_id: number;
    employee_id: number;
    created_at: string; // ISO 8601 formatted date string
    updated_at: string; // ISO 8601 formatted date string
  }
  
  export interface AffectedEmployee {
    id: number,
    picture: string;
    last_name: string;
    first_name: string;
    middle_name: string;
    ref_departments: {
      name : string
    };
    ref_job_classes: {
      name : string
    };
  }
  
  export interface PayheadAffected {
    affected: Affected[];
    employees: AffectedEmployee[];
    payhead: Payhead;
  }
  
  
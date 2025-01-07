import { Evaluations } from "../leaves/leave-evaluators-types";

export type Status = "active" | "terminated" | "resigned" | "suspended";
//
export type EmployeeAll = {
  created_at: string;
  updated_at: string;
  id: number;
  prefix:string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  suffix: string;
  extension: string;
  birthdate: string;
  privilege_id: string;
  fathers_first_name?: string;
  fathers_middle_name?: string;
  fathers_last_name?: string;
  mothers_first_name?: string;
  mothers_middle_name?: string;
  mothers_last_name?: string;
  guardian_first_name?: string;
  guardian_middle_name?: string;
  guardian_last_name?: string;

  addr_region: string;
  addr_province: string;
  addr_municipal: string;
  addr_baranggay: string;
  elementary: string;
  highSchool: string;
  seniorHighSchool: string;
  seniorHighStrand: string;
  universityCollege: string;
  course: string;
  suspension_json: UnavaliableStatusJSON[];
  resignation_json: UnavaliableStatusJSON[];
  termination_json: UnavaliableStatusJSON[];
  certificates: Array<{ name: string; url: string }>;
  masters: string;
  mastersCourse: string;
  mastersYear: string;
  mastersCertificates: Array<{ name: string; url: string }>;
  doctorate: string;
  doctorateCourse: string;
  doctorateYear: string;
  doctorateCertificates: Array<{ name: string; url: string }>;
  highestDegree: string;
  hired_at: string;
  branch_id: string;
  employement_status_id: string;
  salary_grade_id: string;
  department_id: string;
  job_id: string;
  status:string;
  workSchedules: Record<string, unknown>;
  email: string;
  contact_no: string;
  picture: string;
  deleted_at: string;
  ref_job_classes: { id: number; name: string; is_superior: boolean; superior_id: number;}; // Add this line
  ref_departments: { name: string }; // Add this line
  ref_employment_status: {name: string};
  ref_addresses_trans_employees_addr_regionToref_addresses: { address_name: string, address_code: number},
  ref_addresses_trans_employees_addr_provinceToref_addresses: { address_name: string, address_code: number},
  ref_addresses_trans_employees_addr_municipalToref_addresses: { address_name: string, address_code: number},
  ref_addresses_trans_employees_addr_baranggayToref_addresses: { address_name: string, address_code: number},
  dim_schedules?: {
    end_date: any;
    days_json: string | string[];
    ref_batch_schedules?: {
      id: string | number;
    };
  }[];
  
};




interface Certificate {
  name: string;
  url: string | File;
  fileName: string;
}
// Educational Background Type


export type EmployeeEducationalBG = {
  elementary?: string;
  highSchool?: string;
  seniorHighSchool?: string;
  seniorHighStrand?: string;
  universityCollege?: string;
  course?: string;
  highestDegree?: string;
  masters?: string;
  mastersCourse?: string;
  mastersYear?: string;
  mastersCertificates?: Certificate[];
  doctorate?: string;
  doctorateCourse?: string;
  doctorateYear?: string;
  doctorateCertificates?: Certificate[];
  certificates: Certificate[];
};

// Certificates Type

export type UnavaliableStatusJSON = {
    id: number;
    incident_id?: number;
    start_date: string;
    end_date: string | null;
    reason: string | null;
    initiated_by: {
        id: number;
        name: string;
        position: string;
        picture: string;
    };
    evaluation: object; //Evaluations;
    canceled_at: string | null;
    canceled_reason: string | null;
    canceled_by: {
        id: number;
        name: string;
        position: string;
        picture: string;
    } | null;
};

export type EmployeeSuspension = {
  suspensionReason: string;
  startDate: string;
  endDate: string;
};

export type FamilyBackground = {
  fathers_first_name?: string;
  fathers_middle_name?: string;
  fathers_last_name?: string;
  mothers_first_name?: string;
  mothers_middle_name?: string;
  mothers_last_name?: string;
  guardian_first_name?: string;
  guardian_middle_name?: string;
  guardian_last_name?: string;
};

export type EmployeeTermination = {
  terminationReason: string;
  terminationDate: string;
};

export type EmployeeResignation = {
  resignationReason: string;
  resignationDate: string;
};

// Create a type for status updates
export type StatusUpdate = {
  status: Status;
  startDate?: string;
  endDate?: string;
  reason: string;
};


export type Employee = EmployeeAll & {
  suspension_json?: EmployeeSuspension | null;
  resignation_json?: EmployeeResignation | null;
  termination_json?: EmployeeTermination | null;
  educational_bg_json?: EmployeeEducationalBG | null;
  family_bg_json?: string | FamilyBackground | null; // Add this lin
};

export type EmployeePaginate = {
  data: EmployeeAll[];
  currentPage: number
  perPage: number
  totalItems: number
};


export interface EmployeeDetails {
  id: string | number;                     // Unique identifier for the employee
  name: string     // Extension (e.g., nickname), optional and can be null
  picture?: string;              // URL to the employee's picture, optional
}

export type Status = "active" | "terminated" | "resigned" | "suspended";
//
export type EmployeeAll = {
  created_at: string;
  updated_at: string;
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  suffix: string;
  extension: string;
  birthdate: string;
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
  suspension_json?: string;
  resignation_json?: string;
  termination_json?: string;
  highestDegree: string;
  certificates: Array<{ name: string; url: string }>;
  hired_at: string;
  department_id: string;
  job_id: string;
  status:string;
  workSchedules: Record<string, unknown>;
  email: string;
  contact_no: string;
  picture: string;
  is_regular:boolean;
  deleted_at: string;
  ref_job_classes: { name: string }; // Add this line
  ref_departments: { name: string }; // Add this line
  ref_addresses_trans_employees_addr_regionToref_addresses: { address_name: string, address_code: number},
  ref_addresses_trans_employees_addr_provinceToref_addresses: { address_name: string, address_code: number},
  ref_addresses_trans_employees_addr_municipalToref_addresses: { address_name: string, address_code: number},
  ref_addresses_trans_employees_addr_baranggayToref_addresses: { address_name: string, address_code: number},
  
};

// Educational Background Type
export type EmployeeEducationalBG = {
  elementary?: string;
  highSchool?: string;
  seniorHighSchool?: string;
  seniorHighStrand?: string;
  universityCollege?: string;
  course?: string;
  highestDegree?: string;
  certificates?: Certificate[];
};

// Certificates Type
export type Certificate = {
  name: string;
  issuingOrganization: string;
  issueDate: Date | string;
  expiryDate?: Date | string; // Optional, in case some certificates don't expire
};
export type EmployeeSuspension = {
  suspensionReason: string;
  startDate: string;
  endDate: string;
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

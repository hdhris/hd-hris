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
  ref_job_classes?: { name: string }; // Add this line
  ref_departments?: { name: string }; // Add this line
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
  suspensionReason: string | null;
  suspensionDate: Date | string | null;
  suspensionDuration: number | null;
};

export type EmployeeTermination = {
  terminationReason: string | null;
  terminationDate: Date | string | null;
};

export type EmployeeResignation = {
  resignationDate: Date | string | null;
  resignationReason: string | null;
};

export type Employee = EmployeeAll & {
  suspension_json?: EmployeeSuspension | null;
  resignation_json?: EmployeeResignation | null;
  termination_json?: EmployeeTermination | null;
  educational_bg_json?: EmployeeEducationalBG | null;
};


export interface EmployeeDetails {
  id: number;                     // Unique identifier for the employee
  name: string     // Extension (e.g., nickname), optional and can be null
  picture?: string;              // URL to the employee's picture, optional
}

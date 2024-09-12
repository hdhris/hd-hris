export type Status = "active" | "terminated" | "resigned" | "suspended";

export type EmployeeAll = {
  id: number;
  branchId: string | number;
  picture: string;
  firstName: string;
  middleName: string;
  lastName: string;
  age: number;
  position: string;
  department: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: "male" | "female";
  status: Status;
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



export interface EmployeeType {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
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
  highestDegree: string;
  certificates: Array<{ name: string; url: string }>;
  hired_at: string;
  department_id: string;
  job_id: string;
  workSchedules: Record<string, unknown>;
  email: string;
  contact_no: string;
  picture: string;
  suspension_json: { reason: string; date: string } | null;
  resignation_json: { reason: string; date: string } | null;
  termination_json: { reason: string; date: string } | null;
}
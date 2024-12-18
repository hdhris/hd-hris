export interface SignatoryEmployeeDetails {
    id: number;
    picture: string | null;
    email: string;
    prefix: string | null;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    job_id: number;
    departments: string
}

export interface SignatoryRole {
    id: number;
    signatory_role_name: string;
}

export interface JobClass {
    id: number;
    name: string;
}

export interface Signatory {
    job_id: number;
    order_number: number;
    is_apply_to_all_signatory: boolean;
    signatory_roles: SignatoryRole;
    job_classes: JobClass;
    employees: SignatoryEmployeeDetails[];
}

export interface SignatoryPath {
    id: number;
    signatories_path: string;
    name: string
    signatories: Signatory[];
}

export interface SignatoryRoles{
    id: number
    signatory_role_name: string
}

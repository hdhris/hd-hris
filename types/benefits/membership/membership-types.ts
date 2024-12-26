import {BenefitPlan, ContributionType} from "@/types/benefits/plans/plansTypes";

export interface EmployeeBenefitDetails {
    id: number,
    name: string;
    picture: string;
    salary_grade: number;
    department: string
    email: string
    job: string
    employment_status: string
    employee_benefits: EmployeeBenefit[];
}

export interface EmployeeBenefit {
    id: number;
    deduction_id: number,
    enrollment_date: string; // Use `Date` if deserialized as a Date object
    coverage_amount: number; // Use `number` if deserialized as a numeric value
    contribution_amount: number; // Use `number` if deserialized as a numeric value
    coverage_amount_type: Omit<ContributionType, "others">;
    benefit_plans: Pick<BenefitPlan, "id" | "name" | "type" | "effectiveDate" | "expirationDate">;
    contributions: Contribution;
    terminated_at: string
    status: "Active" | "Terminated"
}

export interface Contribution {
    id: number;
    plan_id: number;
    employee_rate: number; // Use `number` if deserialized as a numeric value
    contribution_type: string;
    actual_contribution_amount: number | null; // Use `number | null` if deserialized
    min_salary: number; // Use `number` if deserialized
    max_salary: number; // Use `number` if deserialized
}

export interface PaginatedEmployeeBenefitDetails{
    membership: EmployeeBenefitDetails[],
    total: number,
}

export interface EmployeeBenefitSelectionDetails{
    id: number,
    name: string,
    picture: string
    department: string
    job: string,
    salary: number,
    enrolled_benefits_id: number[] | null
}
export interface BenefitSelectionDetails{
    id: number,
    name: string,
    contribution_breakdown: {
        max_salary: number,
        min_salary: number
    }[]
}

export interface EmployeeEnrollmentSelection{
    employee: EmployeeBenefitSelectionDetails[]
    benefits: BenefitSelectionDetails[]
}
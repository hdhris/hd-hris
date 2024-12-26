export interface ContributionTable {
    id: number;
    min_salary: number;
    max_salary: number;
    min_MSC: number;
    max_MSC: number;
    msc_step: number;
    ec_threshold: number;
    ec_low_rate: number;
    ec_high_rate: number;
    wisp_threshold: number;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    employee_rate: number;
    employer_rate: number;
    contribution_type: string;
    actual_contribution_amount: number | null;
}

export interface BenefitsContribution {
    id: number;
    name: string;
    type: string;
    effective_date: string; // ISO date string
    expiration_date: string; // ISO date string
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    deduction_id: number;
    ref_benefits_contribution_table: ContributionTable[];
}

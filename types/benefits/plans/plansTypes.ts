
export interface BenefitAdditionalDetails {
    minSalary?: number;
    maxSalary?: number;
    minMSC?: number;
    maxMSC?: number;
    mscStep?: number;
    ecThreshold?: number;
    ecLowRate?: number;
    ecHighRate?: number;
    wispThreshold?: number;
}

export interface BenefitPlan {
    id: number;
    name: string;
    type: string;
    eligibilityCriteria: string;
    coverageDetails: string;
    employerContribution: number;
    employeeContribution: number;
    effectiveDate: string;
    expirationDate: string;
    description: string;
    isActive: boolean;
    benefitAdditionalDetails?: BenefitAdditionalDetails;
    createdAt: string;
    updatedAt: string;
}

export interface BenefitPlanPaginated{
    data: BenefitPlan[],
    totalItems: number,
    currentPage: number
}
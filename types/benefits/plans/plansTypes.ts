import {EmployeeDetails} from "@/types/employeee/EmployeeType";

export interface BenefitAdditionalDetails {
    id: number
    planId: number
    employerContribution: number;
    employeeContribution: number;
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
    effectiveDate: string;
    expirationDate: string;
    description: string;
    isActive: boolean;
    benefitAdditionalDetails?: BenefitAdditionalDetails;
    employees_avails?: EmployeeDetails[]
    createdAt: string;
    updatedAt: string;
    deduction_id: number
}

export interface BenefitPlanPaginated{
    data: BenefitPlan[],
    totalItems: number,
    currentPage: number
}
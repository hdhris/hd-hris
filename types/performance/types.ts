import { BasicEmployee, MinorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { ApprovalStatusType } from "../attendance-time/OvertimeType";
import { Evaluations } from "../leaves/leave-evaluators-types";

// Define the structure for the Rating object
export interface Rating {
    rate: number;
    description: string;
}

// Define the structure for TableRating object
export interface TableRating {
    name: string;
    weight: number;
    type: "multiple-choices" | "table";
    ratings: Rating[];
}

// Define the main interface for the given data
export interface CriteriaDetail {
    is_active: boolean;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    deleted_at: string | null; // Nullable ISO date string
    weight: number;
    type: "multiple-choices" | "table";
    id: number;
    name: string;
    description: string;
    ratings_json: Rating[] | TableRating[];
}

export interface SurveyData {
    [key: string]: {
        total: number;
        details: {
            [key: string]: number;
        };
        comments: string;
    };
}

export const phaseArray = [
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
    "ninth",
    "tenth",
    "eleventh",
    "twelfth",
] as const;

// Reuse as a Type
export type PhaseType = (typeof phaseArray)[number];

export interface SurveyFormType {
    id: number;
    employee_id: number;
    start_date: string;
    end_date: string;
    total_rating: string;
    max_rate: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    evaluated_by: number;
    status: ApprovalStatusType | null;
    criteria_json: CriteriaDetail[];
    ratings_json: SurveyData;
    employment_status: number;
    evaluator: Evaluations;
    phase: PhaseType;
    compentencies_json: Compentencies[];
    development_plan_json: {
        id: number;
        label: string;
        value: string;
    }[];
    trans_employees: BasicEmployee;
    trans_employees_fact_performance_evaluations_evaluated_byTotrans_employees: MinorEmployee;
}

export interface Compentencies {
    id: number;
    criteria: string;
    rating: string;
    remarks: string;
}
import { Parser } from "expr-eval";
const parser = new Parser();

export const static_formula = {
    cash_advance_disbursement: "get_disbursement",
    cash_advance_repayment: "get_repayment",
    tardiness: "get_tardiness",
    benefit_contribution: "get_contribution",
};

export type BaseValueProp = {
    rate_p_hr: number;
    total_shft_hr: number;
    payroll_days: number;
    basic_salary: number;
    [key: string]: number;
};

export type VariableAmountProp = {
    link_id?: number;
    payhead_id: number | null;
    variable: string;
    amount: number;
};

export type VariableFormulaProp = {
    link_id?: number;
    payhead_id: number | null;
    variable: string;
    function?: Function;
    formula: string;
};

// Function to calculate all payheads
export function calculateAllPayheads(
    baseVariablesAmounts: BaseValueProp,
    unCalculateAmount: VariableFormulaProp[],
    surpressErrorMsg: boolean = false
): VariableAmountProp[] {
    const sqrt = Math.sqrt;
    const abs = Math.abs;
    let calculatedAmount: VariableAmountProp[] = [];
    let isError = false;

    // Convert baseVariables to the format with null ids
    const baseVariables = Object.entries(baseVariablesAmounts).map(([variable, amount]) => ({
        id: null,
        variable,
        amount,
    }));

    const sanitizeFormula = (formula: string) => {
        return formula
            .replaceAll("√", "sqrt") // square root
            .replaceAll("x", "*"); // multiplication
    };

    unCalculateAmount.forEach((ua) => {
        const variables = [...baseVariables, ...calculatedAmount];

        // console.log(variables);
        // console.log(unCalculateAmount);
        const newVar: VariableAmountProp = {
            link_id: ua.link_id,
            payhead_id: ua.payhead_id,
            variable: ua.variable,
            amount: (() => {
                try {
                    return parser.evaluate(
                        sanitizeFormula(ua.formula),
                        variables.reduce((acc, { variable, amount }) => {
                            acc[variable] = amount; // Set the variable name as the key and amount as the value
                            return acc; // Return the accumulator for the next iteration
                        }, {} as Record<string, number>) // Type assertion for the accumulator
                    );
                } catch (error) {
                    if (!surpressErrorMsg) console.error(error, ua.payhead_id);
                    isError = true;
                    return 0;
                }
            })(),
        };

        calculatedAmount.push(newVar);
    });

    return !isError ? calculatedAmount : [];
}

import { advanceCalculator } from "../benefits-calculator/advance-calculator";
import { basicCalculator } from "../benefits-calculator/basic-calculator";
import { Decimal } from "@prisma/client/runtime/library";
import { AttendaceStatuses, BatchSchedule, EmployeeSchedule } from "@/types/attendance-time/AttendanceTypes";
import { toGMT8 } from "@/lib/utils/toGMT8";
import {ContributionType} from "@/types/benefits/plans/plansTypes";

// Type definition for benefit data
export interface ContributionSetting {
    id: number;
    deduction_id: number;
    name: string;
    ref_benefits_contribution_table?: {
        employee_rate: number;
        employer_rate: number;
        min_salary: number;
        max_salary: number;
        min_MSC: number;
        max_MSC: number;
        msc_step: number;
        ec_threshold: number;
        ec_low_rate: number;
        ec_high_rate: number;
        wisp_threshold: number;
        actual_contribution_amount: number
        contribution_type: ContributionType;
    }[];
}

// Define Benefit class
export class Benefit {
    private data: ContributionSetting;

    constructor(data: ContributionSetting) {
        this.data = data;
    }

    // Method to calculate the contribution based on salary
    public getContribution(salary: number): number {
        try {
            let contribution = 0;

            const contributionTable = this.data.ref_benefits_contribution_table;

            contributionTable?.forEach((table) => {
                if (table.min_salary <= salary && table.max_salary >= salary) {
                    const rates = {
                        minSalary: table.min_salary,
                        maxSalary: table.max_salary,
                        minMSC: table.min_MSC,
                        maxMSC: table.max_MSC,
                        mscStep: table.msc_step,
                        regularEmployeeRate: table.employee_rate,
                        regularEmployerRate: table.employer_rate,
                        ecThreshold: table.ec_threshold,
                        ecLowRate: table.ec_low_rate,
                        ecHighRate: table.ec_high_rate,
                        wispThreshold: table.wisp_threshold,
                    };

                    if(table.contribution_type === "others"){
                        if (!table.min_MSC) {
                            const basic = basicCalculator(salary, table.employer_rate, table.employee_rate);
                            // console.log("Name: ", this.data.name, " Basic Calc: ", basic);
                            contribution = basic.employee_contribution; //+ basic.employer_contribution;
                        } else {
                            contribution =
                                advanceCalculator(salary, rates).employeeShare +
                                (advanceCalculator(salary, rates).wispEmployee ?? 0);
                        }
                    } else if(table.contribution_type === "percentage"){
                        contribution = salary * (table.actual_contribution_amount / 100);
                    } else {
                        contribution = table.actual_contribution_amount
                    }

                }
            });

            return contribution;
        } catch (error) {
            console.error(error);
            return 0;
        }
    }
}

export function getUndertimeTotal(
    logStatus: Record<string, AttendaceStatuses>,
    empID: number,
    timeSchedule: EmployeeSchedule | null,
    startDate: string,
    endDate: string
): number {
    if (!timeSchedule) {
        console.log("No shift found for emp: ", empID);
        return 0;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    let totalAmount = 0;

    for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
        const dateString = current.toISOString().split("T")[0]; // Convert to "YYYY-MM-DD" format

        if (logStatus[dateString] && logStatus[dateString][empID]) {
            totalAmount += logStatus[dateString][empID]?.renderedUndertime!; //|| factShiftLength;
        }
    }

    return totalAmount;
}

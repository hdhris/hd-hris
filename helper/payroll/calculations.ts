import {Parser} from "expr-eval";
import {advanceCalculator} from "../benefits-calculator/advance-calculator";
import {basicCalculator} from "../benefits-calculator/basic-calculator";
import {AttendaceStatuses} from "@/types/attendance-time/AttendanceTypes";
import {ContributionType} from "@/types/benefits/plans/plansTypes";

const parser = new Parser();

export const static_formula = {
    basic_salary: "get_basic_salary",
    cash_advance_disbursement: "get_disbursement",
    cash_advance_repayment: "get_repayment",
    tardiness: "get_tardiness",
    leaves: "get_leaves",
    overtimes: "get_overtimes",
    unhired: "get_unhired",
    benefit_contribution: "get_contribution",
    payable: "get_incident",
};

export type BaseValueProp = {
    rate_p_hr: number; total_shft_hr: number; payroll_days: number; basic_salary: number; [key: string]: number;
};

export type VariableAmountProp = {
    link_id?: number; payhead_id: number | null; variable: string; amount: number;
};

export type VariableFormulaProp = {
    link_id?: number; payhead_id: number | null; variable: string; function?: Function; formula: string;
};

// Function to calculate all payheads
export function calculateAllPayheads(baseVariablesAmounts: BaseValueProp, unCalculateAmount: VariableFormulaProp[], surpressErrorMsg: boolean = false): VariableAmountProp[] {
    const sqrt = Math.sqrt;
    const abs = Math.abs;
    let calculatedAmount: VariableAmountProp[] = [];
    let isError = false;

    // Convert baseVariables to the format with null ids
    const baseVariables = Object.entries(baseVariablesAmounts).map(([variable, amount]) => ({
        id: null, variable, amount,
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
            link_id: ua.link_id, payhead_id: ua.payhead_id, variable: ua.variable, amount: (() => {
                try {
                    return parser.evaluate(sanitizeFormula(ua.formula), variables.reduce((acc, {variable, amount}) => {
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
        actual_contribution_amount: number;
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
                // console.log({table})
                if (Number(table.min_salary) <= salary && Number(table.max_salary) >= salary) {
                    const rates = {
                        minSalary: Number(table.min_salary),
                        maxSalary: Number(table.max_salary),
                        minMSC: Number(table.min_MSC),
                        maxMSC: Number(table.max_MSC),
                        mscStep: Number(table.msc_step),
                        regularEmployeeRate: Number(table.employee_rate),
                        regularEmployerRate: Number(table.employer_rate),
                        ecThreshold: Number(table.ec_threshold),
                        ecLowRate: Number(table.ec_low_rate),
                        ecHighRate: Number(table.ec_high_rate),
                        wispThreshold: Number(table.wisp_threshold),
                    };
                    // console.log({rates})

                    if (table.contribution_type === "others") {
                        // console.log({salary})
                        if (!rates.minMSC) {
                            const basic = basicCalculator(salary, rates.regularEmployerRate, rates.regularEmployeeRate);
                            // console.log("Name: ", this.data.name, " Basic Calc: ", basic);
                            contribution = basic.employee_contribution; //+ basic.employer_contribution;
                        } else {
                            // console.log({calc: advanceCalculator(salary, rates)})
                            contribution = advanceCalculator(salary, rates).employeeShare + (advanceCalculator(salary, rates).wispEmployee ?? 0);
                        }
                        // console.log({contribution})
                    } else if (table.contribution_type === "percentage") {
                        contribution = salary * (Number(table.actual_contribution_amount) / 100);
                    } else {
                        contribution = Number(table.actual_contribution_amount);
                    }
                }
            });

            return contribution;
        } catch (error) {
            console.error(error);
            return 0;
        }
    }

    public getBreakdown(salary: number) {
        try {
            const contributionTable = this.data.ref_benefits_contribution_table;

            let breackdown
            // console.log({salary})
            // return "Table: " + JSON.stringify(contributionTable)
            contributionTable?.forEach((table) => {

                const condition = Number(table.min_salary) <= salary && Number(table.max_salary) >= salary
                // console.log({salary, min: table.min_salary, max: table.max_salary, condition});
                if (Number(table.min_salary) <= salary && Number(table.max_salary) >= salary) {
                    const rates = {
                        minSalary: Number(table.min_salary),
                        maxSalary: Number(table.max_salary),
                        minMSC: Number(table.min_MSC),
                        maxMSC: Number(table.max_MSC),
                        mscStep: Number(table.msc_step),
                        regularEmployeeRate: Number(table.employee_rate),
                        regularEmployerRate: Number(table.employer_rate),
                        ecThreshold: Number(table.ec_threshold),
                        ecLowRate: Number(table.ec_low_rate),
                        ecHighRate: Number(table.ec_high_rate),
                        wispThreshold: Number(table.wisp_threshold),
                    };
                    // console.log({rates})

                    if (table.contribution_type === "others") {
                        // console.log({salary})
                        if (rates.minMSC) {
                            breackdown = advanceCalculator(salary, rates)
                        } else {
                            breackdown = "No MSC"
                        }
                        // console.log({contribution})
                    } else {
                        breackdown = "Not Others"
                    }
                }
            });

            return breackdown;
        } catch (error) {
            console.error(error);
            return 0;
        }
    }

}

export function getUndertimeTotal(logStatus: Record<string, AttendaceStatuses>, empID: number, startDate: string, endDate: string): number {
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

export function getAttendanceTotal({
                                       logStatus, employeeID, startDate, endDate,
                                   }: {
    logStatus: Record<string, AttendaceStatuses>; employeeID: number; startDate: string; endDate: string;
}) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let deductedUndertime = 0;
    let deductedUnhired = 0;
    let paidOvertimes = 0;
    let paidLeaves = 0;

    for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
        const dateString = current.toISOString().split("T")[0];
        const logByDate = logStatus[dateString];
        if (logByDate && logByDate[employeeID]) {
            deductedUndertime += logByDate[employeeID].deductedUndertime ?? 0;
            deductedUnhired += logByDate[employeeID].deductedUnhired ?? 0;
            paidOvertimes += logByDate[employeeID].paidOvertime ?? 0;
            paidLeaves += logByDate[employeeID].paidLeave ?? 0;
        }
    }

    return {
        deductedUndertime, deductedUnhired, paidOvertimes, paidLeaves,
    };
}

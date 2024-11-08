import { Parser } from "expr-eval";
const parser = new Parser();

export type BaseValueProp = {
  rate_p_hr: number;
  total_shft_hr: number;
  payroll_days: number;
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
  surpressErrorMsg: boolean = false,
): VariableAmountProp[] {
  try {
    let calculatedAmount: VariableAmountProp[] = [];

    // Convert baseVariables to the format with null ids
    const baseVariables = Object.entries(baseVariablesAmounts).map(([variable, amount]) => ({
      id: null,
      variable,
      amount,
    }));
  
    unCalculateAmount.forEach(ua=>{
      const variables = [...baseVariables, ...calculatedAmount]
  
      // console.log(variables);
      // console.log(unCalculateAmount);
      const newVar : VariableAmountProp = {
        link_id: ua.link_id,
        payhead_id: ua.payhead_id,
        variable: ua.variable,
        amount: parser.evaluate(
          ua.formula,
          variables.reduce((acc, { variable, amount }) => {
            acc[variable] = amount ; // Set the variable name as the key and amount as the value
            return acc; // Return the accumulator for the next iteration
          }, {} as Record<string, number>) // Type assertion for the accumulator
        )
      }
  
      calculatedAmount.push(newVar);
    });
  
    return calculatedAmount;
  } catch(error) {
    if(!surpressErrorMsg) console.error(error);
    return []
  }
}




import { advanceCalculator } from "../benefits-calculator/advance-calculator";
import { basicCalculator } from "../benefits-calculator/basic-calculator";
import { Decimal } from "@prisma/client/runtime/library";

// Type definition for benefit data
export interface ContributionSetting {
  id: number;
  deduction_id: number;
  name: string;
  employee_contribution: Decimal;
  employer_contribution: Decimal;
  ref_benefits_contribution_advance_settings?: {
    min_salary: Decimal;
    max_salary: Decimal;
    min_MSC: Decimal;
    max_MSC: Decimal;
    msc_step: Decimal;
    ec_threshold: Decimal;
    ec_low_rate: Decimal;
    ec_high_rate: Decimal;
    wisp_threshold: Decimal;
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
      let contribution: number;

      if (
        this.data.ref_benefits_contribution_advance_settings &&
        this.data.ref_benefits_contribution_advance_settings.length > 0
      ) {
        const advanceRates = this.data.ref_benefits_contribution_advance_settings[0];

        const rates = {
          minSalary: advanceRates.min_salary.toNumber(),
          maxSalary: advanceRates.max_salary.toNumber(),
          minMSC: advanceRates.min_MSC.toNumber(),
          maxMSC: advanceRates.max_MSC.toNumber(),
          mscStep: advanceRates.msc_step.toNumber(),
          regularEmployeeRate: this.data.employee_contribution.toNumber(),
          regularEmployerRate: this.data.employer_contribution.toNumber(),
          ecThreshold: advanceRates.ec_threshold.toNumber(),
          ecLowRate: advanceRates.ec_low_rate.toNumber(),
          ecHighRate: advanceRates.ec_high_rate.toNumber(),
          wispThreshold: advanceRates.wisp_threshold.toNumber(),
        };

        contribution = advanceCalculator(salary, rates).total;
      } else {
        const basic = basicCalculator(
          salary,
          this.data.employer_contribution.toNumber(),
          this.data.employee_contribution.toNumber()
        );
        contribution = basic.employee_contribution + basic.employer_contribution;
      }

      return contribution;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }
}
import { Parser } from "expr-eval";
const parser = new Parser();

export const static_formula = {
  cash_advance_disbursement : 'get_disbursement',
  cash_advance_repayment : 'get_repayment',
  tardiness : 'get_tardiness',
  benefit_contribution : 'get_contribution',
} 

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
  surpressErrorMsg: boolean = false,
): VariableAmountProp[] {
  let calculatedAmount: VariableAmountProp[] = [];
  let isError = false;

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
        amount: (()=>{
          try {
            return parser.evaluate(
              ua.formula,
              variables.reduce((acc, { variable, amount }) => {
                acc[variable] = amount ; // Set the variable name as the key and amount as the value
                return acc; // Return the accumulator for the next iteration
              }, {} as Record<string, number>) // Type assertion for the accumulator
            )
          } catch(error) {
            if(!surpressErrorMsg) console.error(error,ua.payhead_id);
            isError = true;
            return 0;
          }
        })()
      }
  
      calculatedAmount.push(newVar);
    });
  
    return !isError ? calculatedAmount : [];
}




import { advanceCalculator } from "../benefits-calculator/advance-calculator";
import { basicCalculator } from "../benefits-calculator/basic-calculator";
import { Decimal } from "@prisma/client/runtime/library";
import { AttendaceStatuses, BatchSchedule } from "@/types/attendance-time/AttendanceTypes";
import { toGMT8 } from "@/lib/utils/toGMT8";

// Type definition for benefit data
export interface ContributionSetting {
  id: number;
  deduction_id: number;
  name: string;
  employee_contribution: number;
  employer_contribution: number;
  ref_benefits_contribution_advance_settings?: {
    min_salary: number;
    max_salary: number;
    min_MSC: number;
    max_MSC: number;
    msc_step: number;
    ec_threshold: number;
    ec_low_rate: number;
    ec_high_rate: number;
    wisp_threshold: number;
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
          minSalary: advanceRates.min_salary,
          maxSalary: advanceRates.max_salary,
          minMSC: advanceRates.min_MSC,
          maxMSC: advanceRates.max_MSC,
          mscStep: advanceRates.msc_step,
          regularEmployeeRate: this.data.employee_contribution,
          regularEmployerRate: this.data.employer_contribution,
          ecThreshold: advanceRates.ec_threshold,
          ecLowRate: advanceRates.ec_low_rate,
          ecHighRate: advanceRates.ec_high_rate,
          wispThreshold: advanceRates.wisp_threshold,
        };

        // console.log("Name: ", this.data.name, " Calc: ", advanceCalculator(salary, rates))
        contribution = advanceCalculator(salary, rates).employeeShare + (advanceCalculator(salary, rates).wispEmployee ?? 0);
      } else {
        const basic = basicCalculator(
          salary,
          this.data.employer_contribution,
          this.data.employee_contribution
        );
        // console.log("Name: ", this.data.name, " Basic Calc: ", basic)
        contribution = basic.employee_contribution //+ basic.employer_contribution;
      }

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
  timeSchedule: BatchSchedule | null,
  startDate: string,
  endDate: string
): number {
  if(!timeSchedule){
    console.log("No shift found for emp: ",empID);
    return 0;
  };
  // const factShiftLength = toGMT8(timeSchedule.clock_out!).diff(toGMT8(timeSchedule.clock_in!), "minute") - timeSchedule.break_min!;
  // console.log("Emp: ", empID, "ShiftLength: ", factShiftLength);
  const start = new Date(startDate);
  const end = new Date(endDate);
  let totalAmount = 0;

  for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
    const dateString = current.toISOString().split("T")[0]; // Convert to "YYYY-MM-DD" format

    if (logStatus[dateString] && logStatus[dateString][empID]) {
      totalAmount += logStatus[dateString][empID]?.undertime! //|| factShiftLength;
    } 
    // else {
    //   totalAmount += factShiftLength;
    // }
  }

  return totalAmount;
};
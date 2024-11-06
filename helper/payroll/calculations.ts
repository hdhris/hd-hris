import { Parser } from "expr-eval";
const parser = new Parser();

export type BaseValueProp = {
  rate_p_hr: number;
  total_shft_hr: number;
  payroll_days: number;
  [key: string]: number;
};

export type VariableAmountProp = {
  id: number | null;
  variable: string;
  amount: number;
};

export type VariableFormulaProp = {
  id: number;
  variable: string;
  formula: string;
};

// Function to calculate all payheads
export function calculateAllPayheads(
  baseVariablesAmounts: BaseValueProp,
  unCalculateAmount: VariableFormulaProp[]
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
        id: ua.id,
        variable: ua.variable,
        amount: parser.evaluate(
          ua.formula,
          variables.reduce((acc, { variable, amount }) => {
            acc[variable] = amount; // Set the variable name as the key and amount as the value
            return acc; // Return the accumulator for the next iteration
          }, {} as Record<string, number>) // Type assertion for the accumulator
        )
      }
  
      calculatedAmount.push(newVar);
    });
  
    return calculatedAmount;
  } catch(error) {
    console.error(error)
    return []
  }
}

// Example usage
// const baseVariables: BaseValueProp = {
//   rate_per_hour: 50,
//   total_shft_hr: 8,
//   // number_of_days: 7,
// };

// const calculateAmount: VariableFormulaProp[] = [
//   { id: 1, variable: "basic_salary", formula: "rate_per_hour * shift_length * number_of_days" },
//   { id: 2, variable: "sss_insurance", formula: "basic_salary * 0.10" },
//   { id: 3, variable: "total_salary", formula: "basic_salary - sss_insurance" },
// ];

// const calculatedAmount = calculateAllPayheads(baseVariables, calculateAmount);

// console.log(calculatedAmount);
// Expected Output: [
//   { id: null, variable: 'rate_per_hour', amount: 50 },
//   { id: null, variable: 'shift_length', amount: 8 },
//   { id: null, variable: 'number_of_days', amount: 7 },
//   { id: 1, variable: 'basic_salary', amount: 2800 },
//   { id: 2, variable: 'sss_insurance', amount: 280 },
//   { id: 3, variable: 'total_salary', amount: 2520 }
// ]

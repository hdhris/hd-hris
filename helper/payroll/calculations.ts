import { Parser } from "expr-eval";
const parser = new Parser();
function getCalculation({
  ...props
}: {
  formula: string;
  rate_per_hour: number;
  shift_length: number;
  number_of_days: number;
}) {
  const rate_per_hour = 50; // Php
  const shift_length = 8
  const number_of_days = 30;
  
  const variables = {
    basic_salary: rate_per_hour * shift_length * number_of_days,
  };
  return parser.evaluate("basic_salary * .2", variables); // returns 2000
}

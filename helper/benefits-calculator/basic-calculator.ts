export const basicCalculator = (monthlySalary: number, employerRate: number, employeeRate: number) => {

    const employer_contribution = monthlySalary * employerRate / 100
    const employee_contribution = monthlySalary * employeeRate / 100

    return{
        employee_contribution,
        employer_contribution
    }
}
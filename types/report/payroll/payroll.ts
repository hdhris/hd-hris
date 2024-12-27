export interface EmployeePayroll{
    id: number
    name: string,
    department: string
    job: string
}

export interface PayrollsReport{
    id: number
    employee_id: number,
    gross_total_amount: number | null
    deduction_total_amount: number | null
    date_id: number
}

export interface PayrollBreakdownReport{
    payroll_id: number
    payhead_id: number
    amount: number
    id: number
}

export interface PayrollEarningsReport {
    id: number
    name: string
    type: string
}

export interface PayrollDeductionReport{
    id: number
    name: string
    type: string
}

export interface PayrollReports {
    employees: EmployeePayroll[],
    payroll: PayrollsReport[]
    breakdown: PayrollBreakdownReport[]
    earnings: PayrollEarningsReport[]
    deductions: PayrollDeductionReport[]
}
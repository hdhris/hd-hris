export interface EmployeesKPI {
    total_employees: number,
    newly_hired_employees: number,
    left_employees: number
}

export interface PayrollKPI {
    month: number
    year: string
    payroll_date: string
    payroll_frequency: string
    gross_total_amount: string | number
    deduction_total_amount: string | number
    net_salary: number
}

export interface DashboardKpis {
    employees_kpi: EmployeesKPI,
    leave_pending: number,
    payroll: PayrollKPI[]
}
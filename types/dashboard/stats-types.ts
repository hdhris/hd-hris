export interface NewlyHiredEmployees{
    employee_length: number;
    firstHalfCount: number;
    secondHalfCount: number;
    status: "increment" | "decrement" | "no change";
    percentageChange: string;
}

export interface DashboardDate{
    employeesData: NewlyHiredEmployees
}
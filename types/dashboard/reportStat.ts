import {LeaveList} from "@/types/dashboard/leaveLists";
import {TopDepartmentList, TopEmployeeList} from "@/types/dashboard/topLists";

export interface MonthlySalary {
    year: number;
    month: number;
    deduction: number;
    earnings: number;
}

export interface LeaveCountType {
    leave_type_name: string;
    leave_count: string;
}

export interface Leaves {
    name: string;
    count: number
}

export interface SalaryChartData {
    category: string[],
    deductions: number[],
    earnings: number[],
}

// export interface LeaveRequests{
//     name: string,
//     picture: string,
//     email: string,
//     date_requested: string,
// }
//
export interface TopEmployees {
    first_name: string
    last_name: string
    middle_name: string
    net_salary: number
    picture: string
    start_date: string
    suffix: string
    email:string
}
export interface TopDepartments {
    department_name: string,
    color?: string,
    total_net: number
}


export interface SubHeadingStat{
    month: string,
    count: number
}
export interface SalaryStat{
    month: string,
    net_income: number
}

export interface ApiResponse {
    // totalSalary: number;

    empCount: number[],
    salCount: number[],
    leaveCount: number[],
    absenceCount: number[],
    topEmployees: TopEmployeeList[];
    topDepartments?: TopDepartmentList[]
    leaveRequests: LeaveList[]
    totalEmployees: number;
    totalAbsences: number;
    monthlySalaries: MonthlySalary[];
    leaveCountType: Leaves[];
}

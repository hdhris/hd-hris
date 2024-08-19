import fetcher from "@/services/fetcher";
import useSWR from "swr";
import {ApiResponse} from "@/types/dashboard/reportStat";
import {Employee} from "@/types/employeee/EmployeeType";
import {Signatory} from "@/types/audit/types";
// import {Stats} from "@/types/dashboard";
// import {ActiveUsers} from "@/types/activeUsers";
// import {Employee} from "@/app/admin/employee/list/types/employeeList";
// import {DepartmentInfo} from "@/app/admin/employee/department/types/department";
// import {FilteredItemProps} from "@/components/tabledata/default_config/default_config";
// import {PayheadCategory} from "@/app/api/admin/payroll/payheads/route";
// import {Payroll} from "@/app/admin/payroll/payslips/config/config";
// import {Attendance} from "@/app/api/admin/attendance/records/[date]/route";

export function useDashboard() {
    return useSWR<ApiResponse>('/api/admin/dashboard', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}
export function useEmployees() {
    return useSWR<Employee[]>('/api/admin/employees', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useAudit() {
    return useSWR<Signatory[]>('/api/audit/signatories', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}


//
// export function useActiveUsers() {
//     return useSWR<ActiveUsers[]>('/api/admin/active/users', fetcher, {
//         revalidateOnFocus: false, refreshInterval: 1000
//     })
// }
//
// export function useUsers() {
//     return useSWR<Employee[]>('/api/admin/employee/lists', fetcher, {
//         revalidateOnFocus: false, refreshInterval: 1000
//     })
// }
//
// export function useUserFilter() {
//     return useSWR<FilteredItemProps[]>('/api/admin/employee/filter', fetcher, {
//         revalidateOnFocus: false, refreshInterval: 1000
//     })
// }
//
// export function useDepartments() {
//     return useSWR<DepartmentInfo[]>('/api/admin/employee/department', fetcher, {
//         revalidateOnFocus: false, refreshInterval: 1000
//     })
// }
//
// export function usePayheads() {
//     return useSWR<PayheadCategory[]>('/api/admin/payroll/payheads', fetcher, {
//         revalidateOnFocus: false, refreshInterval: 1000
//     })
// }
//
// export function usePayslips() {
//     return useSWR<Payroll[]>('/api/admin/payroll/payslip', fetcher, {
//         revalidateOnFocus: false, refreshInterval: 1000
//     })
// }
//
// export function useAttendanceRecords(date: Date) {
//     const searchDate = date.toLocaleDateString().replaceAll('/', '-');
//     return useSWR<Attendance[]>(`/api/admin/attendance/records/${searchDate}`, fetcher, {
//         revalidateOnFocus: false, refreshInterval: 1000
//     })
// }
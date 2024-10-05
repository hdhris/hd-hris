import fetcher from "@/services/fetcher";
import useSWR from "swr";
import {ApiResponse} from "@/types/dashboard/reportStat";
import {Employee} from "@/types/employeee/EmployeeType";
import {Signatory} from "@/types/audit/types";
import {BackupEntry, Integrations, LoginActivity, UserProfile} from "@/types/routes/default/types";
import { Department } from "@/types/employeee/DepartmentType";
import { Schedules } from "@/types/attendance-time/AttendanceTypes";
import { Payhead, PayheadAffected } from "@/types/payroll/payrollType";
import {EmployeeLeavesStatus} from "@/types/leaves/LeaveRequestTypes";
import { OvertimeEntry, OvertimeResponse } from "@/types/attendance-time/OvertimeType";

export function useDashboard() {
    return useSWR<ApiResponse>('/api/admin/dashboard', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useEmployeesLeaveStatus() {
    return useSWR<EmployeeLeavesStatus>('/api/admin/leaves/employees-leaves-status', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

// export function useEmployeesLeaveStatus() {
//     const { data, error } = useSWR<EmployeeLeavesStatus>(
//         "/api/admin/leaves/employees-leaves-status",
//         fetcher,
//         {
//             revalidateOnFocus: true,
//             refreshInterval: 3000
//         }
//     );
//
//     console.log("Data: ", data);
//     console.log("Error: ", error);
//
//     if (error) return { error };
//     if (!data) return { loading: true }; // Return loading state
//
//     return data; // Return the actual data
// }

export function useAudit() {
    return useSWR<Signatory[]>('/api/admin/audit/signatories', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useIntegrations() {
    return useSWR<Integrations[]>('/api/admin/apps', fetcher, {
        revalidateOnFocus: true
    })
}

export function useUser() {
    return useSWR<UserProfile>('/api/admin/profile', fetcher, {
        revalidateOnFocus: true
    })
}
export function useLoginActivity() {
    return useSWR<LoginActivity[]>('/api/admin/security', fetcher, {
        revalidateOnFocus: true
    })
}

export function useBackupLogs() {
    return useSWR<BackupEntry[]>('/api/admin/backup/backup-logs', fetcher, {
        revalidateOnFocus: true
    })
}

export function useEmployeesData() {
    return useSWR<Employee[]>('/api/employeemanagement/employees-leaves-status', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useDepartmentsData() {
    return useSWR<Department[]>('/api/employeemanagement/department', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useJobpositionData() {
    return useSWR<Department[]>('/api/employeemanagement/jobposition', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useSchedule() {
    return useSWR<Schedules>('/api/admin/attendance-time/schedule', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function usePayheads(type: string) {
    return useSWR<Payhead[]>(`/api/admin/payroll/payhead?type=${type}`, fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useNewPayhead() {
    return useSWR<PayheadAffected>('/api/admin/payroll/payhead/read', fetcher, {
        revalidateOnFocus: false
    })
}

export function useOvertimes(){
    return useSWR<OvertimeEntry[]>('/api/admin/attendance-time/overtime', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useNewOvertimes(){
    return useSWR<OvertimeResponse>('/api/admin/attendance-time/overtime/read', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useLeaveRequest(){
    return useSWR<LeaveRequest[]>('/api/admin/leaves/requests', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useLeaveTypes(){
    return useSWR<LeaveTypesItems[]>('/api/admin/leaves/leave-types', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}
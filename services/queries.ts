import fetcher from "@/services/fetcher";
import useSWR from "swr";
import {ApiResponse} from "@/types/dashboard/reportStat";
import {Employee} from "@/types/employeee/EmployeeType";
import {Signatory} from "@/types/audit/types";
import {BackupEntry, Integrations, LoginActivity, UserProfile} from "@/types/routes/default/types";
import { Department } from "@/types/employeee/DepartmentType";
import { Schedules } from "@/types/attendance-time/AttendanceTypes";
import { Payhead } from "@/types/payroll/payrollType";

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
    return useSWR<Employee[]>('/api/employeemanagement/employees', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useDepartmentsData() {
    return useSWR<Department[]>('/api/employeemanagement/department', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useSchedule() {
    return useSWR<Schedules>('/api/admin/attendance-time/schedule', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useEarnings() {
    return useSWR<Payhead[]>('/api/admin/payroll/earnings', fetcher, {
        revalidateOnFocus: false, refreshInterval: 5000
    })
}
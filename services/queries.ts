import prisma from "@/prisma/prisma";
import fetcher from "@/services/fetcher";
import useSWR, {SWRConfiguration} from "swr";
import {Signatory} from "@/types/audit/types";
import {Branch} from "@/types/employeee/BranchType";
import {JobPosition} from "@/types/employeee/JobType";
import {Accounts} from "@/types/employeee/AccountType";
import {Employee} from "@/types/employeee/EmployeeType";
import {SalaryGrade} from "@/types/employeee/SalaryType";
import {JobTypes} from "@/types/signatory/job/job-types";
import {ApiResponse} from "@/types/dashboard/reportStat";
import {Department} from "@/types/employeee/DepartmentType";
import {DepartmentName} from "@/types/departments/department-types";
import {Payhead, PayheadAffected} from "@/types/payroll/payheadType";
import {BatchSchedule} from "@/types/attendance-time/AttendanceTypes";
import {EmploymentStatus} from "@/types/employeee/EmploymentStatusType";
import {SystemNotification} from "@/types/notifications/notification-types";
import {SignatoryPath, SignatoryRoles} from "@/types/signatory/signatory-types";
import {EmployeeLeaveCreditFormSetup} from "@/types/leaves/leave-credits-types";
import {EmploymentStatusDetails} from "@/types/employment-status/employment-status";
import {BackupEntry, Integrations, LoginActivity, UserProfile} from "@/types/routes/default/types";
import {EmployeeLeavesStatus, LeaveRequest, LeaveTypesItems} from "@/types/leaves/LeaveRequestTypes";
import {EmployeeEnrollmentSelection, PaginatedEmployeeBenefitDetails} from "@/types/benefits/membership/membership-types";
import {PayrollReports} from "@/types/report/payroll/payroll";
import {DashboardKpis} from "@/types/dashboard/stats-types";

export function useDashboard() {
    return useSWR<DashboardKpis>(`/api/admin/dashboard`, fetcher, {
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
        refreshInterval: 10000
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
        // revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useEmployeeData(id: string | null) {
    return useSWR<Employee & Accounts>(id ? `/api/employeemanagement/employees?id=${id}` : null, fetcher);
}

export function useSuspendedEmployees() {
    return useSWR<Employee[]>('/api/employeemanagement/suspended', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useFormerEmployees() {
    return useSWR<Employee[]>('/api/employeemanagement/resigned-terminated', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function usePrivilegesData() {
    return useSWR<Privilege[]>('/api/employeemanagement/privileges', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useDepartmentsData() {
    return useSWR<Department[]>('/api/employeemanagement/department', fetcher, {//
       
        revalidateOnFocus: true,
        refreshInterval: 5000, // Refresh every 5 seconds
    })
}

export function useJobpositionData() {
    return useSWR<JobPosition[]>('/api/employeemanagement/jobposition', fetcher, {//
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useSalaryGradeData() {
    return useSWR<SalaryGrade[]>('/api/employeemanagement/salarygrade', fetcher, {//
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useEmploymentStatusData() {
    return useSWR<EmploymentStatus[]>('/api/employeemanagement/employmentstatus', fetcher, {//
        // revalidateOnFocus: false, refreshInterval: 3000
    })
}


export function useBranchesData() {
    return useSWR<Branch[]>('/api/employeemanagement/branch', fetcher, {//
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useBatchSchedules() {
    return useSWR<BatchSchedule[]>('/api/employeemanagement/batch_schedules', fetcher, {//
        // revalidateOnFocus: false, refreshInterval: 3000
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

////////////////////////////////////////////////////////////////////////////////////////
type ArgumentsTuple = readonly [any, ...unknown[]];
type Arguments = string | ArgumentsTuple | Record<any, any> | null | undefined | false;
type Key = Arguments | (() => Arguments);

////////////////////////////////////////////////////////////////////////////////////////

export function useQuery<T>(key: Key, options?: SWRConfiguration<T>) {
    return useSWR<T>(key, fetcher, {
        ...options
    });
}

export function useLeaveRequest() {
    return useSWR<LeaveRequest[]>('/api/admin/leaves/requests', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useLeaveTypes() {
    return useSWR<LeaveTypesItems[]>('/api/admin/leaves/leave-types', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}

export function useEmploymentStatus() {
    return useSWR('/api/admin/leaves/leave-types/get-employement-status', fetcher, {
        revalidateOnFocus: true
    })
}

export function useLeaveCreditEmployees() {
    return useSWR<EmployeeLeaveCreditFormSetup>('/api/admin/leaves/leave-credit/employee-leave-credits-status', fetcher, {
        revalidateOnFocus: true, keepPreviousData: true, refreshInterval: 3000
    })
}

export function usePaginateQuery<T>(api: string, page: number, limit: number, options?: Omit<SWRConfiguration<T>, "keepPreviousData">, params?: string) {
    return useSWR<T>(`${api}?page=${page}&limit=${limit}${params ? params : ""}`, fetcher, {
        keepPreviousData: true, ...options,
    });
}

export function useTableLength(table: keyof typeof prisma, options?: Omit<SWRConfiguration, "keepPreviousData">): number | undefined {
    return useSWR<{ totalCount: number }>(`/api/admin/utils/get-table-count?tb=${String(table)}`, fetcher, {
        keepPreviousData: true, ...options
    }).data?.totalCount;
}

export function useEmploymentStatusTypes() {
    return useSWR<EmploymentStatusDetails[]>('/api/admin/employment-status', {
        revalidateOnFocus: true, keepPreviousData: true
    })
}

export function useSignatories() {
    return useSWR<SignatoryPath[]>('/api/admin/signatory', {
        revalidateOnFocus: true, keepPreviousData: true, refreshInterval: 3000
    })
}

export function useSignatoryRoles() {
    return useSWR<SignatoryRoles[]>('/api/admin/signatory/roles', {
        revalidateOnFocus: true, keepPreviousData: true, refreshInterval: 3000
    })
}

export function useJobTypes() {
    return useSWR<JobTypes[]>('/api/admin/jobs', {
        revalidateOnFocus: true, keepPreviousData: true, refreshInterval: 3000
    })
}

export function useDepartments() {
    return useSWR<DepartmentName[]>('/api/admin/departments', {
        revalidateOnFocus: true, keepPreviousData: true, refreshInterval: 3000
    })
}

export function useNotification() {
    return useSWR<SystemNotification>('/api/admin/notification', {
        keepPreviousData: true, // Keep previous data while fetching new data
        refreshInterval: 3000
    });
}


export function useBenefitMembership({page, rows}: { page: number, rows: number }) {
    return usePaginateQuery<PaginatedEmployeeBenefitDetails>("/api/admin/benefits/membership", page, rows, {
        refreshInterval: 3000
    });
}

export function useNotEnrolledEmployees() {
    return useSWR<EmployeeEnrollmentSelection>("/api/admin/benefits/plans/not-enrolled", fetcher, {
        keepPreviousData: true, revalidateOnFocus: true,
    })
}
export function usePayrollReport(id: number) {
    return useSWR<PayrollReports>("/api/admin/reports/payroll?date=" + id, fetcher, {
        keepPreviousData: true, revalidateOnFocus: true,
    })
}

type PayrollReportResponse = {
    id: number;
    date: string;
};

export function usePayrollReportDate() {
    return useSWR<PayrollReportResponse[]>(
        "/api/admin/reports/payroll/get-deployed-payroll-date",
        fetcher,
        {
            keepPreviousData: true,
            revalidateOnFocus: true,
        }
    );
}

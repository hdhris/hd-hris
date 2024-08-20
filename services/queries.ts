import fetcher from "@/services/fetcher";
import useSWR from "swr";
import {ApiResponse} from "@/types/dashboard/reportStat";
import {Employee} from "@/types/employeee/EmployeeType";
import {Signatory} from "@/types/audit/types";

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


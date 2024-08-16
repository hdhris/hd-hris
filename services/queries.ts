import useSWR from "swr";
import fetcher from "@/services/fetcher";
import {Signatory} from "@/types/audit/types";

export function useAuditSignatories() {
    return useSWR<Signatory[]>('/api/audit/signatories', fetcher, {
        revalidateOnFocus: false, refreshInterval: 3000
    })
}
"use client";
import React, { useMemo, useState } from "react";
import { useQuery } from "@/services/queries";
import { overtimePageConfigTable } from "./config";
import { useEmployeeId } from "@/hooks/employeeIdHook";
import TableData from "@/components/tabledata/TableData";
import { OvertimeEntry } from "@/types/attendance-time/OvertimeType";
import ViewOvertime from "@/components/admin/attendance-time/overtime/view-overtime";

function Page() {
    const userID = useEmployeeId();
    const {
        data: overtimes,
        isLoading,
        mutate,
    } = useQuery<OvertimeEntry[]>("/api/admin/attendance-time/overtime", { refreshInterval: 60000 });

    const [viewOvertime, setViewOvertime] = useState<OvertimeEntry|null>(null);

    const getOvertimeById = useMemo(() => {
        return (id: number) => {
            return overtimes?.find((item) => item.id === id);
        };
    }, [overtimes]);

    return (
        <div className="flex h-full">
            <TableData 
                items={overtimes || []}
                config={overtimePageConfigTable()}
                isLoading={isLoading}
                onRowAction={(key: React.Key)=> {
                    const item = getOvertimeById(Number(key));
                    setViewOvertime(item||null)
                }}
            />
            <ViewOvertime
                onClose={()=>setViewOvertime(null)}
                overtime={viewOvertime}
                mutate={mutate}
            />
        </div>
    );
}

export default Page;

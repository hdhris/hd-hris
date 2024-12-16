"use client";
import axios from "axios";
import React, { useMemo, useState } from "react";
import { useQuery } from "@/services/queries";
import { toast } from "@/components/ui/use-toast";
import showDialog from "@/lib/utils/confirmDialog";
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

    const onUpdate = async (id: number, status: string) => {
        const isApproved = status === "approved";

        const response = await showDialog({
            title: `${isApproved ? "Appoval" : "Rejection"}`,
            message: `Do you confirm to ${isApproved ? "approve" : "reject"} ${
                getOvertimeById(id)!.trans_employees_overtimes.last_name
            }'s overtime application?`,
            preferredAnswer: isApproved ? "yes" : "no",
        });
        if (response === "yes") {
            try {
                await axios.post("/api/admin/attendance-time/overtime/update", { id, status, userID });
                mutate();
                toast({
                    title: isApproved ? "Approved" : "Rejected",
                    description: "Overtime has been " + status,
                    variant: isApproved ? "success" : "default",
                });
            } catch (error) {
                console.log(error);
                toast({
                    title: "An error has occured",
                    // description: String(error),
                    variant: "danger",
                });
            }
        }
    };
    return (
        <div className="flex h-full">
            <TableData 
                items={overtimes || []}
                config={overtimePageConfigTable(onUpdate)}
                isLoading={isLoading}
                onRowAction={(key: React.Key)=> {
                    const item = getOvertimeById(Number(key));
                    setViewOvertime(item||null)
                }}
            />
            <ViewOvertime
                onClose={()=>setViewOvertime(null)}
                overtime={viewOvertime}
            />
        </div>
    );
}

export default Page;

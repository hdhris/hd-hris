"use client";
import React, { useMemo, useState } from "react";
import { useQuery } from "@/services/queries";
import { overtimePageConfigTable } from "./config";
import TableData from "@/components/tabledata/TableData";
import { OvertimeEntry } from "@/types/attendance-time/OvertimeType";
import ViewOvertime from "@/components/admin/attendance-time/overtime/view-overtime";
import FileOvertime from "@/components/admin/attendance-time/overtime/file-overtime";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import { Button } from "@nextui-org/react";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { useModulePath } from "@/hooks/privilege-hook";

function Page() {
    const { isPrivilegeAuthorized } = useModulePath();
    const [showFiling, setShowFiling] = useState(false);
    const [viewOvertime, setViewOvertime] = useState<OvertimeEntry | null>(null);
    SetNavEndContent(() =>
        isPrivilegeAuthorized("File Overtimes") ? (
            <Button {...uniformStyle()} onPress={() => setShowFiling(true)}>
                File Overtime
            </Button>
        ) : (
            <div />
        )
    );

    const {
        data: overtimes,
        isLoading,
        mutate,
    } = useQuery<OvertimeEntry[]>("/api/admin/attendance-time/overtime", { refreshInterval: 60000 });

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
                onRowAction={(key: React.Key) => {
                    const item = getOvertimeById(Number(key));
                    setViewOvertime(item || null);
                }}
            />
            <ViewOvertime onClose={() => setViewOvertime(null)} overtime={viewOvertime} mutate={mutate} />
            <FileOvertime
                isOpen={showFiling}
                onClose={() => {
                    setShowFiling(false);
                    mutate();
                }}
            />
        </div>
    );
}

export default Page;

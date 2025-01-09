"use client";
import { searchConfig, sortProps, tableConfig } from "@/components/admin/incident/reports/configs";
import IncidentDrawer from "@/components/admin/incident/reports/incident-drawer";
import DataDisplay from "@/components/common/data-display/data-display";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { useQuery } from "@/services/queries";
import { IncidentReport } from "@/types/incident-reports/type";
import { Button } from "@nextui-org/react";
import React, { useState } from "react";
import FileReport from "./FileReport";
import TableData from "@/components/tabledata/TableData";
import DataTable from "@/components/common/data-display/data-table";

function Page() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<IncidentReport | null>(null);
    const { data, isLoading } = useQuery<IncidentReport[]>("/api/admin/incident/reports");
    SetNavEndContent(() => {
        return (
            <Button {...uniformStyle()} onPress={() => setIsOpen(true)}>
                Report Incident
            </Button>
        );
    });

    return (
        <div className="flex h-full w-full">
            <TableData
                title="Incident Reports"
                items={data || []}
                isLoading={isLoading}
                config={tableConfig}
                onRowAction={(key)=> {
                    setSelectedItem(data?.find(item => item.id === Number(key)) ?? null)
                }}
                layout={"auto"}
            />
            <FileReport isOpen={isOpen} onClose={() => setIsOpen(false)} />
            <IncidentDrawer report={selectedItem} onClose={()=>setSelectedItem(null)}  />
        </div>
    );
}
export default Page;

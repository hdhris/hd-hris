"use client"
import React, {useMemo} from 'react';
import {
    filterLeaveTypes, LeaveTypeTableConfiguration
} from "@/components/admin/leaves/leave-types/display/table/config/leave-type-table-config";
import {useQuery} from "@/services/queries";
import {LeaveType} from "@/types/leaves/LeaveTypes";
import DataDisplay from "@/components/common/data-display/data-display";
import {Card, CardBody} from "@nextui-org/card";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import LeaveTypeForm from "@/components/admin/leaves/leave-types/form/LeaveTypeForm";

function LeaveTypeTable() {
    const {data, isLoading} = useQuery<LeaveType[]>("/api/admin/leaves/leave-types", {refreshInterval: 3000});

    const leaveData = useMemo(() => {
        if (!data) return []
        return data
    }, [data])

    SetNavEndContent(() => <LeaveTypeForm/>)
    return (<DataDisplay
            title="Leave Types"
            data={leaveData}
            filterProps={{
                filterItems: filterLeaveTypes
            }}
            sortProps={{
                sortItems: [{
                    key: "id", name: "ID"
                }, {key: "name", name: "Name"}, {key: "created_at", name: "Created At"}], initialValue: {
                    column: "id", direction: "ascending"
                },

            }}
            searchProps={{
                searchingItemKey: ["name"]
            }}
            paginationProps={{
                loop: true,
            }}
            onTableDisplay={{
                config: LeaveTypeTableConfiguration, isLoading, onRowAction: (key) => alert(key)
            }}
            onGridDisplay={(data) => {
                return (<pre>{JSON.stringify(data, null, 2)}</pre>)
            }}

            onListDisplay={(data) => {
                return (<Card className="w-full">
                        <CardBody>{data.max_duration}</CardBody>
                    </Card>

                )
            }}
            onExport={{
                drawerProps: {
                    title: "Export",
                }
            }}
            onImport={{
                drawerProps: {
                    title: "Import",
                }
            }}
        />);
}

export default LeaveTypeTable;
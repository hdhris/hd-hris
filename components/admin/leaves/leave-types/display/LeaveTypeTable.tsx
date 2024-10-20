"use client"
import React, {useMemo, useState} from 'react';
import {
    filterLeaveTypes, LeaveTypeTableConfiguration
} from "@/components/admin/leaves/leave-types/display/table/config/leave-type-table-config";
import {usePaginateQuery} from "@/services/queries";
import {LeaveRequestPaginate} from "@/types/leaves/LeaveTypes";
import DataDisplay from "@/components/common/data-display/data-display";
import {Card, CardBody} from "@nextui-org/card";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import LeaveTypeForm from "@/components/admin/leaves/leave-types/form/LeaveTypeForm";

function LeaveTypeTable() {
    const [page, setPage] = useState<number>(1)
    const [rows, setRows] = useState<number>(5)
    const {data, isLoading} = usePaginateQuery<LeaveRequestPaginate>("/api/admin/leaves/leave-types", page, rows);
    const leaveData = useMemo(() => {
        if (!data?.data) {
            return []
        } else {
            return data.data
        }
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
            }, {key: "name", name: "Name"}, {key: "created_at", name: "Created At"}]

        }}
        searchProps={{
            searchingItemKey: ["name"]
        }}
        rowSelectionProps={{
            onRowChange: setRows
        }}
        paginationProps={{
            loop: true, data_length: data?.totalItems!, onChange: setPage
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
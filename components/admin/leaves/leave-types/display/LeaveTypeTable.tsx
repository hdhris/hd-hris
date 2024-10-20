"use client"
import React from 'react';
import TableData from "@/components/tabledata/TableData";
import {
    filterLeaveTypes,
    LeaveTypeTableConfiguration
} from "@/components/admin/leaves/leave-types/display/table/config/leave-type-table-config";
import {useQuery} from "@/services/queries";
import {LeaveType} from "@/types/leaves/LeaveTypes";
import {filterTable} from "@/helper/filter/table/filter";
import {parseBoolean} from "@/lib/utils/parser/parseClass";

function LeaveTypeTable() {
    const { data, isLoading} = useQuery<LeaveType[]>(
        "/api/admin/leaves/leave-types",
        {refreshInterval:3000}
    );
    return (
        <TableData
            aria-label="Leave Type Table"
            isLoading={isLoading}
            config={LeaveTypeTableConfiguration}
            filterItems={filterLeaveTypes}
            items={data || []}
            isCompact
            isStriped
            searchingItemKey={["name"]}
        />
    );
}

export default LeaveTypeTable;
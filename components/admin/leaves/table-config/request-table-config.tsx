"use client"
import {ColumnsProps, TableConfigProps} from "@/types/table/TableDataTypes";
import {RequestFormTableType} from "@/types/leaves/LeaveRequestTypes";
import React from "react";

const RequestTableColumns: ColumnsProps[] = [
    {
        name: "Name",
        uid: "name",
        sortable: true
    },{
        name: "Contact Info",
        uid: "contact_info"
    }, {
        name: "Leave Type",
        uid: "leave_type",
        sortable: true
    }, {
        name: "Start Date",
        uid: "start_date",
        sortable: true
    }, {
        name: "End Date",
        uid: "end_date",
        sortable: true
    }, {
        name: "Remaining Credits",
        uid: "remaining_credits"
    }, {
        name: "Action",
        uid: "action",
        sortable: true
    }
]


export const RequestTableConfig: TableConfigProps<RequestFormTableType> = {
    columns: RequestTableColumns,
    rowCell: (item: RequestFormTableType, columnKey: React.Key) => {
        const cellValue = item[columnKey as keyof RequestFormTableType];
        return (
            <div>
                {String(cellValue)}
            </div>
        );
    }
}
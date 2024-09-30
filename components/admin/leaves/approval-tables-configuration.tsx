'use client'
import {ColumnsProps, TableConfigProps} from "@/types/table/TableDataTypes";
import {DepartmentInfo} from "@/types/employeee/DepartmentType";
import React from "react";
import {LeaveRequestTypes} from "@/types/leaves/LeaveRequestTypes";
import {Case, Default, Switch} from "@/components/common/Switch";
import Typography from "@/components/common/typography/Typography";
import {Avatar, BadgeProps, Tooltip, User} from "@nextui-org/react";
import {Status} from "@/components/status/Status";
import {FilterProps} from "@/types/table/default_config";

const ApprovalColumns: ColumnsProps[] = [
    {
        name: 'Name',
        uid: 'name',
        sortable: true
    }, {
        name: 'Leave Type',
        uid: 'leave_type',
        sortable: true
    }, {
        name: 'Start Date',
        uid: 'start_date',
        sortable: true
    }, {
        name: 'End Date',
        uid: 'end_date',
        sortable: true
    }, {
        name: 'Total Days',
        uid: 'total_days',
        sortable: true
    }, {
        name: 'Status',
        uid: 'status',
        sortable: true
    }, {
        name: 'Approved By',
        uid: 'approved_by',
        sortable: false
    }
]

const approval_status_color_map: Record<string, BadgeProps["color"]> = {
    approved: "success", rejected: "danger", pending: "warning"
}
export const TableConfigurations: TableConfigProps<LeaveRequestTypes> = {
    columns: ApprovalColumns,
    rowCell: (item: LeaveRequestTypes, columnKey: React.Key) => {
        const cellValue = item[columnKey as keyof LeaveRequestTypes];
        return (
            <Switch expression={columnKey as string}>
                <Case of="name">
                    <User
                        avatarProps={{radius: "full", size: "sm", src: item.picture}}
                        classNames={{
                            description: "text-default-500",
                        }}
                        description={item.email}
                        name={item.name}
                    >
                        {item.email}
                    </User>

                </Case>
                <Case of="status">
                    <Status color={approval_status_color_map[String(cellValue).toLowerCase()]}>
                        {cellValue as string}
                    </Status>
                </Case>
                <Case of="approved_by">
                    <Tooltip className="pointer-events-auto" content={item.approvedBy?.name}>
                        <Avatar
                            size="sm"
                            src={item.approvedBy?.picture}
                        />
                    </Tooltip>
                </Case>
                <Default>
                    <Typography>{cellValue as string}</Typography>
                </Default>
            </Switch>
        );
    }
}

export const FilterItems: FilterProps[] = [{
    filtered: [
        {name: "Approved", uid: "approved"},
        {name: "Rejected", uid: "rejected"},
        {name: "Pending", uid: "pending"},

    ],
    category: "Status"
}]
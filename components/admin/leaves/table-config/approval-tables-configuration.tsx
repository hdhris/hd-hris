'use client'
import {ColumnsProps, TableConfigProps} from "@/types/table/TableDataTypes";
import React from "react";
import {LeaveRequestTypes} from "@/types/leaves/LeaveRequestTypes";
import {Case, Default, Switch} from "@/components/common/Switch";
import Typography from "@/components/common/typography/Typography";
import {Avatar, BadgeProps, cn, Tooltip, User} from "@nextui-org/react";
import {Status} from "@/components/status/Status";
import {FilterProps} from "@/types/table/default_config";
import {Button} from "@nextui-org/button";
import {LuThumbsDown, LuThumbsUp} from "react-icons/lu";
import {icon_color, icon_size, icon_size_sm} from "@/lib/utils";
import {axiosInstance} from "@/services/fetcher";
import {useToast} from "@/components/ui/use-toast";

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
        name: 'Action',
        uid: 'action',
    }, {
        name: 'Reviewed By',
        uid: 'reviewed_by',
    }
]

const approval_status_color_map: Record<string, BadgeProps["color"]> = {
    approved: "success", rejected: "danger", pending: "warning"
}
export const TableConfigurations: TableConfigProps<LeaveRequestTypes> = {
    columns: ApprovalColumns,
    rowCell: (item: LeaveRequestTypes, columnKey: React.Key) => {
        const handleReview = async (key: React.Key, method: "Approved" | "Rejected") => {
            const res = await axiosInstance.post("/api/admin/leaves/requests/reviewed", {
                id: key,
                method
            })
            if (res.status === 200) {
                alert("Success")
            } else {
                alert("Failed")
            }
        }
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
                <Case of="action">
                    {item.status === "Pending" ? <div className="flex gap-2">
                        <Button size="sm" radius="full" isIconOnly variant="light"
                                onClick={handleReview.bind(null, item.id, "Approved")}>
                            <LuThumbsUp className={cn("text-success", icon_size_sm)}/>
                        </Button>
                        <Button size="sm" radius="full" isIconOnly variant="light"
                                onClick={handleReview.bind(null, item.id, "Rejected")}>
                            <LuThumbsDown className={cn("text-danger", icon_size_sm)}/>
                        </Button>
                    </div> : ""}

                </Case>
                <Case of="reviewed_by">
                    {item.status !== "Pending" ?
                        <Tooltip className="pointer-events-auto" content={item.approvedBy?.name}>
                            <Avatar
                                size="sm"
                                src={item.approvedBy?.picture}
                            />
                        </Tooltip> : ""
                    }
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
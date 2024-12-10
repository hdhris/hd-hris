'use client'
import {ColumnsProps, TableConfigProps} from "@/types/table/TableDataTypes";
import React from "react";
import {Case, Switch} from "@/components/common/Switch";
import Typography from "@/components/common/typography/Typography";
import {Avatar, AvatarGroup, BadgeProps, User} from "@nextui-org/react";
import {Status} from "@/components/status/Status";
import {FilterProps} from "@/types/table/default_config";
import {LeaveRequest} from "@/types/leaves/LeaveRequestTypes";
import {Tooltip} from "@nextui-org/tooltip";
import {formatDaysToReadableTime} from "@/lib/utils/timeFormatter";


const ApprovalColumns: ColumnsProps[] = [{
    name: 'Name', uid: 'name', sortable: true
}, {
    name: 'Leave Type', uid: 'leave_type', sortable: true
}, {
    name: 'Start Date', uid: 'start_date', sortable: true
}, {
    name: 'End Date', uid: 'end_date', sortable: true
}, {
    name: 'Total Days', uid: 'total_days', sortable: true
}, {
    name: 'Status', uid: 'status', sortable: true
}, {
    name: 'Evaluated By', uid: 'evaluated_by',
}]

export const approval_status_color_map: Record<string, BadgeProps["color"]> = {
    approved: "success", rejected: "danger", pending: "warning", canceled: "danger"
}
export const TableConfigurations: TableConfigProps<LeaveRequest> = {
    columns: ApprovalColumns, rowCell: (item: LeaveRequest, columnKey: React.Key) => {
        // const handleReview = async (key: React.Key, method: "Approved" | "Rejected") => {
        //     const res = await axiosInstance.post("/api/admin/leaves/requests/reviewed", {
        //         id: key, method
        //     })
        //     if (res.status === 200) {
        //         alert("Success")
        //     } else {
        //         alert("Failed")
        //     }
        // }


        const evaluators = []
        const is_approved = item.evaluators.approver.decision.is_approved
        const is_reviewed = item.evaluators.reviewers?.decision.is_reviewed
        if (is_approved) {
            const approver = item.evaluators.approver.approved_by
            const approved_by = item.evaluators.users.find(item => item.id === approver)
            const approver_data = {
                type: "Approved", ...approved_by
            }
            evaluators.push(approver_data)
        }

        if (is_reviewed) {
            const reviewer = item.evaluators.reviewers.reviewed_by
            const reviewed_by = item.evaluators.users.find(item => item.id === reviewer)
            const reviewer_data = {
                type: "Reviewed", ...reviewed_by
            }
            evaluators.push(reviewer_data)
        }
        // const leave_status = item.
        // const cellValue = item[columnKey as keyof LeaveRequest];
        return (<Switch expression={columnKey as string}>
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
            <Case of="leave_type">
                <Typography>{item.leave_type.name}</Typography>
            </Case>
            <Case of="start_date">
                <Typography>{item.leave_details.start_date}</Typography>
            </Case>
            <Case of="end_date">
                <Typography>{item.leave_details.end_date}</Typography>
            </Case>
            <Case of="total_days">
                <Typography>{item.leave_details.total_days}</Typography>
            </Case>
            <Case of="status">
                <Status color={approval_status_color_map[item.leave_details.status.toLowerCase()]}>
                    <Typography className="text-sm">{item.leave_details.status}</Typography>
                </Status>

            </Case>
            <Case of="evaluated_by">
                <div className="flex">
                    <AvatarGroup>
                        {evaluators.length > 0 ? evaluators.map((evaluator, index) => {
                            return (

                                <Tooltip key={index} content={evaluator.type + " - " + evaluator.name}>
                                    <Avatar isBordered size="sm" src={evaluator.picture}/>
                                </Tooltip>

                            )
                        }) : null}
                    </AvatarGroup>
                </div>
            </Case>
            {/*<Case of="status">*/}
            {/*    <Status color={approval_status_color_map[String(cellValue).toLowerCase()]}>*/}
            {/*        {cellValue as string}*/}
            {/*    </Status>*/}
            {/*</Case>*/}
            {/*<Case of="action">*/}
            {/*    {"Pending" ? <div className="flex gap-2">*/}
            {/*        <Button size="sm" radius="full" isIconOnly variant="light"*/}
            {/*                onClick={handleReview.bind(null, item.id, "Approved")}>*/}
            {/*            <LuThumbsUp className={cn("text-success", icon_size_sm)}/>*/}
            {/*        </Button>*/}
            {/*        <Button size="sm" radius="full" isIconOnly variant="light"*/}
            {/*                onClick={handleReview.bind(null, item.id, "Rejected")}>*/}
            {/*            <LuThumbsDown className={cn("text-danger", icon_size_sm)}/>*/}
            {/*        </Button>*/}
            {/*    </div> : ""}*/}

            {/*</Case>*/}
            {/*<Case of="reviewed_by">*/}
            {/*    {item.status !== "Pending" ?*/}
            {/*        <Tooltip className="pointer-events-auto" content={item.approvedBy?.name}>*/}
            {/*            <Avatar*/}
            {/*                size="sm"*/}
            {/*                src={item.approvedBy?.picture}*/}
            {/*            />*/}
            {/*        </Tooltip> : ""}*/}
            {/*</Case>*/}
            {/*<Default>*/}
            {/*    <Typography>{cellValue as string}</Typography>*/}
            {/*</Default>*/}
        </Switch>);
    }
}

export const FilterItems: FilterProps[] = [{
    filtered: [{name: "Approved", value: "Approved", key: "status"}, {
        name: "Rejected", value: "Rejected", key: "status"
    }, {name: "Pending", value: "Pending", key: "status"},

    ], category: "Status"
}]
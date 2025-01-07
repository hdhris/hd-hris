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
import {capitalize} from "@nextui-org/shared-utils";
import {toGMT8} from "@/lib/utils/toGMT8";


const ApprovalColumns: ColumnsProps[] = [{
    name: 'Name', uid: 'name', sortable: true
}, {
    name: 'Leave Type', uid: 'leave_type', sortable: true
}, {
    name: 'Start Date', uid: 'start_date', sortable: true
}, {
    name: 'End Date', uid: 'end_date', sortable: true
}, {
    name: 'Duration Of Leave', uid: 'duration_of_leave', sortable: true
}, {
    name: 'Status', uid: 'status', sortable: true
}, {
    name: 'Evaluated By', uid: 'evaluated_by',
}]

export const approval_status_color_map: Record<string, BadgeProps["color"]> = {
    approved: "success", rejected: "danger", pending: "warning", canceled: "danger",
}
export const TableConfigurations: TableConfigProps<LeaveRequest> = {
    columns: ApprovalColumns, rowCell: (item: LeaveRequest, columnKey: React.Key) => {
        const evaluators = item.evaluators.evaluators
        const users = item.evaluators.users
        const evaluated_by = users.filter(user => evaluators.some(evaluator => Number(evaluator.evaluated_by) === Number(user.id)) && user.role !== "applicant")
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
                <Typography>{toGMT8(item.leave_details.start_date).format("MMM DD, YYYY hh:mm A")}</Typography>
            </Case>
            <Case of="end_date">
                <Typography>{toGMT8(item.leave_details.end_date).format("MMM DD, YYYY hh:mm A")}</Typography>
            </Case>
            <Case of="duration_of_leave">
                <Typography>{item.leave_details.total_days}</Typography>
            </Case>
            <Case of="status">
                <Status color={approval_status_color_map[item.leave_details.status.toLowerCase()]}>
                    <Typography className="text-sm">{capitalize(item.leave_details.status)}</Typography>
                </Status>

            </Case>
            <Case of="evaluated_by">
                <div className="flex justify-center">
                    <AvatarGroup>
                        {evaluators.length > 0 ? evaluated_by.map((evaluator, index) => {
                            const evaluated = evaluators.find(item => Number(item.evaluated_by) === Number(evaluator.id))
                            return (
                                <Tooltip key={index} content={capitalize(evaluator.role) + " - " + evaluator.name}>
                                    <Avatar isBordered size="sm" src={evaluator.picture} color={evaluated?.decision.is_decided === null ? "warning" : evaluated?.decision.is_decided ? "success" : "danger"}/>
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
            {/*    /!*{item.status !== "Pending" ?*!/*/}
            {/*    /!*    <Tooltip className="pointer-events-auto" content={item.approvedBy?.name}>*!/*/}
            {/*    /!*        <Avatar*!/*/}
            {/*    /!*            size="sm"*!/*/}
            {/*    /!*            src={item.approvedBy?.picture}*!/*/}
            {/*    /!*        />*!/*/}
            {/*    /!*    </Tooltip> : ""}*!/*/}
            {/*</Case>*/}
            {/*<Default>*/}
            {/*    <Typography>{cellValue as string}</Typography>*/}
            {/*</Default>*/}
        </Switch>);
    }
}

export const FilterItems: FilterProps[] = [{
    filtered: [{name: "Approved", value: "approved", key: "leave_details.status"}, {
        name: "Rejected", value: "rejected", key: "leave_details.status"
    }, {name: "Pending", value: "pending", key: "leave_details.status"},

    ], category: "Status"
}]
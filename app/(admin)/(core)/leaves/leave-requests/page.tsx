"use client"
import React, {Key, useCallback, useMemo, useState} from 'react';
import {Button} from "@nextui-org/button";
import {usePaginateQuery, useQuery} from "@/services/queries";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import DataDisplay from "@/components/common/data-display/data-display";
import {
    approval_status_color_map, FilterItems, TableConfigurations
} from "@/components/admin/leaves/table-config/approval-tables-configuration";
import RequestForm, { normalizeDate } from "@/components/admin/leaves/request-form/form/RequestForm";
import {LeaveRequest} from "@/types/leaves/LeaveRequestTypes";
import CardView from "@/components/common/card-view/card-view";
import {Avatar, Chip, cn, Input, ScrollShadow, User} from '@nextui-org/react';
import Typography, {Section} from "@/components/common/typography/Typography";
import {capitalize} from "@nextui-org/shared-utils";
import UserMail from "@/components/common/avatar/user-info-mail";
import CardTable from "@/components/common/card-view/card-table";
import BorderCard from "@/components/common/BorderCard";
import {
    LuCheck,
    LuX,
    LuBan,
    LuCalendarRange,
    LuThumbsUp,
    LuThumbsDown,
    LuPencil
} from "react-icons/lu";
import {icon_color, icon_size_sm} from "@/lib/utils";
import {getColor} from "@/helper/background-color-generator/generator";
import UserAvatarTooltip from "@/components/common/avatar/user-avatar-tooltip";
import {useSession} from "next-auth/react";
import {FaReply} from "react-icons/fa";
import dayjs from "dayjs";
import {HolidayData} from "@/types/attendance-time/HolidayTypes";
import {useHolidays} from "@/helper/holidays/unavailableDates";
import {useLocale} from "@react-aria/i18n";

interface LeaveRequestPaginate {
    data: LeaveRequest[]
    totalItems: number
}

function Page() {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [page, setPage] = useState<number>(1)
    const [rows, setRows] = useState<number>(5)
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest>()
    const session = useSession()
    const {data, isLoading} = usePaginateQuery<LeaveRequestPaginate>("/api/admin/leaves/requests", page, rows, {
        refreshInterval: 3000
    });
    const { data: holiday, isLoading: holidayLoading} = useQuery<HolidayData>(`/api/admin/attendance-time/holidays/${new Date().getFullYear()}`);
    const {isDateUnavailable} = useHolidays()
    let {locale} = useLocale();

    const allRequests = useMemo(() => {
        if (data) return data.data.map((item) => {
            const created_by = {
                id: item.created_by.id, name: item.created_by.name, picture: item.created_by.picture,
            }

            return {
                id: item.id,
                employee_id: item.employee_id,
                picture: item.picture,
                email: item.email || "N/A",
                name: item.name,
                leave_type: {
                    id: item.leave_type.id, name: item.leave_type.name, code: item.leave_type.code
                },
                leave_details: {
                    start_date: item.leave_details.start_date, // Format date here
                    end_date: item.leave_details.end_date,     // Format date here
                    total_days: item.leave_details.total_days,
                    reason: item.leave_details.reason,
                    status: item.leave_details.status,
                    created_at: item.leave_details.created_at,
                    updated_at: item.leave_details.updated_at
                },
                evaluators: item.evaluators,

                created_by
            }
        })

        return []
    }, [data])

    const handleOnSelected = (key: Key) => {
        const selected = allRequests.find(item => item.id === Number(key))
        setSelectedRequest(selected)
        // console.log("Selected: ", selected)
    }

    const onOpenDrawer = useCallback(() => {
        setIsOpen(true)
    }, [setIsOpen])

    SetNavEndContent(() => {
        return (<>
            <Button {...uniformStyle()} onClick={onOpenDrawer}>
                File A Leave
            </Button>
            <RequestForm onOpen={setIsOpen} isOpen={isOpen}/>
        </>)
    })

    const users = selectedRequest?.evaluators.users
    const comments = selectedRequest?.evaluators.comments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    // Extract `comment_content` in the same order as `comments`
    const comment_content = comments?.map((comment) => users?.find((user) => user.id === comment.author)!).filter(Boolean)!; // Filter out any undefined users (in case no match is found)
    const evaluators = selectedRequest?.evaluators

    const approver = users?.find(user => user.id === evaluators?.approver.approved_by)
    const reviewer = users?.find(user => user.id === evaluators?.reviewers.reviewed_by)
    const approver_details = evaluators?.approver
    const reviewer_details = evaluators?.reviewers
    // const leave_progress = dayjs(selectedRequest?.leave_details.start_date).diff(dayjs(), "day")
    const startDate = dayjs(selectedRequest?.leave_details.start_date);
    const endDate = dayjs(selectedRequest?.leave_details.end_date);

    const is_approver = users?.filter(user => user.id === approver_details?.approved_by).find(user => user.employee_id === session.data?.user?.employee_id)
    const is_reviewer = users?.filter(user => user.id === reviewer_details?.reviewed_by).find(user => user.employee_id === session.data?.user?.employee_id)

    // console.log("Is Approver: ", is_approver)
    // console.log("Is Reviewer: ", is_reviewer)
    const today = dayjs();
    const leave_progress = useMemo(() => {
        if (today.isBefore(startDate, 'day')) {
            return "Not Started";
        } else if (today.isAfter(endDate, 'day')) {
            return"Finished";
        } else {
            return "On Going";
        }
    }, [endDate, startDate, today])
    return (<section className='w-full h-full flex gap-4 overflow-hidden'>
        <DataDisplay
            isLoading={isLoading}
            defaultDisplay="table"
            data={allRequests || []}
            title="Leave Requests"
            filterProps={{
                filterItems: FilterItems
            }}
            onTableDisplay={{
                config: TableConfigurations, layout: "auto", onRowAction: handleOnSelected
            }}
            searchProps={{
                searchingItemKey: ["name"]
            }}
            sortProps={{
                sortItems: [{
                    name: "ID", key: "id"
                }]
            }}
            rowSelectionProps={{
                onRowChange: setRows
            }}
            paginationProps={{
                loop: true, data_length: data?.totalItems!, onChange: setPage
            }}
            // onListDisplay={(data) => {
            //     return (<BorderCard>{data.name}</BorderCard>)
            // }}
        />

        {selectedRequest && <CardView
            onClose={() => setSelectedRequest(undefined)}
            header={<div className="flex flex-row items-center space-x-4 pb-2">
                <UserMail
                    name={<div className="flex gap-10">
                        <Typography className="font-semibold">{selectedRequest.name}</Typography>
                        <Chip
                            size="sm"
                            color={approval_status_color_map[selectedRequest.leave_details.status.toLowerCase()]}>{capitalize(selectedRequest.leave_details.status)}</Chip>

                    </div>}
                    picture={selectedRequest.picture!}
                    email={selectedRequest.email || "No Email"}
                />

            </div>} body={<>

        {/*<Section className="ms-0" title="Leave Type" subtitle="Type of leave apply by the employee."/>*/}
        {/*<hr className="border border-default-400 space-y-2"/>*/}
            <CardTable data={[{
                label: "Leave Type", value: <div className="flex gap-4 items-center">
                    <Typography>{selectedRequest.leave_type.name}</Typography>
                    <Chip style={{
                        background: getColor(selectedRequest.leave_type.code, 0.2),
                        borderColor: getColor(selectedRequest.leave_type.code, 0.5),
                        color: getColor(selectedRequest.leave_type.code)
                    }} size="sm" variant="bordered" classNames={{
                        content: "font-bold",
                    }}>
                        {selectedRequest.leave_type.code}
                    </Chip></div>
            }, {
                label: "Start Date", value: selectedRequest.leave_details.start_date
            }, {
                label: "End Date", value: selectedRequest.leave_details.end_date
            }, {
                label: "Total Days", value: selectedRequest.leave_details.total_days
            }, {
                label: "Leave Progress Status", value: <Chip variant="flat" color={leave_progress === "Not Started" ? "danger" : leave_progress === "Finished" ? "success" : "warning"}>{leave_progress}</Chip>
            }, {
                label: "Created By", value: <>
                    <UserAvatarTooltip user={{
                        name: selectedRequest.created_by.name,
                        picture: selectedRequest.created_by.picture,
                        id: selectedRequest.created_by.id
                    }} avatarProps={{
                        classNames: {
                            base: '!size-6'
                        }, isBordered: true
                    }}/>
                </>
            }, {
                label: "Created At", value: selectedRequest.leave_details.created_at
            }, {
                label: "Updated At", value: selectedRequest.leave_details.updated_at
            },]}/>

            <hr className="border border-default-400 space-y-2"/>
            <Section className="ms-0" title="Comment" subtitle="Comment of employee in regard to leave request."/>
            <BorderCard className="h-fit p-2 pb-4">
                <div className="flex flex-col gap-4 h-full mb-4">
                    {comment_content?.map((content) => {
                        const userComments = comments?.filter((comment) => comment.author === content.id);

                        return (<div key={content.id}>
                            {/* Display the main user */}
                            <User
                                className="justify-start p-2"
                                name={<Typography className="text-sm font-semibold">{content.name}</Typography>}
                                description={<Typography className="text-sm font-semibold !text-default-400/75">
                                    {capitalize(content.role)}
                                </Typography>}
                                avatarProps={{
                                    src: content.picture, classNames: {base: '!size-6'}, isBordered: true,
                                }}
                            />


                            {/* Display user's comments */}
                            {userComments?.map((comment) => (<div key={comment.id} className="ms-5 space-y-4">
                                <div className="flex gap-2">
                                    <Typography className="text-sm indent-4">{comment.message}</Typography>
                                    <Button isIconOnly variant="light" size="sm"><FaReply
                                        className={cn(icon_size_sm, icon_color)}/></Button>
                                </div>

                                {/* Display replies to the comment */}
                                {comment.replies.map((reply) => {
                                    const replier = users?.find((commenter) => commenter.id === reply.author);

                                    return (<div key={reply.id} className="ms-10">
                                        <User
                                            className="justify-start p-2"
                                            name={<Typography className="text-sm font-semibold">
                                                {replier?.name}
                                            </Typography>}
                                            description={<Typography
                                                className="text-sm font-semibold !text-default-400/75">
                                                {capitalize(replier?.role || '')}
                                            </Typography>}
                                            avatarProps={{
                                                src: replier?.picture, classNames: {base: '!size-6'}, isBordered: true,
                                            }}
                                        />
                                        <div className="flex gap-2 w-[90%]">
                                            <Typography
                                                className="text-sm indent-4 pl-4">{reply.message}</Typography>
                                            <Button isIconOnly variant="light" size="sm"><FaReply
                                                className={cn(icon_size_sm, icon_color)}/></Button>
                                        </div>
                                    </div>);
                                })}
                            </div>))}
                        </div>);
                    })}
                </div>
            </BorderCard>
            {/*<div className="flex gap-2 items-center">*/}
            {/*    <Input startContent={<Avatar classNames={{*/}
            {/*        base: "h-7 w-7"*/}
            {/*    }}*/}
            {/*                                 src={session.data?.user?.image}*/}
            {/*    />} color="primary" variant="bordered" placeholder="Add a comment..." classNames={InputStyle}/>*/}
            {/*    <Button isIconOnly color="primary" variant="light"><LuSendHorizonal className={cn(icon_size)}/></Button>*/}
            {/*</div>*/}
            <hr className="border border-default-400 space-y-2"/>
            <Section className="ms-0" title="Reason" subtitle="Reason of employee in regard to leave request
            ."/>
            <BorderCard className="h-36">
                <ScrollShadow size={20}>
                    <Typography className="indent-4 text-sm">
                        {selectedRequest.leave_details.reason}
                    </Typography>
                </ScrollShadow>
            </BorderCard>
            <hr className="border border-default-400 space-y-2"/>
            <Section className="ms-0" title="Evaluator's Decision"
                     subtitle="Summary of evaluator's feedback and decisions"/>
            <BorderCard heading={<Typography className="text-medium">Review Details</Typography>}>
                <div className="flex justify-between items-center">
                    <User
                        className="justify-start p-2"
                        name={<Typography className="text-sm font-semibold">{reviewer?.name}</Typography>}
                        description={<Typography className="text-sm font-semibold !text-default-400/75">
                            {reviewer?.email}
                        </Typography>}
                        avatarProps={{
                            src: reviewer?.picture, classNames: {base: '!size-6'}, isBordered: true,
                        }}
                    />
                    {!reviewer_details?.decision.is_reviewed && is_reviewer && <div className="flex gap-2">
                        <Button size="sm" radius="full" isIconOnly variant="light"
                            // onClick={handleReview.bind(null, item.id, "Approved")}
                        >
                            <LuThumbsUp className={cn("text-success", icon_size_sm)}/>
                        </Button>
                        <Button size="sm" radius="full" isIconOnly variant="light"
                            // onClick={handleReview.bind(null, item.id, "Rejected")}
                        >
                            <LuThumbsDown className={cn("text-danger", icon_size_sm)}/>
                        </Button>
                    </div>}
                </div>

                {/*{reviewer?.id === reviewer_details?.reviewed_by && CardD}*/}
                {reviewer_details?.decision.is_reviewed  && <CardTable data={[{
                    label: "Status",
                    value: reviewer_details?.decision.is_reviewed ?
                        <LuCheck className={cn("text-success", icon_size_sm)}/> :
                        <LuX className={cn("text-danger", icon_size_sm)}/>
                }, {
                    label: "Decision Date", value: dayjs(reviewer_details?.decision.decisionDate).format("YYYY-MM-DD")
                }, {
                    label: "Rejected Reason",
                    value: reviewer_details?.decision.rejectedReason ? reviewer_details?.decision.rejectedReason : ""
                },]}/>}
            </BorderCard>
            <BorderCard heading={<Typography className="text-medium">Approved Details</Typography>}>
                <div className="flex justify-between items-center">
                    <User
                        className="justify-start p-2"
                        name={<Typography className="text-sm font-semibold">{approver?.name}</Typography>}
                        description={<Typography className="text-sm font-semibold !text-default-400/75">
                            {approver?.email}
                        </Typography>}
                        avatarProps={{
                            src: approver?.picture, classNames: {base: '!size-6'}, isBordered: true,
                        }}
                    />
                    {!approver_details?.decision.is_approved && is_approver && <div className="flex gap-2">
                        <Button size="sm" radius="full" isIconOnly variant="light"
                            // onClick={handleReview.bind(null, item.id, "Approved")}
                        >
                            <LuThumbsUp className={cn("text-success", icon_size_sm)}/>
                        </Button>
                        <Button size="sm" radius="full" isIconOnly variant="light"
                            // onClick={handleReview.bind(null, item.id, "Rejected")}
                        >
                            <LuThumbsDown className={cn("text-danger", icon_size_sm)}/>
                        </Button>
                    </div>}
                </div>
                    {/*{reviewer?.id === reviewer_details?.reviewed_by && CardD}*/}
                    {approver_details?.decision.is_approved && <CardTable data={[{
                        label: "Status",
                        value: approver_details?.decision.is_approved ?
                            <LuCheck className={cn("text-success", icon_size_sm)}/> :
                            <LuX className={cn("text-danger", icon_size_sm)}/>
                    }, {
                        label: "Decision Date",
                        value: dayjs(approver_details?.decision.decisionDate).format("YYYY-MM-DD")
                    }, {
                        label: "Rejected Reason",
                        value: approver_details?.decision.rejectedReason ? approver_details?.decision.rejectedReason : ""
                    },]}/>}
            </BorderCard>

        </>} onDanger={<>
            <Section className="ms-0" title="Edit Leave"
                     subtitle="Edit the leave request">
                <Button isDisabled={selectedRequest.leave_details.status === "Approved" || selectedRequest.leave_details.status === "Rejected"} startContent={<LuPencil />}{...uniformStyle()}>Edit</Button>
            </Section>
            <hr className="border border-destructive/20"/>
            <Section className="ms-0" title="Extend Leave"
                     subtitle="Extend the leave request">
                <Button isDisabled={selectedRequest.leave_details.status === "Approved" || selectedRequest.leave_details.status === "Rejected"} startContent={<LuCalendarRange />} {...uniformStyle()}>Extend</Button>
            </Section>
            <hr className="border border-destructive/20"/>
            <Section className="ms-0" title="Cancel"
                     subtitle="Cancel the leave request">
                <Button isDisabled={selectedRequest.leave_details.status === "Approved" || selectedRequest.leave_details.status === "Rejected"} startContent={<LuBan/>} {...uniformStyle({color: "danger"})}>Cancel</Button>
            </Section>
        </>}/>}

    </section>);
}

export default Page;
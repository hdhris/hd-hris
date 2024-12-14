"use client"
import React, {Fragment, Key, useCallback, useEffect, useMemo, useState} from 'react';
import {Button} from "@nextui-org/button";
import {usePaginateQuery, useQuery} from "@/services/queries";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import DataDisplay from "@/components/common/data-display/data-display";
import {
    approval_status_color_map,
    FilterItems,
    TableConfigurations
} from "@/components/admin/leaves/table-config/approval-tables-configuration";
import RequestForm from "@/components/admin/leaves/request-form/form/RequestForm";
import {LeaveRequest} from "@/types/leaves/LeaveRequestTypes";
import {Avatar, Chip, cn, ScrollShadow, Spinner, Textarea, User} from '@nextui-org/react';
import Typography, {Section} from "@/components/common/typography/Typography";
import {capitalize} from "@nextui-org/shared-utils";
import UserMail from "@/components/common/avatar/user-info-mail";
import CardTable from "@/components/common/card-view/card-table";
import BorderCard from "@/components/common/BorderCard";
import {LuBan, LuCalendarRange, LuPencil, LuSendHorizonal} from "react-icons/lu";
import {icon_color, icon_size_sm} from "@/lib/utils";
import {getColor} from "@/helper/background-color-generator/generator";
import UserAvatarTooltip from "@/components/common/avatar/user-avatar-tooltip";
import {useSession} from "next-auth/react";
import {HolidayData} from "@/types/attendance-time/HolidayTypes";
import CardView from "@/components/common/card-view/card-view";
import {toGMT8} from "@/lib/utils/toGMT8";
import {TextAreaProps} from "@nextui-org/input";
import {Comment} from "@/types/leaves/leave-evaluators-types";
import {axiosInstance} from "@/services/fetcher";
import {useToast} from "@/components/ui/use-toast";
import {v4 as uuidv4} from "uuid"
import {isEqual} from "lodash";

interface LeaveRequestPaginate {
    data: LeaveRequest[]
    totalItems: number
}

function Page() {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [page, setPage] = useState<number>(1)
    const [rows, setRows] = useState<number>(5)
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest>()
    const [reply, setReply] = useState<string | null>(null)
    const [isReplySubmit, setIsReplySubmit] = useState<boolean>(false)
    const [comment, setComment] = useState<string | null>()
    const [commentId, setCommentId] = useState<string>()
    const [loading, setLoading] = useState<boolean>(false)
    const {data, isLoading} = usePaginateQuery<LeaveRequestPaginate>("/api/admin/leaves/requests", page, rows, {
        refreshInterval: 3000
    });
    const {
        data: holiday, isLoading: holidayLoading
    } = useQuery<HolidayData>(`/api/admin/attendance-time/holidays/${new Date().getFullYear()}`);

    const session = useSession()
    const {toast} = useToast()
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

    useEffect(() => {
        const id = selectedRequest?.id
        if (!isEqual(allRequests, selectedRequest)) {
            setSelectedRequest(allRequests.find((item) => item.id === id))
        }
    }, [allRequests, selectedRequest]);

    const signatories = useMemo(() => {
        if (selectedRequest) {
            const users = selectedRequest?.evaluators.users
            const comments = selectedRequest?.evaluators.comments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            // Extract `comment_content` in the same order as `comments`
            const comment_content = comments?.map((comment) => users?.find((user) => Number(user.id) === Number(comment.author))!).filter(Boolean)!; // Filter out any undefined users (in case no match is found)
            const evaluators = selectedRequest?.evaluators

            return {
                users, comment_content, evaluators, comments
            }
        }
        return null
    }, [selectedRequest])

    const handleOnSelected = (key: Key) => {
        const selected = allRequests.find(item => item.id === Number(key))
        setSelectedRequest(selected)
        // console.log("Selected: ", selected)
    }

    const onCommentSend = () => {

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


    console.log("Signatories: ", signatories)
    const startDate = toGMT8(selectedRequest?.leave_details.start_date);
    const endDate = toGMT8(selectedRequest?.leave_details.end_date);

    const today = toGMT8();
    const leave_progress = useMemo(() => {
        if (today.isBefore(startDate, 'day')) {
            return "Not Started";
        } else if (today.isAfter(endDate, 'day')) {
            return "Finished";
        } else {
            return "On Going";
        }
    }, [endDate, startDate, today])

    const handleOnReply = async (id: string) => {
        const userReply = signatories?.comments?.find(item => item.id === id)


        const submitReply: Comment = {
            ...userReply!,
            applicant_email: selectedRequest?.email!,
            leave_id: selectedRequest?.id!,
            replies: [{
                id: uuidv4(),
                author: String(session.data?.user.employee_id),
                message: reply!,
                timestamp: toGMT8().toISOString()
            }]
        }
        setIsReplySubmit(true)
        try {
            const res = await axiosInstance.post("/api/admin/leaves/requests/reply", submitReply)
            if (res.status !== 200) {
                toast({
                    title: "Error", description: "Could not comment at this time. Try again later.", variant: "danger"
                })
                return
            }
            setComment("")
        } catch (error) {
            console.log("Error: ", error)
            toast({
                title: "Error", description: "Server error. Try again later", variant: "danger"
            })
        }
        setIsReplySubmit(false)
    }

    const handleOnSend = async (comment: string) => {
        setLoading(true)
        const userCommentDetails = signatories?.users?.find(item => Number(item.id) === Number(session.data?.user.employee_id))
        const userComment: Comment = {
            applicant_email: selectedRequest?.email!,
            leave_id: selectedRequest?.id!,
            id: uuidv4(),
            author: String(userCommentDetails?.id),
            timestamp: toGMT8().toISOString(),
            message: comment,
            replies: []
        }

        try {
            const res = await axiosInstance.post("/api/admin/leaves/requests/comment", userComment)
            if (res.status !== 200) {
                toast({
                    title: "Error", description: "Could not comment at this time. Try again later.", variant: "danger"
                })
                return
            }
            setComment("")
        } catch (error) {
            console.log("Error: ", error)
            toast({
                title: "Error", description: "Server error. Try again later", variant: "danger"
            })
        }
        setLoading(false)
    }

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
                label: "Leave Progress Status", value: <Chip variant="flat"
                                                             color={leave_progress === "Not Started" ? "danger" : leave_progress === "Finished" ? "success" : "warning"}>{leave_progress}</Chip>
            }, {
                label: "Created By", value: <>
                    <UserAvatarTooltip user={{
                        name: selectedRequest?.created_by.name,
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

                <ScrollShadow size={20} className="min-h-32 max-h-72">
                    <div className="flex flex-col gap-10 h-full mb-4">
                        {selectedRequest.evaluators.comments.map(comment => {
                            const commenters = selectedRequest.evaluators.users.filter(commenter => Number(commenter.id) === Number(comment.author))
                            const comments = commenters.map(item => ({
                                ...item, ...comment
                            }))


                            return (<Fragment key={comment.id}>{comments.map(comment_thread => {
                                return (<div key={comment_thread.id} className="flex flex-col gap-2">
                                        <User
                                            className="justify-start p-2"
                                            name={<Typography
                                                className="text-sm font-semibold">{comment_thread.name}</Typography>}
                                            description={<Typography
                                                className="text-sm font-semibold !text-default-400/75">
                                                {capitalize(comment_thread.role)}
                                            </Typography>}
                                            avatarProps={{
                                                src: comment_thread.picture,
                                                classNames: {base: '!size-6'},
                                                isBordered: true,
                                            }}
                                        />

                                        <div className="flex flex-col gap-2 ml-2">
                                            <Typography
                                                className="text-medium indent-4">{comment_thread.message}</Typography>
                                            <div className="flex gap-2">
                                                <Typography
                                                    className="text-sm !text-default-400/75">{toGMT8(comment_thread.timestamp).format("MM/DD/YYYY hh:mm A")}</Typography>
                                                <Typography
                                                    className="text-sm font-semibold cursor-pointer !text-default-400/75"
                                                    onClick={() => {
                                                        setCommentId(comment_thread.id)
                                                        setReply("")
                                                    }}>Reply</Typography>
                                            </div>
                                        </div>
                                        {comment_thread.replies.map(replies => {
                                            const replier = selectedRequest.evaluators.users.filter(item => Number(item.id) === Number(replies.author))
                                            const reply = replier.map(item => ({
                                                ...item, ...replies
                                            }))
                                            return (reply.map(reply => {
                                                return (<div key={replies.id} className="ms-10 my-3">
                                                    <User
                                                        className="justify-start p-2"
                                                        name={<Typography
                                                            className="text-sm font-semibold">{reply.name}</Typography>}
                                                        description={<Typography
                                                            className="text-sm font-semibold !text-default-400/75">
                                                            {capitalize(reply.role)}
                                                        </Typography>}
                                                        avatarProps={{
                                                            src: reply.picture,
                                                            classNames: {base: '!size-6'},
                                                            isBordered: true,
                                                        }}
                                                    />
                                                    <div className="flex flex-col gap-2 ml-4">
                                                        <Typography
                                                            className="text-medium indent-4">{replies.message}</Typography>
                                                        <div className="flex gap-2">
                                                            <Typography
                                                                className="text-sm !text-default-400/75">{toGMT8(replies.timestamp).format("MM/DD/YYYY hh:mm A")}</Typography>
                                                            <Typography
                                                                className="text-sm font-semibold cursor-pointer !text-default-400/75"
                                                                onClick={() => {
                                                                    setCommentId(comment_thread.id)
                                                                    setReply("")
                                                                }}>Reply</Typography>
                                                        </div>

                                                    </div>
                                                </div>)
                                            }))
                                        })}
                                        {commentId === comment_thread.id && <div className="ms-10">
                                            <CommentInput
                                                placeholder="Reply..."
                                                isSending={isReplySubmit}
                                                value={reply || ""}
                                                onSend={handleOnReply.bind(null, comment_thread.id)}
                                                onValueChange={(value) => {
                                                    setReply(value);
                                                }}
                                            />
                                        </div>}
                                    </div>

                                )
                            })}</Fragment>)
                        })}
                    </div>
                </ScrollShadow>
            <div className="flex gap-2 items-center">
                <CommentInput isSending={loading}
                              onSend={handleOnSend.bind(null, comment!)}
                              value={comment!}
                              onValueChange={(value) => {
                                  setComment(value)
                              }}/>
            </div>
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
                <></>
                {/*<div className="flex justify-between items-center">*/}
                {/*    <User*/}
                {/*        className="justify-start p-2"*/}
                {/*        name={<Typography className="text-sm font-semibold">{reviewer?.name}</Typography>}*/}
                {/*        description={<Typography className="text-sm font-semibold !text-default-400/75">*/}
                {/*            {reviewer?.email}*/}
                {/*        </Typography>}*/}
                {/*        avatarProps={{*/}
                {/*            src: reviewer?.picture, classNames: {base: '!size-6'}, isBordered: true,*/}
                {/*        }}*/}
                {/*    />*/}
                {/*    {!reviewer_details?.decision.is_reviewed && is_reviewer && <div className="flex gap-2">*/}
                {/*        <Button size="sm" radius="full" isIconOnly variant="light"*/}
                {/*            // onClick={handleReview.bind(null, item.id, "Approved")}*/}
                {/*        >*/}
                {/*            <LuThumbsUp className={cn("text-success", icon_size_sm)}/>*/}
                {/*        </Button>*/}
                {/*        <Button size="sm" radius="full" isIconOnly variant="light"*/}
                {/*            // onClick={handleReview.bind(null, item.id, "Rejected")}*/}
                {/*        >*/}
                {/*            <LuThumbsDown className={cn("text-danger", icon_size_sm)}/>*/}
                {/*        </Button>*/}
                {/*    </div>}*/}
                {/*</div>*/}

                {/*/!*{reviewer?.id === reviewer_details?.reviewed_by && CardD}*!/*/}
                {/*{reviewer_details?.decision.is_reviewed && <CardTable data={[{*/}
                {/*    label: "Status",*/}
                {/*    value: reviewer_details?.decision.is_reviewed ?*/}
                {/*        <LuCheck className={cn("text-success", icon_size_sm)}/> :*/}
                {/*        <LuX className={cn("text-danger", icon_size_sm)}/>*/}
                {/*}, {*/}
                {/*    label: "Decision Date", value: dayjs(reviewer_details?.decision.decisionDate).format("YYYY-MM-DD")*/}
                {/*}, {*/}
                {/*    label: "Rejected Reason",*/}
                {/*    value: reviewer_details?.decision.rejectedReason ? reviewer_details?.decision.rejectedReason : ""*/}
                {/*},]}/>}*/}
            </BorderCard>
            <BorderCard heading={<Typography className="text-medium">Approved Details</Typography>}>
                <div className="flex justify-between items-center">
                    {/*<User*/}
                    {/*    className="justify-start p-2"*/}
                    {/*    name={<Typography className="text-sm font-semibold">{approver?.name}</Typography>}*/}
                    {/*    description={<Typography className="text-sm font-semibold !text-default-400/75">*/}
                    {/*        {approver?.email}*/}
                    {/*    </Typography>}*/}
                    {/*    avatarProps={{*/}
                    {/*        src: approver?.picture, classNames: {base: '!size-6'}, isBordered: true,*/}
                    {/*    }}*/}
                    {/*/>*/}
                    {/*{!approver_details?.decision.is_approved && is_approver && <div className="flex gap-2">*/}
                    {/*    <Button size="sm" radius="full" isIconOnly variant="light"*/}
                    {/*        // onClick={handleReview.bind(null, item.id, "Approved")}*/}
                    {/*    >*/}
                    {/*        <LuThumbsUp className={cn("text-success", icon_size_sm)}/>*/}
                    {/*    </Button>*/}
                    {/*    <Button size="sm" radius="full" isIconOnly variant="light"*/}
                    {/*        // onClick={handleReview.bind(null, item.id, "Rejected")}*/}
                    {/*    >*/}
                    {/*        <LuThumbsDown className={cn("text-danger", icon_size_sm)}/>*/}
                    {/*    </Button>*/}
                    {/*</div>}*/}
                </div>
                {/*{reviewer?.id === reviewer_details?.reviewed_by && CardD}*/}
                {/*{approver_details?.decision.is_approved && <CardTable data={[{*/}
                {/*    label: "Status",*/}
                {/*    value: approver_details?.decision.is_approved ?*/}
                {/*        <LuCheck className={cn("text-success", icon_size_sm)}/> :*/}
                {/*        <LuX className={cn("text-danger", icon_size_sm)}/>*/}
                {/*}, {*/}
                {/*    label: "Decision Date", value: dayjs(approver_details?.decision.decisionDate).format("YYYY-MM-DD")*/}
                {/*}, {*/}
                {/*    label: "Rejected Reason",*/}
                {/*    value: approver_details?.decision.rejectedReason ? approver_details?.decision.rejectedReason : ""*/}
                {/*},]}/>}*/}
            </BorderCard>

        </>} onDanger={<>
            <Section className="ms-0" title="Edit Leave"
                     subtitle="Edit the leave request">
                <Button
                    isDisabled={selectedRequest.leave_details.status === "Approved" || selectedRequest.leave_details.status === "Rejected"}
                    startContent={<LuPencil/>}{...uniformStyle()}>Edit</Button>
            </Section>
            <hr className="border border-destructive/20"/>
            <Section className="ms-0" title="Extend Leave"
                     subtitle="Extend the leave request">
                <Button
                    isDisabled={selectedRequest.leave_details.status === "Approved" || selectedRequest.leave_details.status === "Rejected"}
                    startContent={<LuCalendarRange/>} {...uniformStyle()}>Extend</Button>
            </Section>
            <hr className="border border-destructive/20"/>
            <Section className="ms-0" title="Cancel"
                     subtitle="Cancel the leave request">
                <Button
                    isDisabled={selectedRequest.leave_details.status === "Approved" || selectedRequest.leave_details.status === "Rejected"}
                    startContent={<LuBan/>} {...uniformStyle({color: "danger"})}>Cancel</Button>
            </Section>
        </>}/>}

    </section>)

}

export default Page;

interface CommentInputProps extends TextAreaProps {
    onSend?: () => void,
    isSending?: boolean
    placeholder?: string
}

const CommentInput = ({onSend, isSending, placeholder, ...rest}: CommentInputProps) => {
    const session = useSession()
    return (<div className="flex gap-2 w-full">
        <Avatar
            classNames={{
                base: "h-7 w-7"
            }}
            src={session.data?.user?.image}
        />
        <Textarea variant="bordered"
                  color="primary"
                  maxRows={3}
                  placeholder={placeholder || "Add comment..."}
                  {...rest}
        />
        <Button variant="light" isIconOnly size="sm" className="self-end" onClick={onSend}>
            {isSending ? <Spinner size="sm"/> : <LuSendHorizonal
                className={cn(icon_size_sm, icon_color)}
            />}

        </Button>
    </div>)
}
"use client"
import React, {Fragment, Key, useCallback, useEffect, useMemo, useState} from 'react';
import {Button} from "@nextui-org/button";
import {usePaginateQuery} from "@/services/queries";
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
import {Chip, ScrollShadow, Textarea, User} from '@nextui-org/react';
import Typography, {Section} from "@/components/common/typography/Typography";
import {capitalize} from "@nextui-org/shared-utils";
import UserMail from "@/components/common/avatar/user-info-mail";
import CardTable from "@/components/common/card-view/card-table";
import BorderCard from "@/components/common/BorderCard";
import {LuBan, LuCalendarRange, LuInfo, LuPencil} from "react-icons/lu";
import {getColor} from "@/helper/background-color-generator/generator";
import UserAvatarTooltip from "@/components/common/avatar/user-avatar-tooltip";
import CardView from "@/components/common/card-view/card-view";
import {toGMT8} from "@/lib/utils/toGMT8";
import {Comment} from "@/types/leaves/leave-evaluators-types";
import {axiosInstance} from "@/services/fetcher";
import {useToast} from "@/components/ui/use-toast";
import {v4 as uuidv4} from "uuid"
import {isEqual} from "lodash";
import Comments from "@/components/common/comments/comments";
import {useUserInfo} from "@/lib/utils/getEmployeInfo";
import {OvertimeEntry} from "@/types/attendance-time/OvertimeType";
import AcceptReject from "@/components/actions/AcceptReject";
import Evaluators from '@/components/common/evaluators/evaluators';

interface LeaveRequestPaginate {
    data: LeaveRequest[]
    totalItems: number
}


function Page() {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [page, setPage] = useState<number>(1)
    const [rows, setRows] = useState<number>(5)
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest>()
    const [isReplySubmit, setIsReplySubmit] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const {data, isLoading, mutate} = usePaginateQuery<LeaveRequestPaginate>("/api/admin/leaves/requests", page, rows, {
        refreshInterval: 3000
    });
    const currentUser = useUserInfo()
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
            const users = selectedRequest?.evaluators.users.map(({id, ...rest}) => ({id: Number(id), ...rest}))
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

    // console.log("User: ", signatories?.users)

    const handleOnSelected = (key: Key) => {
        const selected = allRequests.find(item => item.id === Number(key))
        setSelectedRequest(selected)
        // console.log("Selected: ", selected)
    }

    // const onCommentSend = () => {
    //
    // }

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


    // console.log("Signatories: ", signatories)
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

    const handleOnReply = async (id: string, message: string) => {

        const userReply = signatories?.comments?.find(item => item.id === id)
        const submitReply: Comment = {
            ...userReply!, applicant_email: selectedRequest?.email!, leave_id: selectedRequest?.id!, replies: [{
                id: uuidv4(), author: String(currentUser?.id), message: message, timestamp: toGMT8().toISOString()
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
        const userCommentDetails = signatories?.users?.find(item => Number(item.id) === Number(currentUser?.id))
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
        } catch (error) {
            console.log("Error: ", error)
            toast({
                title: "Error", description: "Server error. Try again later", variant: "danger"
            })
        }
        setLoading(false)
    }

    const getUserById = useMemo(() => {
        return (id: number) => {
            return signatories?.evaluators?.users.find((user) => Number(user.id) === id || user.employee_id === id);
        };
    }, [signatories]);

    const currentEvaluatingOrderNumber = useMemo(() => {
        let orderNumber = 0;
        if (signatories?.evaluators?.evaluators?.length) {
            const sortedEvaluators = signatories.evaluators.evaluators.sort((a, b) => a.order_number - b.order_number);

            for (const item of sortedEvaluators) {
                if (item.decision.is_decided === null) {
                    orderNumber = item.order_number;
                    break;
                }
            }
        }
        return orderNumber;
    }, [signatories]);

    const onUpdate = (approval: string)=> {}

    return (<DataDisplay
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
        onView={selectedRequest && <CardView
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
                label: "Duration Of Leave", value: selectedRequest.leave_details.total_days
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
            {signatories?.users?.some(user => Number(user.id) === currentUser?.id) && <>
                <Section className="ms-0" title="Comment"
                         subtitle="Comment of employee in regard to leave request."/>
                <Comments
                    isSendingReply={isReplySubmit}
                    isSendingComment={loading}
                    comments={selectedRequest.evaluators.comments}
                    users={selectedRequest.evaluators.users}
                    onComment={async (value) => {
                        await handleOnSend(value)
                    }}
                    isClearableComment
                    isClearableReply
                    onReply={async (value, reply) => {
                        await handleOnReply(value, reply)
                    }}
                />
                <hr className="border border-default-400 space-y-2"/>
            </>}

            <Section className="ms-0" title="Reason" subtitle="Reason of employee in regard to leave request."/>
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
            <Evaluators type="Leave Request" evaluation={selectedRequest.evaluators || []}
                        selectedEmployee={selectedRequest}
                        mutate={mutate}
                        evaluatorsApi={'/api/admin/leaves/requests/evaluation-decision'}
            />
        </>} onDanger={<>
            {/*<Section className="ms-0" title="Edit Leave"*/}
            {/*         subtitle="Edit the leave request">*/}
            {/*    <Button*/}
            {/*        isDisabled={selectedRequest.leave_details.status === "Approved" || selectedRequest.leave_details.status === "Rejected"}*/}
            {/*        startContent={<LuPencil/>}{...uniformStyle()}>Edit</Button>*/}
            {/*</Section>*/}
            {/*<hr className="border border-destructive/20"/>*/}
            {/*<Section className="ms-0" title="Extend Leave"*/}
            {/*         subtitle="Extend the leave request">*/}
            {/*    <Button*/}
            {/*        isDisabled={selectedRequest.leave_details.status === "Approved" || selectedRequest.leave_details.status === "Rejected"}*/}
            {/*        startContent={<LuCalendarRange/>} {...uniformStyle()}>Extend</Button>*/}
            {/*</Section>*/}
            {/*<hr className="border border-destructive/20"/>*/}
            <Section className="ms-0" title="Cancel"
                     subtitle="Cancel the leave request">
                <Button
                    isDisabled={selectedRequest.leave_details.status === "Approved" || selectedRequest.leave_details.status === "Rejected"}
                    startContent={<LuBan/>} {...uniformStyle({color: "danger"})}>Cancel</Button>
            </Section>
        </>}/>}
    />)

}

export default Page;

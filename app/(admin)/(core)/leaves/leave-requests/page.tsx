"use client"
import React, {Fragment, Key, useCallback, useEffect, useMemo, useState} from 'react';
import {Button} from "@nextui-org/button";
import {usePaginateQuery} from "@/services/queries";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import DataDisplay from "@/components/common/data-display/data-display";
import {
    approval_status_color_map, FilterItems, TableConfigurations
} from "@/components/admin/leaves/table-config/approval-tables-configuration";
import RequestForm, {normalizeDate} from "@/components/admin/leaves/request-form/form/RequestForm";
import {LeaveRequest} from "@/types/leaves/LeaveRequestTypes";
import {Chip, DateValue, ScrollShadow} from '@nextui-org/react';
import Typography, {Section} from "@/components/common/typography/Typography";
import {capitalize} from "@nextui-org/shared-utils";
import UserMail from "@/components/common/avatar/user-info-mail";
import CardTable from "@/components/common/card-view/card-table";
import BorderCard from "@/components/common/BorderCard";
import {getColor} from "@/helper/background-color-generator/generator";
import UserAvatarTooltip from "@/components/common/avatar/user-avatar-tooltip";
import CardView from "@/components/common/card-view/card-view";
import {toGMT8} from "@/lib/utils/toGMT8";
import {Comment} from "@/types/leaves/leave-evaluators-types";
import {axiosInstance} from "@/services/fetcher";
import {v4 as uuidv4} from "uuid"
import {isEqual} from "lodash";
import Comments from "@/components/common/comments/comments";
import {useUserInfo} from "@/lib/utils/getEmployeInfo";
import Evaluators from '@/components/common/evaluators/evaluators';
import useDocumentTitle from "@/hooks/useDocumentTitle";
import {Dayjs} from "dayjs";
import toast from "react-hot-toast"
import {AnimatedList} from "@/components/ui/animated-list";
import {getDownloadUrl} from "@edgestore/react/utils";
import FileAttachments from "@/components/common/attachments/file-attachment-card/file-attachments";
import {pluralize} from "@/helper/pluralize/pluralize";
import {LuBan, LuPencil} from "react-icons/lu";
import {useHolidays} from "@/helper/holidays/unavailableDates";
import {CalendarDate} from "@internationalized/date";
import showDialog from "@/lib/utils/confirmDialog";
import {AxiosError} from "axios";
import {Alert} from "@nextui-org/alert";
import {formatDaysToReadableTime} from "@/lib/utils/timeFormatter";

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
    const [today, setToday] = useState<Dayjs>(toGMT8())
    const {isDateUnavailable} = useHolidays()
    // const [leaveProgress, setLeaveProgress] = useState("")
    const [isCancelling, setIsCancelling] = useState<boolean>(false)
    const {data, isLoading, mutate} = usePaginateQuery<LeaveRequestPaginate>("/api/admin/leaves/requests", page, rows, {
        refreshInterval: 3000
    });

    useDocumentTitle("Leave Requests")
    const currentUser = useUserInfo()
    // const {toast} = useToast()
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
                schedule: item.schedule,
                leave_type: {
                    id: item.leave_type.id,
                    name: item.leave_type.name,
                    code: item.leave_type.code,
                    attachments: item.leave_type.attachments
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
                leave_credit: item.leave_credit,
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

    const hasSchedule = (startDate: string | Date, dayOfWeekSchedule: string[]): boolean => {
        const dayString = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

        // Convert startDate to Day.js object in GMT+8 and get the current date in GMT+8
        const start = toGMT8(startDate);
        // const end = toGMT8();

        const schedDate = start.format("YYYY-MM-DD HH:mm:ss")


        // console.log("Start Sched: ", start.format("YYYY-MM-DD HH:mm:ss"));
        const dayOfWeek = start.day(); // dayjs gives 0 (Sunday) to 6 (Saturday)
        const dayStr = dayString[dayOfWeek]; // Map to the corresponding day string

        const calendarDate = new CalendarDate(start.year(), start.month(), start.date())
        const isDateUnAvailable = isDateUnavailable(calendarDate)

        console.log("IsDateUnAvailable: ", isDateUnAvailable);
        console.log("Calendar Date: ", calendarDate.toString());
        console.log({
            schedDate: schedDate, isDateUnavailable: isDateUnavailable, isSchedule: dayOfWeekSchedule.includes(dayStr)

        })
        return !dayOfWeekSchedule.includes(dayStr) || isDateUnAvailable
        // console.log("Start: ", start.format("YYYY-MM-DD HH:mm:ss"));
        // console.log("End: ", end.format("YYYY-MM-DD HH:mm:ss"));
        // // Iterate through each day between start and end date
        // for (let currentDate = start; currentDate.isBefore(end) || currentDate.isSame(end, "day"); currentDate = currentDate.add(1, "day")) {
        //     // Get the day of the week for the current date
        //     const dayOfWeek = currentDate.day(); // dayjs gives 0 (Sunday) to 6 (Saturday)
        //     const dayStr = dayString[dayOfWeek]; // Map to the corresponding day string
        //
        //     console.log({dayOfWeek, dayStr});
        //     const isDateUnAvailable = isDateUnavailable(new CalendarDate(currentDate.year(), currentDate.month(), currentDate.date()))
        //     console.log({dayStr, isDateUnAvailable})
        //     // Check if the current day matches the schedule
        //     if (!dayOfWeekSchedule.includes(dayStr) || isDateUnavailable(new CalendarDate(currentDate.year(), currentDate.month(), currentDate.date()))) {
        //         return true; // A match is found, return true immediately
        //     }
        // }
        //
        // return false; // No matches found in the range
    };

    const handleOnSelected = (key: Key) => {
        const selected = allRequests.find(item => item.id === Number(key))
        setSelectedRequest(selected)
        console.log("Selected: ", selected)
    }

    // const onCommentSend = () => {
    //
    // }

    const onOpenDrawer = useCallback(() => {
        setIsOpen(true)
    }, [setIsOpen])

    SetNavEndContent(() => {
        return (<>
            <Button {...uniformStyle()} onPress={onOpenDrawer}>
                File A Leave
            </Button>
            <RequestForm onOpen={setIsOpen} isOpen={isOpen}/>
        </>)
    })

    useEffect(() => {
        const updateDate = () => setToday(toGMT8());
        updateDate(); // Set initial date
        const interval = setInterval(updateDate, 60 * 1000); // Update every minute

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    const leave_progress = useMemo(() => {
        const startDate = toGMT8(toGMT8(selectedRequest?.leave_details.start_date).format("YYYY-MM-DD HH:mm:ss"));
        const endDate = toGMT8(selectedRequest?.leave_details.end_date);
        const isApprovedLeave = selectedRequest?.leave_details.status;
        // console.log("isApproved: ", isApprovedLeave)
        if (selectedRequest) {
            console.log({isApprovedLeave})
            if(isApprovedLeave === 'cancelled'){
                console.log("Cancelled")
                return "Cancelled"
            }
            else if (today.isBefore(startDate)) { // No 'day' argument to include time in the comparison
                console.log("Not Started");
                return "Not Started";
            } else if (today.isAfter(endDate, 'day')) {
                console.log("Finished");
                return "Finished";
            } else if (isApprovedLeave) {
                console.log("On Going");
                return "On Going";
            }
            else {
                console.log("Not Yet Decided");
                return "Not Yet Decided";
            }
        }

        return ""

    }, [selectedRequest, today]);


    const countAvailableDays = useCallback((startDate: DateValue, id: number): number => {
        let availableDaysCount = 0;
        const schedule = allRequests.find((item) => item.id === Number(id))?.schedule;

        const uniqueDaysJson = schedule?.days_json?.flat() || [];

        // Normalize start and end dates
        let currentDate = normalizeDate(new Date(startDate.year, startDate.month - 1, startDate.day));
        const endDateCopy = normalizeDate(new Date(toGMT8().format("YYYY-MM-DD")));

        console.log("currentDate: ", currentDate)
        console.log("endDateCopy: ", endDateCopy)
        // Loop through each day from startDate to endDate
        while (currentDate <= endDateCopy) {
            // Check if the current date is available using the dateUnavailable function
            if (!hasSchedule(currentDate, uniqueDaysJson)) {
                availableDaysCount++;

            }

            // Move to the next day

            currentDate.setDate(currentDate.getDate() + 1);

        }

        console.log("Available Days: ", availableDaysCount)
        // console.log("hasSched ", {hasSched})
        return availableDaysCount - 1;
    }, [allRequests, hasSchedule]);

    const handleCancel = useCallback(async (id: number, startDate: string, endDate: string) => {
        setIsCancelling(true);

        let deductLeaveDuration: number;
        const start = toGMT8(startDate)
        const end = toGMT8()
        if (leave_progress === "Not Started") {
            deductLeaveDuration = selectedRequest?.leave_details.total_days!

        }else {
            const workingDays = countAvailableDays(new CalendarDate(start.year(), start.month(), start.date()), id);

            const breakTime = selectedRequest?.schedule.ref_batch_schedules.break_min ?? 0;

// Check if the end time overlaps with lunch break (12:00 PM - 1:00 PM)
            const passesLunchBreak = end.hour() >= 13 || (end.hour() === 12 && end.minute() >= 0);
            const isLunchBreak = (end.hour() === 12 && end.minute() >= 0) || (end.hour() === 13 && end.minute() < 60);

// Calculate work duration in minutes
            const workDuration = start.diff(end, 'minutes', true);
            let totalWorkHours = Math.abs(workDuration) - breakTime;

// Adjust leave difference for lunch break
            let leaveDif = Math.abs(start.diff(end, "minutes"));

            if (isLunchBreak) {
                // If the period overlaps with lunch break, exclude the lunch break time (12:00 PM - 1:00 PM)
                const lunchBreakStart = start.clone().hour(12).minute(0).second(0);
                const lunchBreakEnd = start.clone().hour(13).minute(0).second(0);

                if (end.isAfter(lunchBreakStart) && start.isBefore(lunchBreakEnd)) {
                    // Calculate overlap duration with lunch break
                    const overlapStart = end.isAfter(lunchBreakStart) ? lunchBreakStart : start;
                    const overlapEnd = end.isBefore(lunchBreakEnd) ? end : lunchBreakEnd;

                    const lunchBreakDuration = overlapStart.diff(overlapEnd, 'minutes');
                    leaveDif -= Math.abs(lunchBreakDuration);
                }
            }

            if (workingDays < 0) {
                deductLeaveDuration = leaveDif;
            } else {
                const used = (workingDays * totalWorkHours) + leaveDif
                deductLeaveDuration = Number(used / 1440);
            }

            // Debugging logs
            console.log("End: ", end.format("YYYY-MM-DD HH:mm:ss"));
            console.log("Passes Lunch Break: ", passesLunchBreak);
            console.log("Is Lunch Break: ", isLunchBreak);
            console.log("Working Days: ", workingDays);
            console.log("Deduct Leave Duration: ", deductLeaveDuration);
        }


        // Find the schedule for the request

        // Ensure uniqueDaysJson is flattened


        try {
            const cancelLeaveRequest = {
                id: selectedRequest?.id,
                employee_id: selectedRequest?.employee_id,
                leave_credit_id: selectedRequest?.leave_credit.id,
                used_leaved: deductLeaveDuration
            }

            console.log("Cancel: ", cancelLeaveRequest);
            const result = await showDialog({
                title: "Cancel Leave Request", message: (<div className="flex flex-col gap-2">
                        <Typography>
                            Are you sure you want to cancel the leave request for <Typography as="span"
                                                                                              className="font-semibold">{selectedRequest?.name}</Typography>?
                        </Typography>
                        <Alert description="This action cannot be undone. Do you want to proceed?" color="danger"/>
                    </div>)
            });


            if (result === "yes") {
                const res = await axiosInstance.post("/api/admin/leaves/requests/cancel", cancelLeaveRequest);
                if (res.status === 200) {
                    toast.success(res.data.message);
                }
            }

        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error?.response?.data.message || "");
            }
        }

        console.log("Cancel Used Days: ", deductLeaveDuration);
        setIsCancelling(false);
    }, [countAvailableDays, leave_progress, selectedRequest]);

    // useEffect(() => {
    //     const isApprovedLeave = selectedRequest?.leave_details.status;console.log()
    //     if (selectedRequest) {
    //         if (today.isBefore(startDate)) { // No 'day' argument to include time in the comparison
    //             console.log("Not Started");
    //             setLeaveProgress("Not Started");
    //         } else if (today.isAfter(endDate, 'day')) {
    //             console.log("Finished");
    //             setLeaveProgress("Finished");
    //         } else if (isApprovedLeave) {
    //             console.log("On Going");
    //             setLeaveProgress("On Going");
    //         } else {
    //             console.log("Not Yet Decided");
    //             setLeaveProgress("Not Yet Decided");
    //         }
    //     }
    //
    //     setLeaveProgress("")
    //
    // }, [endDate, selectedRequest, startDate, today]);


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
                toast.error("Could not comment at this time. Try again later.")
                return
            }
        } catch (error) {
            console.log("Error: ", error)
            toast.error("Server error. Try again later")
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
                toast.error("Could not comment at this time. Try again later.")
                return
            }
        } catch (error) {
            console.log("Error: ", error)
            toast.error("Server error. Try again later")
        }
        setLoading(false)
    }


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
            className="w-[400px]"
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
                label: "Start Date",
                value: toGMT8(selectedRequest.leave_details.start_date).format("MMM DD, YYYY hh:mm A")
            }, {
                label: "End Date", value: toGMT8(selectedRequest.leave_details.end_date).format("MMM DD, YYYY hh:mm A")
            }, {
                label: "Duration Of Leave", value:selectedRequest.leave_details.total_days ?  formatDaysToReadableTime(selectedRequest.leave_details.total_days) : 0
            }, {
                label: "Leave Progress Status", value: <Chip variant="flat"
                                                             color={leave_progress === "Not Started" || leave_progress === "Cancelled" || leave_progress === "Not Yet Decided" ? "danger" : leave_progress === "Finished" ? "success" : "warning"}>{leave_progress}</Chip>
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

            {selectedRequest.leave_type.attachments?.length! > 0 && <ScrollShadow className="max-h-[400px]">
                <hr className="border border-default-400 space-y-2"/>
                <Section
                    className="ms-0"
                    title={`File ${pluralize(selectedRequest.leave_type.attachments?.length || 0, "Attachment", false)}`}
                    subtitle={`Below ${pluralize(selectedRequest.leave_type.attachments?.length || 0, "attachment", false, true)} submitted by the employee.`}
                />

                <AnimatedList>
                    {selectedRequest.leave_type.attachments?.map((item, index) => {
                        const download = getDownloadUrl(item.url!);
                        return <FileAttachments key={index}
                                                fileName={item.name}
                                                fileSize={item.size}
                                                fileType={item.type}
                                                downloadUrl={download}
                        />

                    })}
                </AnimatedList>
            </ScrollShadow>}
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
        </>}
            onDanger={<>
                {/*<Section className="ms-0" title="Edit Leave"*/}
                {/*         subtitle="Edit the leave request">*/}
                {/*    <Button*/}
                {/*        isDisabled={selectedRequest.leave_details.status !== "pending"}*/}
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
                        isDisabled={selectedRequest.leave_details.status === "pending" || selectedRequest.leave_details.status === "rejected" || leave_progress === "Finished" || leave_progress === "Cancelled"}
                        startContent={<LuBan/>} {...uniformStyle({color: "danger"})}
                        onPress={() => handleCancel(selectedRequest?.id, selectedRequest?.leave_details.start_date, selectedRequest?.leave_details.end_date)}>Cancel</Button>
                </Section>
            </>}
        />}
    />)

}

export default Page;


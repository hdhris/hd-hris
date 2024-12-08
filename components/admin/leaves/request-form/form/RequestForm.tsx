"use client"
import React, {useCallback, useEffect, useState} from 'react';
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import EmployeeListForm from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";
import LeaveTypeSelection from "@/components/admin/leaves/request-form/LeaveTypeSelection";
import Typography from "@/components/common/typography/Typography";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {Form} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {LeaveRequestFormValidation} from "@/helper/zodValidation/leaves/request-form/LeaveRequestFormValidation";
import {zodResolver} from "@hookform/resolvers/zod";
import {getLocalTimeZone, today, isWeekend, DateValue, parseDate, CalendarDate} from "@internationalized/date";
import {useEmployeesLeaveStatus} from "@/services/queries";
import {EmployeeLeavesStatus} from "@/types/leaves/LeaveRequestTypes";
import {EditCreditProp} from "@/app/(admin)/(core)/leaves/leave-credits/page";
import FormDrawer from '@/components/common/forms/FormDrawer';
import {axiosInstance} from "@/services/fetcher";
import {AxiosError} from "axios";
import {useToast} from "@/components/ui/use-toast";
import {useHolidays} from "@/helper/holidays/unavailableDates";
import {FileDropzone, FileState} from "@/components/ui/fileupload/file";
import {useEdgeStore} from "@/lib/edgestore/edgestore";
import {UploadTypes} from "@/types/upload/upload-types";
import {useLocale} from "@react-aria/i18n";
import dayjs from "dayjs";
import {normalizeCalendarDateToDate} from "@/lib/utils/normalizeCalendarDateToDate";


interface LeaveRequestFormProps {
    title?: string
    description?: string
    onOpen: (value: boolean) => void
    isOpen: boolean,
    employee?: EditCreditProp
}

function RequestForm({title, description, onOpen, isOpen, employee}: LeaveRequestFormProps) {
    const {data, isLoading} = useEmployeesLeaveStatus()
    let {locale} = useLocale();
    const [user, setUser] = useState<EmployeeLeavesStatus | null>(null)
    const [employeeIdSelected, setEmployeeIdSelected] = useState<number>(0)
    const [minLeave, setMinLeave] = useState<number>(0)
    const [maxLeave, setMaxLeave] = useState<number>(0)
    const {isDateUnavailable} = useHolidays()
    const [isAttachmentRequired, setIsAttachmentRequired] = useState<boolean>(false)
    const [documentAttachments, setDocumentAttachments] = useState<FileState[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [url, setUrl] = useState<string[] | null>(null)
    const {toast} = useToast()
    const { edgestore } = useEdgeStore();
    // Handle modal open/close state changes
    const handleModalOpen = useCallback((value: boolean) => {
        setIsModalOpen(value);
        onOpen(value);
    }, [onOpen]);

    const form = useForm<z.infer<typeof LeaveRequestFormValidation>>({
        resolver: zodResolver(LeaveRequestFormValidation), defaultValues: {
            employee_id: 0, reason: "", leave_type_id: 0, // Ensure the leave_type_id has a default value,
            // days_of_leave: "",
            leave_date_range: {
                start: "",
                end: ""
            },        }
    });
    useEffect(() => {
        if (isOpen !== isModalOpen) {
            setIsModalOpen(isOpen);
        }
    }, [isModalOpen, isOpen]);


    useEffect(() => {
        if (data) {
            setUser(() => ({
                availableLeaves: data.availableLeaves,  // Retain previous data
                employees: data.employees.sort((a, b) => a.name.localeCompare(b.name)),
            }));
        }

    }, [data]);

    // const minMax = React.useMemo(() => {
    //     const remainingLeaves = user?.employees.find(emp => emp.id === employeeIdSelected)?.leave_balances.find(leave => leave.leave_type_id === Number(form.watch("leave_type_id")))?.remaining_days || 0
    //
    //     console.log("Remaining: ", remainingLeaves)
    //     console.log("Max: ", maxLeave)
    //     console.log("Min: ", minLeave)
    //     if (remainingLeaves > maxLeave) {
    //         return maxLeave
    //     } else {
    //         return remainingLeaves
    //
    //     }
    //
    // }, [employeeIdSelected, form, maxLeave, minLeave, user?.employees])

    const minMax = React.useMemo(() => {
        const remainingLeaves =
            user?.employees
                .find((emp) => emp.id === employeeIdSelected)
                ?.leave_balances.find(
                (leave) => leave.leave_type_id === Number(form.watch("leave_type_id"))
            )?.remaining_days || 0;

        const effectiveMaxLeave = Math.min(remainingLeaves, maxLeave);

        // Helper function to find the date after skipping unavailable days
        const calculateAvailableDate = (totalDays: number) => {
            const existingLeaveDates = user?.employees
                .map((employee) =>
                    employee.trans_leaves.filter(
                        (leave) =>
                            leave.leave_type_id === Number(form.watch("leave_type_id"))
                    )
                )
                .flat() || []; // Flatten the array of leave ranges

            // Assume today is December 16, 2024
            let currentDate = today(getLocalTimeZone());

            // Helper function to normalize the CalendarDate to a native Date object
            const normalizeCalendarDateToDate = (calendarDate: CalendarDate): Date => {
                return new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day);
            };

            // Helper function to check if currentDate is within any existing leave date range
            const isInExistingLeave = (date: CalendarDate): boolean => {
                const normalizedCurrentDate = normalizeCalendarDateToDate(date);
                return existingLeaveDates.some((leave) => {
                    const startDate = new Date(leave.start_date);
                    const endDate = new Date(leave.end_date);
                    return normalizedCurrentDate >= startDate && normalizedCurrentDate <= endDate;
                });
            };

            let availableDaysCount = 0;

            // Iterate day by day until we reach the required number of available business days
            while (availableDaysCount < totalDays) {
                // Convert currentDate (CalendarDate) to a native Date
                let currentNativeDate = normalizeCalendarDateToDate(currentDate);

                // Check if the currentDate is a business day
                const currentCalendarDate = new CalendarDate(currentNativeDate.getFullYear(), currentNativeDate.getMonth() + 1, currentNativeDate.getDate());

                // Check if currentDate is not a weekend, unavailable, and not within existing leave dates
                if (
                    !isWeekend(currentCalendarDate, locale) &&  // Skip weekends
                    !isDateUnavailable(currentCalendarDate) &&  // Skip unavailable dates (holidays, etc.)
                    !isInExistingLeave(currentCalendarDate) // Skip existing leave dates
                ) {
                    availableDaysCount++; // Increment available business day count
                }

                // Move to the next day
                currentNativeDate.setDate(currentNativeDate.getDate() + 1);

                // Convert back to CalendarDate after moving to the next day
                currentDate = new CalendarDate(currentNativeDate.getFullYear(), currentNativeDate.getMonth() + 1, currentNativeDate.getDate());
            }

            return currentDate; // Return the date after reaching the total available business days
        };

        console.log("Calculated Days: ", calculateAvailableDate(effectiveMaxLeave));
        return calculateAvailableDate(effectiveMaxLeave);
    }, [user?.employees, maxLeave, employeeIdSelected, form, locale, isDateUnavailable]);




    const LeaveRequestForm: FormInputProps[] = [
    //     {
    //     isRequired: true,
    //     name: "days_of_leave",
    //     type: "select",
    //     label: "Days of Leave",
    //     inputDisabled: !form.watch("leave_type_id") || minMax.length === 0,
    //     config: {
    //         options: minMax, isClearable: true, isDisabled: !form.watch("leave_type_id") || minMax.length === 0
    //     }
    //
    // },
        {
        // inputDisabled: !form.watch("leave_type_id") || minMax.length === 0 || !form.watch("days_of_leave"),
        isRequired: true,
        name: "leave_date_range",
        type: "date-range-picker",
        label: "Date of Leave",
        config: {
            allowsNonContiguousRanges: true,
            showMonthAndYearPickers: true,
            granularity: "minute",
            hideTimeZone: true,
            minValue: today(getLocalTimeZone()),
            maxValue: minMax, // Use the calculated date here
            isDateUnavailable: (date: DateValue) => {
                const existingLeaveDates = user?.employees
                    .map((employee) =>
                        employee.trans_leaves.filter(
                            (leave) =>
                                leave.leave_type_id === Number(form.watch("leave_type_id"))
                        )
                    )
                    .flat() || []; // Flatten the array of leave ranges

                // Normalize a Date object to remove the time component
                const normalizeDate = (inputDate: Date) =>
                    new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());

                // Convert `date` (DateValue) to a normalized `Date` object
                const currentDate = normalizeDate(new Date(date.year, date.month - 1, date.day));

                // Check if the current date is within any leave range
                const isInExistingLeave = existingLeaveDates.some((leave) => {
                    const startDate = normalizeDate(new Date(leave.start_date));
                    const endDate = normalizeDate(new Date(leave.end_date));

                    return currentDate >= startDate && currentDate <= endDate; // Disable if within range
                });
                return isWeekend(date, locale) || isDateUnavailable(date) || isInExistingLeave;
            },
        }

    },
        {
        name: "reason", label: "Reason for Leave", type: "text-area", isRequired: true, // Component: (field) => {
    },
    //     {
    //     name: "comment", label: "Comment", type: "text-area", // Component: (field) => {
    // }
    ]

    const employee_leave_type = React.useMemo(() => {
        const employee = user?.employees.find(item => item.id === employeeIdSelected);

        if (!employee) {
            return []; // Return an empty array if the employee is not found
        }

        return user?.availableLeaves.filter(leaveType => employee.leave_balances.some(balance => balance.leave_type_id === leaveType.id))
    }, [user, employeeIdSelected])

    function updateFileProgress(key: string, progress: FileState['progress']) {
        setDocumentAttachments((fileStates) => {
            const newFileStates = structuredClone(fileStates);
            const fileState = newFileStates.find(
                (fileState) => fileState.key === key,
            );
            if (fileState) {
                fileState.progress = progress;
            }
            return newFileStates;
        });
    }

    async function onSubmit(values: z.infer<typeof LeaveRequestFormValidation>) {
        try {

            console.log("Url: ", url)
            // Ensure validation for document attachments if required
            if (employee_leave_type?.some((lt) => lt.is_attachment_required) && !documentAttachments) {
                toast({
                    title: "Error",
                    description: "Please upload a document for this leave type.",
                    variant: "danger",
                });
                return; // Stop execution if validation fails
            }

            // Prepare the payload

            const items = {
                id: employee?.id, ...values,
                leave_type_id: values.leave_type_id,
                leave_date_range: values.leave_date_range,
                reason: values.reason,
                url: url,
            }

            // Set loading state
            setIsSubmitting(true);

            // Decide between creating or updating the leave request
            const endpoint = employee?.id
                ? "/api/admin/leaves/requests/update"
                : "/api/admin/leaves/requests/create";

            const res = await axiosInstance.post(endpoint, items);

            if (res.status === 200) {
                toast({
                    title: "Success",
                    description: `Leave credit ${
                        employee?.id ? "updated" : "created"
                    } successfully.`,
                    variant: "success",
                });

                // Reset the form and close the modal if necessary
                form.reset({
                    employee_id: 0,
                    reason: "",
                    leave_type_id: 0, // Ensure the leave_type_id has a default value
                    leave_date_range: {
                        start: "",
                        end: ""
                    }
                });

                handleModalOpen(false)
                setDocumentAttachments([])

                if (employee?.id) {
                    setIsModalOpen(false);
                }
            } else {
                toast({
                    title: "Error",
                    description: res.data.message || "An error occurred while processing the request.",
                    variant: "danger",
                });
            }
        } catch (e) {
            console.error("Error:", e);

            if (e instanceof AxiosError) {
                toast({
                    title: "Error",
                    description: e.response?.data?.message || "An unexpected error occurred.",
                    variant: "danger",
                });
            } else {
                toast({
                    title: "Error",
                    description: "An unexpected error occurred. Please try again.",
                    variant: "danger",
                });
            }
        } finally {
            setIsSubmitting(false); // Ensure the loading state is cleared
        }
    }




    return (<FormDrawer title={title || "File A leave Request"}
                        description={description || "Fill out the form to request a leave."}
                        onOpen={handleModalOpen} isOpen={isModalOpen} isLoading={isSubmitting}>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="drawer-form">
                <ScrollShadow>
                    <div className="space-y-4">
                        <div className="flex flex-col space-y-4">
                            <EmployeeListForm employees={user?.employees!} isLoading={isLoading}
                                              onSelected={setEmployeeIdSelected}/>
                            <LeaveTypeSelection min={setMinLeave} max={setMaxLeave}
                                                isAttachmentRequired={setIsAttachmentRequired}
                                                leaveTypes={employee_leave_type!} isLoading={isLoading}
                                                isDisabled={!form.watch("employee_id")}/>
                            {/*{form.watch("leave_type_id")?*/}
                            {/*    <Typography className="!text-danger text-sm">Cannot apply this leave to this employee. Low leave credit balance</Typography> : ""}*/}
                        </div>
                        <FormFields items={LeaveRequestForm}/>
                        {isAttachmentRequired && <div className="flex flex-col gap-2">
                            <div className="flex">
                                <Typography className="text-sm font-medium mt-2">Upload Documents</Typography>
                                <span className="ml-2 inline-flex text-destructive text-medium"> *</span>
                            </div>
                            <FileDropzone
                                onChange={(files) => {
                                    setDocumentAttachments(files)
                                }}
                                dropzoneOptions={{
                                    accept: {
                                        'application/pdf': ['.pdf'],
                                        'application/msword': ['.doc'],
                                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                                    },
                                }}
                                value={documentAttachments}
                                onFilesAdded={async (addedFiles) => {
                                    setDocumentAttachments([...documentAttachments, ...addedFiles]);
                                    await Promise.all(
                                        addedFiles.map(async (addedFileState) => {
                                            try {
                                                const res = await edgestore.publicFiles.upload({
                                                    file: addedFileState.file,
                                                    onProgressChange: async (progress) => {
                                                        updateFileProgress(addedFileState.key, progress);
                                                        if (progress === 100) {
                                                            // wait 1 second to set it to complete
                                                            // so that the user can see the progress bar at 100%
                                                            await new Promise((resolve) => setTimeout(resolve, 1000));
                                                            updateFileProgress(addedFileState.key, 'COMPLETE');
                                                        }
                                                    },
                                                });
                                                setUrl((prevState) => (Array.isArray(prevState) ? [...prevState, res.url] : [res.url]));
                                            } catch (err) {
                                                updateFileProgress(addedFileState.key, 'ERROR');
                                            }
                                        }),
                                    );
                                }}
                            />
                        </div>}

                    </div>
                </ScrollShadow>
            </form>
        </Form>
    </FormDrawer>);
}

export default RequestForm;
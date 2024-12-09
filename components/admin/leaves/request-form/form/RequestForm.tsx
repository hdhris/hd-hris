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
import {DateRangePicker} from "@nextui-org/react";
import {DateStyle} from "@/lib/custom/styles/InputStyle";
import loadJsConfig from "next/dist/build/load-jsconfig";


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
    const [isValidDate, setIsValidDate] = useState<boolean>(true)
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


    const minMax = React.useCallback((date: CalendarDate) => {
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
            let currentDate = date;

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

                const dayOfWeek = currentDate.toDate(getLocalTimeZone()).getDay(); // 0 - Sunday, 1 - Monday, ..., 6 - Saturday
                // const allowedDays = user?.employees.map(item => item.dim_schedules.filter(sched => sched.days_json)).map(days => days.);

                const allowedDays = user?.employees.filter(item => item.id === employeeIdSelected).flatMap(employee => employee.dim_schedules?.map(schedule => schedule.days_json).flat() || []);


                // Remove duplicates using Set
                const uniqueDaysJson = [...new Set(allowedDays)];

                // Map the day of the week to the corresponding day string (mon, tue, ...)
                const dayString = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dayOfWeek];

                // Check if the current day is in the allowed days
                const isAllowedDay = uniqueDaysJson.includes(dayString);
                // Check if currentDate is not a weekend, unavailable, and not within existing leave dates
                if (
                    !isAllowedDay &&  // Skip weekends
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
    }, [user?.employees, maxLeave, employeeIdSelected, form, isDateUnavailable]);

    const normalizeDate = (inputDate: Date) =>
        new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());


    const LeaveRequestForm: FormInputProps[] = [
        {
            inputDisabled: !form.watch("leave_type_id"), isRequired: true, name: "leave_date_range", // type: "date-range-picker",
            label: "Date of Leave", Component: (field) => {
                return (
                    <DateRangePicker
                        onChange={(value) => {
                            const startDate = value?.start;
                            const endDate = value?.end;

                            const existingLeaveDates = user?.employees
                                .map((employee) =>
                                    employee.trans_leaves.filter(
                                        (leave) =>
                                            leave.leave_type_id === Number(form.watch("leave_type_id"))
                                    )
                                )
                                .flat() || []; // Flatten the array of leave ranges
                            const currentDate = normalizeDate(new Date(startDate.year, startDate.month - 1, startDate.day));
                            const isInExistingLeave = existingLeaveDates.some((leave) => {
                                const startDate = normalizeDate(new Date(leave.start_date));
                                const endDate = normalizeDate(new Date(leave.end_date));

                                return currentDate >= startDate && currentDate <= endDate; // Disable if within range
                            });
                            // Ensure start and end dates are valid
                            if (startDate && endDate) {
                                // Create an array of all dates in the selected range
                                const allDatesInRange = [];
                                let currentDate = normalizeCalendarDateToDate(startDate as CalendarDate);
                                const endDateObj = normalizeCalendarDateToDate(endDate as CalendarDate);
                                while (currentDate <= endDateObj) {
                                    allDatesInRange.push(new Date(currentDate));
                                    currentDate.setDate(currentDate.getDate() + 1); // Move to next day
                                }

                                const dayOfWeek = currentDate.getDay(); // 0 - Sunday, 1 - Monday, ..., 6 - Saturday

                                const allowedDays = user?.employees.filter(item => item.id === employeeIdSelected)
                                    .flatMap(employee => employee.dim_schedules?.map(schedule => schedule.days_json).flat() || []);

                                // Remove duplicates using Set
                                const uniqueDaysJson = [...new Set(allowedDays)];

                                // Map the day of the week to the corresponding day string (mon, tue, ...)
                                const dayString = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dayOfWeek];

                                // Check if the current day is in the allowed days
                                const isAllowedDay = uniqueDaysJson.includes(dayString);

                                // Filter the dates based on availability
                                const availableDaysCount = allDatesInRange.filter((date) => {
                                    // Convert `date` to DateValue format used in `isDateUnavailable`
                                    const dateValue = {
                                        year: date.getFullYear(),
                                        month: date.getMonth() + 1, // Convert to 1-based month
                                        day: date.getDate(),
                                    };

                                    const dates = new CalendarDate(dateValue.year, dateValue.month, dateValue.day);
                                    // Check if the date is available
                                    return !(isDateUnavailable(dates)) || !isInExistingLeave || isAllowedDay;
                                }).length;

                                // Update the field and form value with the selected range
                                field.onChange({
                                    start: startDate.toString(),
                                    end: endDate.toString(),
                                });
                                form.setValue("leave_date_range", {
                                    start: startDate.toString(),
                                    end: endDate.toString(),
                                });

                                // You can now use availableDaysCount to display the number of available days
                                console.log(`Available Days: ${availableDaysCount}`);
                            }
                        }}
                        errorMessage={(v) => {
                            setIsValidDate(!v.isInvalid);
                            return v.validationErrors;
                        }}
                        aria-label="Date Range"
                        isDisabled={!form.watch("leave_type_id")}
                        variant="bordered"
                        radius="sm"
                        classNames={DateStyle}
                        allowsNonContiguousRanges
                        showMonthAndYearPickers
                        granularity="minute"
                        hideTimeZone
                        minValue={today(getLocalTimeZone())}
                        isDateUnavailable={(date: DateValue) => {
                            // The existing logic for date unavailability, same as you provided
                            const existingLeaveDates = user?.employees
                                .map((employee) =>
                                    employee.trans_leaves.filter(
                                        (leave) =>
                                            leave.leave_type_id === Number(form.watch("leave_type_id"))
                                    )
                                )
                                .flat() || []; // Flatten the array of leave ranges

                            // Normalize a Date object to remove the time component

                            // Convert `date` (DateValue) to a normalized `Date` object
                            const currentDate = normalizeDate(new Date(date.year, date.month - 1, date.day));

                            // Check if the current date is within any leave range
                            const isInExistingLeave = existingLeaveDates.some((leave) => {
                                const startDate = normalizeDate(new Date(leave.start_date));
                                const endDate = normalizeDate(new Date(leave.end_date));

                                return currentDate >= startDate && currentDate <= endDate; // Disable if within range
                            });

                            const dayOfWeek = currentDate.getDay(); // 0 - Sunday, 1 - Monday, ..., 6 - Saturday

                            const allowedDays = user?.employees.filter(item => item.id === employeeIdSelected)
                                .flatMap(employee => employee.dim_schedules?.map(schedule => schedule.days_json).flat() || []);

                            // Remove duplicates using Set
                            const uniqueDaysJson = [...new Set(allowedDays)];

                            // Map the day of the week to the corresponding day string (mon, tue, ...)
                            const dayString = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dayOfWeek];

                            // Check if the current day is in the allowed days
                            const isAllowedDay = uniqueDaysJson.includes(dayString);

                            // Return if the date is unavailable (either already in leave or not in allowed days)
                            return !isAllowedDay || isInExistingLeave || isDateUnavailable(date);
                        }}
                    />

                )
            },
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

    function calculateEndDate(
        startDate: { year: number; month: number; day: number },
        daysToAdd: number,
        existingLeaveDates: any[],
        allowedDaysJson: string[]
    ): { year: number; month: number; day: number } {
        // Normalize a Date object to remove the time component
        const normalizeDate = (inputDate: Date) =>
            new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());

        // Convert startDate to a normalized Date object
        let currentDate = normalizeDate(new Date(startDate.year, startDate.month - 1, startDate.day));

        let validDaysCount = 0;

        let returnDate = dayjs(currentDate)
        while (validDaysCount < daysToAdd) {
            // Get the current day's string (e.g., "mon", "tue")
            const dayOfWeek = currentDate.getDay();
            const dayString = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dayOfWeek];

            // Check if the current day is allowed
            const isAllowedDay = allowedDaysJson.includes(dayString);

            // Check if the current date is within any leave range
            const isInExistingLeave = existingLeaveDates.some((leave) => {
                const startDate = normalizeDate(new Date(leave.start_date));
                const endDate = normalizeDate(new Date(leave.end_date));
                return currentDate >= startDate && currentDate <= endDate;
            });

            // If the current day is valid, increment the validDaysCount
            if (isAllowedDay && !isInExistingLeave) {
                validDaysCount++;
            }

            // Move to the next day
            currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Add 1 day
        }

        console.log("returnDate: ", returnDate.toString())

        // Convert the final date back to the required format
        return {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            day: currentDate.getDate(),
        };
    }

    async function onSubmit(values: z.infer<typeof LeaveRequestFormValidation>) {
        try {

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
                // id: employee?.id, ...values,
                // leave_type_id: values.leave_type_id,
                // leave_date_range: values.leave_date_range,
                // reason: values.reason,
                // url: url,
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
                // form.reset({
                //     employee_id: 0,
                //     reason: "",
                //     leave_type_id: 0, // Ensure the leave_type_id has a default value
                //     leave_date_range: {
                //         start: "",
                //         end: ""
                //     }
                // });

                // handleModalOpen(false)
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
                            <LeaveTypeSelection max={setMaxLeave}
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
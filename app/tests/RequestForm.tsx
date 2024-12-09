import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {EditCreditProp} from "@/app/(admin)/(core)/leaves/leave-credits/page";
import FormDrawer from '@/components/common/forms/FormDrawer';
import {useForm, useFormState} from "react-hook-form";
import {z} from "zod";
import {LeaveRequestFormValidation} from "@/helper/zodValidation/leaves/request-form/LeaveRequestFormValidation";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from '@/components/ui/form';
import {DateRangePicker, ScrollShadow} from '@nextui-org/react';
import {useEmployeesLeaveStatus} from "@/services/queries";
import EmployeeListForm from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";
import LeaveTypeSelection from "@/components/admin/leaves/request-form/LeaveTypeSelection";
import {EmployeeLeavesStatus} from '@/types/leaves/LeaveRequestTypes';
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {DateStyle} from "@/lib/custom/styles/InputStyle";
import {
    CalendarDate, DateValue, getLocalTimeZone, parseAbsoluteToLocal, parseDate, today, ZonedDateTime
} from "@internationalized/date";
import {useHolidays} from "@/helper/holidays/unavailableDates";
import dayjs from "dayjs";
import {toGMT8} from "@/lib/utils/toGMT8";
import {pluralize} from "@/helper/pluralize/pluralize";
import {RangeValue} from "@react-types/shared";
import {FileDropzone, FileState} from "@/components/ui/fileupload/file";
import Typography from "@/components/common/typography/Typography";
import {useEdgeStore} from "@/lib/edgestore/edgestore";
import type {DropzoneOptions} from "react-dropzone";
import {axiosInstance} from "@/services/fetcher";
import {AxiosError} from "axios";
import {useToast} from "@/components/ui/use-toast";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';


// Extend dayjs with the plugins
dayjs.extend(isSameOrAfter);

interface LeaveRequestFormProps {
    title?: string
    description?: string
    onOpen: (value: boolean) => void
    isOpen: boolean,
    employee?: EditCreditProp
}

function RequestForm({title, description, onOpen, isOpen, employee}: LeaveRequestFormProps) {
    const {toast} = useToast()
    const {edgestore} = useEdgeStore();
    const {isDateUnavailable} = useHolidays()
    const {data, isLoading} = useEmployeesLeaveStatus()
    const [maxLeave, setMaxLeave] = useState<number>(0)
    const [url, setUrl] = useState<string[] | null>(null)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [user, setUser] = useState<EmployeeLeavesStatus | null>(null)
    const [employeeIdSelected, setEmployeeIdSelected] = useState<number>(0)
    const [documentAttachments, setDocumentAttachments] = useState<FileState[]>([]);
    const [isAttachmentRequired, setIsAttachmentRequired] = useState<boolean>(false)


    const form = useForm<z.infer<typeof LeaveRequestFormValidation>>({
        resolver: zodResolver(LeaveRequestFormValidation), defaultValues: {
            employee_id: 0, reason: "", leave_type_id: 0, // Ensure the leave_type_id has a default value,
            leave_date_range: {
                start: "", end: ""
            },
        }
    });

    const {isValid, isDirty} = useFormState(form)

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
    const employee_leave_type = useMemo(() => {
        const employee = user?.employees.find(item => item.id === employeeIdSelected);

        if (!employee) {
            return []; // Return an empty array if the employee is not found
        }

        return user?.availableLeaves.filter(leaveType => employee.leave_balances.some(balance => balance.leave_type_id === leaveType.id))
    }, [user, employeeIdSelected])

    const max = useMemo(() => {
        const remainingLeaves = user?.employees
            .find((emp) => emp.id === employeeIdSelected)
            ?.leave_balances.find((leave) => leave.leave_type_id === Number(form.watch("leave_type_id")))?.remaining_days || 0;

        return Math.min(remainingLeaves, maxLeave);
    }, [employeeIdSelected, form, maxLeave, user?.employees])

    const maxMinTime = useMemo(() => {
        const clock = user?.employees
            .filter(item => item.id === employeeIdSelected)  // Filter by employee ID
            .flatMap(item => item.dim_schedules)  // Flatten the array of schedules
            .find(item => item.ref_batch_schedules);

        if (clock) {
            const clock_in = toGMT8(clock?.ref_batch_schedules.clock_in).format("HH:mm:ss");
            const clock_out = toGMT8(clock?.ref_batch_schedules.clock_out).format("HH:mm:ss");

            const time_in = clock_in;  // Format clock_in to hours and minutes
            const time_out = clock_out;
            return {
                time_in, time_out
            };
        }


        console.log("Clock: ", clock);
        return null
    }, [employeeIdSelected, user?.employees]);

    function updateFileProgress(key: string, progress: FileState['progress']) {
        setDocumentAttachments((fileStates) => {
            const newFileStates = structuredClone(fileStates);
            const fileState = newFileStates.find((fileState) => fileState.key === key,);
            if (fileState) {
                fileState.progress = progress;
            }
            return newFileStates;
        });
    }

    const handleModalOpen = useCallback((value: boolean) => {
        setIsModalOpen(value);
        onOpen(value);
    }, [onOpen]);

    const haveExistingLeave = useCallback((date: DateValue) => {
        //get the existing leave dates if not rejected
        const existingLeaveDates = user?.employees
            .filter(item => item.id === employeeIdSelected)
            .map((employee) => employee.trans_leaves.filter((leave) => leave.leave_type_id && leave.status !== "Rejected"))
            .flat() || [];

        const currentDate = normalizeDate(new Date(date.year, date.month - 1, date.day));
        return existingLeaveDates.some((leave) => {
            const startDate = normalizeDate(new Date(leave.start_date));
            const endDate = normalizeDate(new Date(leave.end_date));

            return currentDate >= startDate && currentDate <= endDate; // Disable if within range
        });

    }, [employeeIdSelected, user?.employees])

    //get the schedule of an employee
    const schedule = useCallback((date: DateValue) => {
        const currentDate = normalizeDate(new Date(date.year, date.month - 1, date.day));
        const dayOfWeek = currentDate.getDay(); // 0 - Sunday, 1 - Monday, ..., 6 - Saturday

        const allowedDays = user?.employees.filter(item => item.id === employeeIdSelected)
            .flatMap(employee => employee.dim_schedules?.map(schedule => schedule.days_json).flat() || []);

        // Remove duplicates using Set
        const uniqueDaysJson = [...new Set(allowedDays)];

        // Map the day of the week to the corresponding day string (mon, tue, ...)
        const dayString = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dayOfWeek];

        // Check if the current day is in the allowed days
        return uniqueDaysJson.includes(dayString)
    }, [employeeIdSelected, user?.employees])

    const dateUnavailable = useCallback((date: DateValue) => {
        return haveExistingLeave(date) || isDateUnavailable(date) || !schedule(date);
    }, [haveExistingLeave, isDateUnavailable, schedule])


    // Function to count the available days in a given range
    const countAvailableDays = useCallback((startDate: DateValue, endDate: DateValue): number => {
        let availableDaysCount = 0;

        // Normalize start and end dates
        let currentDate = normalizeDate(new Date(startDate.year, startDate.month - 1, startDate.day));
        const endDateCopy = normalizeDate(new Date(endDate.year, endDate.month - 1, endDate.day));

        // Loop through each day from startDate to endDate
        while (currentDate <= endDateCopy) {
            // Check if the current date is available using the dateUnavailable function
            if (!dateUnavailable(new CalendarDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()))) {
                availableDaysCount++;
            }

            // Move to the next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return availableDaysCount - 1;
    }, [dateUnavailable]);


    const calculateRemainingLeaveCredit = (startDate: DateValue, endDate: DateValue, basedDays: number): string => {
        // Define working hours (9:30 AM to 5:00 PM)
        const workingStartHour = 9 + 0.5;  // 9:30 AM (9 + 30 minutes)
        const workingEndHour = 17;        // 5:00 PM
        const workingMinutesPerDay = (workingEndHour - workingStartHour) * 60;  // 7.5 hours per day in minutes

        // Convert start and end dates to dayjs objects
        const start = dayjs(startDate.toString());
        const end = dayjs(endDate.toString());

        // Get the timestamp of the start and end dates
        const startTime = start.toDate().getTime();
        const endTime = end.toDate().getTime();

        // Calculate the total difference in milliseconds
        const diffInMilliseconds = Math.abs(endTime - startTime);

        // Convert milliseconds to minutes and hours
        const diffInMinutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)); // Minutes difference
        const diffInHours = Math.floor((diffInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); // Hours difference

        // Calculate the worked time (in minutes)
        const workedMinutes = diffInHours * 60 + diffInMinutes;

        // Limit the worked time to the working hours for the given day
        const workingStartTime = start.set('hour', 9).set('minute', 30).set('second', 0).set('millisecond', 0);
        const workingEndTime = start.set('hour', 17).set('minute', 0).set('second', 0).set('millisecond', 0);

        // Adjust worked minutes if the start time is before the working hours
        if (start.isBefore(workingStartTime)) {
            start.set('hour', 9).set('minute', 30); // Set to the working start time
        }

        // Adjust worked minutes if the end time is after the working hours
        if (end.isAfter(workingEndTime)) {
            end.set('hour', 17).set('minute', 0); // Set to the working end time
        }

        // Calculate the number of working minutes between the start and end times
        const totalWorkedMinutes = end.diff(start, 'minute');

        // Calculate the total working hours for the day (as fractional days)
        const workedFractionalDay = totalWorkedMinutes / workingMinutesPerDay;

        // Calculate available days excluding weekends and holidays
        const availableDaysCount = countAvailableDays(parseDate(start.toDate().toISOString() ), parseDate(end.toDate().toISOString()));  // Function to calculate available working days excluding weekends

        // Calculate the fractional deduction based on available working days
        const fractionalDeduction =
            (availableDaysCount - 1) + workedFractionalDay;

        // Calculate the remaining days (as a decimal)
        const remainingDays = basedDays - fractionalDeduction;

        // Output the remaining days as a decimal
        console.log('Remaining Days (as decimal):', remainingDays.toFixed(2));

        return remainingDays.toFixed(2);
    };

    // function calculateRemainingLeave(availableLeaveDays: number, requestedLeaveDays: number, requestedLeaveHours: number, requestedLeaveMinutes: number, workHoursPerDay: number): { hours: number, minutes: number } {
    //
    //     const clockInTime = new Date(`2024-12-10T${maxMinTime?.time_in}:00`);
    //     const clockOutTime = new Date(`2024-12-10T${maxMinTime?.time_out}:00`);
    //
    //     // Calculate the total work time in milliseconds
    //     const workDuration = clockOutTime.getTime() - clockInTime.getTime();
    //
    //     // Convert work duration from milliseconds to hours
    //     const workHours = workDuration / (1000 * 60 * 60);
    //
    //     // Subtract lunch break hours
    //     const totalWorkHours = workHours - 60;
    //
    //     // Convert total available leave to hours
    //     const availableLeaveInHours = availableLeaveDays * totalWorkHours;
    //
    //     // Convert requested leave to hours and minutes into total minutes for easy calculation
    //     const requestedLeaveInMinutes = (requestedLeaveDays * totalWorkHours * 60) + (requestedLeaveHours * 60) + requestedLeaveMinutes;
    //
    //     // Remaining leave in minutes
    //     const remainingLeaveInMinutes = availableLeaveInHours * 60 - requestedLeaveInMinutes;
    //
    //     // Convert remaining leave from minutes back to hours and minutes
    //     const remainingHours = Math.floor(remainingLeaveInMinutes / 60);
    //     const remainingMinutes = remainingLeaveInMinutes % 60;
    //
    //     return { hours: remainingHours, minutes: remainingMinutes };
    // }

    function calculateLeaveDeduction(startTimeStr: string, endTimeStr: string) {
        // Extract break times (assuming `break_min` is in minutes)
        const breakTimes = user?.employees
            .filter(item => item.id === employeeIdSelected)  // Filter by selected employee
            .flatMap(item => item.dim_schedules)  // Flatten dim_schedules
            .flatMap(schedule => schedule.ref_batch_schedules)  // Flatten ref_batch_schedules
            .map(batch => batch.break_min)[0] || 0;  // Extract break times in minutes

        // Convert break times from minutes to hours
        const breakHours = breakTimes / 60;

        // Convert startTime and endTime strings to Date objects
        const startTime = toGMT8(startTimeStr).utc(true).toDate();
        const endTime = toGMT8(endTimeStr).utc(true).toDate();

        // Normalize start and end dates to get rid of any time differences
        const start = normalizeDate(startTime);
        const end = normalizeDate(endTime);

        // Calculate total duration in minutes (from startTime to endTime)
        const totalDuration = endTime.getTime() - startTime.getTime();
        const totalMinutes = totalDuration / (1000 * 60); // Convert milliseconds to minutes

        // Calculate work duration (difference between clock-in and clock-out in minutes)
        const clock_in = new Date(`2024-12-10T${maxMinTime?.time_in}`);
        const clock_out = new Date(`2024-12-10T${maxMinTime?.time_out}`);
        const workDuration = dayjs(clock_in).diff(dayjs(clock_out), 'minutes', true);

        // Adjust for break time in hours and calculate total work hours
        let totalWorkHours = Math.abs(workDuration) - breakHours;

        // Count the number of available working days between start and end dates
        let workingDays = countAvailableDays(
            new CalendarDate(start.getFullYear(), start.getMonth() + 1, start.getDate()),
            new CalendarDate(end.getFullYear(), end.getMonth() + 1, end.getDate())
        );

        const startUserTime = toGMT8(startTimeStr);
        const endUserTime = toGMT8(endTimeStr);
        // Determine if the work period passes through the 12:00 PM to 1:00 PM period (lunch break)
        const passesLunchBreak = (startUserTime.hour() < 13 && startUserTime.minute() < 60) &&
            (endUserTime.hour() >= 13 && endUserTime.minute() < 60);

        console.log("Start Hours:", startUserTime.format('HH:mm'));  // Display in HH:mm format
        console.log("End Hours:", endUserTime.format('HH:mm'));

        console.log("Break Times (in hours):", breakHours);
        console.log("Total Work Hours (before break adjustment):", totalWorkHours);
        console.log("Working Days: ", workingDays);
        console.log("Passes through 12:00 PM to 1:00 PM?:", passesLunchBreak);

        // Deduct break time if the leave period passes through the lunch break
        if (passesLunchBreak) {
            console.log("Deducting lunch break time (1 hour)...");

            // Subtract 1 hour if the leave period passes through the lunch break
            totalWorkHours -= breakTimes; // Deduct 1 hour (lunch break duration)
        }

        console.log("Total Work Hours (after lunch break deduction):", totalWorkHours);

        // Return the total work time adjusted for breaks
        return (workingDays * totalWorkHours).toFixed(2);
    }





    const onDateRangePicker = useCallback((value: RangeValue<DateValue>) => {
        const startDate = value?.start as ZonedDateTime;
        const endDate = value?.end as ZonedDateTime;

        // Normalize the start and end times to JavaScript Date objects
        const sd = startDate?.toDate();
        const ed = endDate?.toDate();

        if (!sd || !ed) {
            form.setError("leave_date_range", { message: "Please select both a start and end date." });
            return;
        }

        const startTime = dayjs(sd).format("HH:mm");
        const endTime = dayjs(ed).format("HH:mm");

        // Extract time from maxMinTime
        const minTime = maxMinTime?.time_in!; // e.g., "08:00"
        const maxTime = maxMinTime?.time_out!; // e.g., "17:00"

        console.log("Start Time:", startTime);
        console.log("End Time:", endTime);
        console.log("Time In:", minTime);
        console.log("Time Out:", maxTime);

        // Convert to `dayjs` objects for reliable comparisons
        const startDayjs = dayjs(startTime, "HH:mm");
        const endDayjs = dayjs(endTime, "HH:mm");
        const minDayjs = dayjs(minTime, "HH:mm");
        const maxDayjs = dayjs(maxTime, "HH:mm");

        // const isStartBeforeEnd = startDayjs.isAfter(endDayjs) || startDayjs.isSame(endDayjs);

        // Validate start time (must be after or equal to minTime)
        const isStartValid = startDayjs.isSameOrAfter(minDayjs);
        // Validate end time (must be before or equal to maxTime)
        const isEndValid = endDayjs.isBefore(maxDayjs) || endDayjs.isSame(maxDayjs);

        if (!isStartValid || !isEndValid) {
            form.setError("leave_date_range", {
                message: `Please enter a valid time within the ${toGMT8(minTime).format("hh:mm A")} to ${toGMT8(maxTime).format("hh:mm A")} range.`,
            });
            console.log("Error: Invalid time range");
            return; // Exit early on time validation failure
        }

        // Validate available days
        const availableDays = countAvailableDays(startDate, endDate);
        console.log("Available Days:", availableDays);
        if (availableDays > max) {
            form.setError("leave_date_range", {
                message: `Leave Days Exceeded ${pluralize(max, "day")}.`,
            });
            console.log("Error: Exceeded leave days");
            return; // Exit early on day validation failure
        }

        // Clear errors if all validations pass
        form.clearErrors("leave_date_range");

        // Set form value for valid date range
        form.setValue("leave_date_range", {
            start: toGMT8(sd).toISOString(),
            end: toGMT8(ed).toISOString(),
        });

        // console.log("Valid date range set:", {
        //     start: toGMT8(sd).toISOString(),
        //     end: toGMT8(ed).toISOString(),
        // });
    }, [countAvailableDays, form, max, maxMinTime?.time_in, maxMinTime?.time_out]);


    const dropzoneConfig: Omit<DropzoneOptions, 'disabled'> = {
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
    }

    const fileUpload = useCallback(async (addedFiles: FileState[]) => {
        setDocumentAttachments([...documentAttachments, ...addedFiles]);
        await Promise.all(addedFiles.map(async (addedFileState) => {
            try {
                const res = await edgestore.publicFiles.upload({
                    file: addedFileState.file, onProgressChange: async (progress) => {
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
        }),);
    }, [documentAttachments, edgestore.publicFiles]);

    const handleOnSubmit = useCallback(async (values: z.infer<typeof LeaveRequestFormValidation>) => {
        try {
            const remainingCredit = user?.employees.filter(item => item.id === values.employee_id).filter(item => item.leave_balances.some(item => item.leave_type_id === values.leave_type_id)).flatMap(item => item.leave_balances).find(item => item.remaining_days)?.remaining_days || 0;

            console.log("Remaining: ", user?.employees);
            const leaveDeduction = calculateLeaveDeduction(values.leave_date_range.start, values.leave_date_range.end);

            console.log("Used: ", remainingCredit);

            console.log("Leave Deduction: ", leaveDeduction);
            const total_leave_credit = (remainingCredit * 1440) - Number(leaveDeduction);
            if (employee_leave_type?.some((lt) => lt.is_attachment_required) && !documentAttachments) {
                toast({
                    title: "Error", description: "Please upload a document for this leave type.", variant: "danger",
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
                total_days: total_leave_credit,
                used_leave: leaveDeduction
            }

            // Set loading state
            setIsSubmitting(true);

            // Decide between creating or updating the leave request
            const endpoint = employee?.id ? "/api/admin/leaves/requests/update" : "/api/admin/leaves/requests/create";

            const res = await axiosInstance.post(endpoint, items);

            if (res.status === 200) {
                toast({
                    title: "Success",
                    description: `Leave credit ${employee?.id ? "updated" : "created"} successfully.`,
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
                // setDocumentAttachments([])

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
                    title: "Error", description: "An unexpected error occurred. Please try again.", variant: "danger",
                });
            }
        } finally {
            setIsSubmitting(false); // Ensure the loading state is cleared
        }

    }, [documentAttachments, employee?.id, employee_leave_type, toast, url])


    const LeaveRequestForm: FormInputProps[] = [{
        inputDisabled: !form.watch("leave_type_id"), isRequired: true, name: "leave_date_range", // type: "date-range-picker",
        label: "Date of Leave", Component: (field) => {
            return (<DateRangePicker
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
                isDateUnavailable={dateUnavailable}
                onChange={onDateRangePicker}
            />)
        }
    }, {
        name: "reason", label: "Reason for Leave", type: "text-area", isRequired: true, // Component: (field) => {
    },]


    return (<FormDrawer title={title || "File A leave Request"}
                        description={description || "Fill out the form to request a leave."}
                        onOpen={handleModalOpen} isOpen={isModalOpen}
                        isLoading={isSubmitting}
                        unSubmittable={!isValid || employee_leave_type?.some((lt) => lt.is_attachment_required) && documentAttachments.length === 0 || url?.length === 0}>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleOnSubmit)} id="drawer-form">
                <ScrollShadow>
                    <div className="space-y-4">
                        <div className="flex flex-col space-y-4">
                            <EmployeeListForm employees={user?.employees!} isLoading={isLoading}
                                              onSelected={setEmployeeIdSelected}/>
                            <LeaveTypeSelection max={setMaxLeave}
                                                isAttachmentRequired={setIsAttachmentRequired}
                                                leaveTypes={employee_leave_type!} isLoading={isLoading}
                                                isDisabled={!form.watch("employee_id")}/>
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
                                dropzoneOptions={dropzoneConfig}
                                value={documentAttachments}
                                onFilesAdded={fileUpload}
                            />
                        </div>}
                    </div>
                </ScrollShadow>
            </form>
        </Form>
    </FormDrawer>);
}

export default RequestForm;


const normalizeDate = (inputDate: Date) => new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());

const timeInHours = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number); // Split and convert to numbers
    return hours + minutes / 60
}

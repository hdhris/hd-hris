"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import EmployeeListForm from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";
import LeaveTypeSelection from "@/components/admin/leaves/request-form/LeaveTypeSelection";
import Typography from "@/components/common/typography/Typography";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import { Form } from "@/components/ui/form";
import { useForm, useFormState } from "react-hook-form";
import { z } from "zod";
import { LeaveRequestFormValidation } from "@/helper/zodValidation/leaves/request-form/LeaveRequestFormValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDate, DateValue, getLocalTimeZone, today } from "@internationalized/date";
import { useEmployeesLeaveStatus } from "@/services/queries";
import { EmployeeLeavesStatus } from "@/types/leaves/LeaveRequestTypes";
import { EditCreditProp } from "@/app/(admin)/(core)/leaves/leave-credits/page";
import FormDrawer from "@/components/common/forms/FormDrawer";
import { axiosInstance } from "@/services/fetcher";
import { AxiosError } from "axios";
import { useToast } from "@/components/ui/use-toast";
import { useHolidays } from "@/helper/holidays/unavailableDates";
import { FileDropzone, FileState } from "@/components/ui/fileupload/file";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import { useLocale } from "@react-aria/i18n";
import { DateRangePicker, RangeValue } from "@nextui-org/react";
import { DateStyle } from "@/lib/custom/styles/InputStyle";
import dayjs from "dayjs";
import { normalizeCalendarDateToDate } from "@/lib/utils/normalizeCalendarDateToDate";

interface LeaveRequestFormProps {
    title?: string;
    description?: string;
    onOpen: (value: boolean) => void;
    isOpen: boolean;
    employee?: EditCreditProp;
}

function RequestForm({ title, description, onOpen, isOpen, employee }: LeaveRequestFormProps) {
    const { data, isLoading } = useEmployeesLeaveStatus();
    const { locale } = useLocale();
    const {isDateUnavailable} = useHolidays()
    const [user, setUser] = useState<EmployeeLeavesStatus | null>(null);
    const [employeeIdSelected, setEmployeeIdSelected] = useState<number>(0);
    const [maxLeaveDays, setMaxLeaveDays] = useState<number>(0);
    const [isAttachmentRequired, setIsAttachmentRequired] = useState<boolean>(false);
    const [documentAttachments, setDocumentAttachments] = useState<FileState[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(isOpen);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isValidDate, setIsValidDate] = useState<boolean>(true);
    const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(null);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const [onFocusedValue, setOnFocusedValue] = useState<DateValue | null>(null)
    const { toast } = useToast();
    const { edgestore } = useEdgeStore();
    const [value, setValue] = React.useState<RangeValue<DateValue> | null>(null);

    const form = useForm<z.infer<typeof LeaveRequestFormValidation>>({
        resolver: zodResolver(LeaveRequestFormValidation),
        defaultValues: {
            employee_id: 0,
            reason: "",
            leave_type_id: 0,
            leave_date_range: { start: "", end: "" },
        },
    });
    const { isValid } = useFormState(form);

    const handleModalOpen = useCallback((value: boolean) => {
        setIsModalOpen(value);
        onOpen(value);

    }, [onOpen]);
    // Sync modal state with parent
    useEffect(() => {
        setIsModalOpen(isOpen);
        if (isOpen) {
            form.reset(); // Reset form values when modal opens
            setDocumentAttachments([]);
            setUploadedUrls([]);
        }
    }, [isOpen, form]);

    // Set employees and available leave types
    useEffect(() => {
        if (data) {
            setUser({
                availableLeaves: data.availableLeaves,
                employees: data.employees.sort((a, b) => a.name.localeCompare(b.name)),
            });
        }
    }, [data]);

    const employeeLeaveTypes = useMemo(() => {
        const employee = user?.employees.find((item) => item.id === employeeIdSelected);
        if (!employee) return [];
        return user?.availableLeaves.filter((leaveType) =>
            employee.leave_balances.some((balance) => balance.leave_type_id === leaveType.id)
        );
    }, [user, employeeIdSelected]);

    const handleMaxDaysChange = useCallback(
        (value: number) => {
            const remainingLeaveDays =
                user?.employees
                    .find((emp) => emp.id === employeeIdSelected)
                    ?.leave_balances.find((leave) => leave.leave_type_id === Number(form.watch("leave_type_id")))?.remaining_days || 0;
            setMaxLeaveDays(Math.min(value, remainingLeaveDays));
        },
        [employeeIdSelected, form, user?.employees]
    );

    const calculateAvailableLeaveDays = useCallback((start: DateValue, end: DateValue): number => {
        // Logic to calculate valid leave days
        return 0; // Placeholder logic
    }, []);

    const handleSubmit = async (values: z.infer<typeof LeaveRequestFormValidation>) => {
        try {
            setIsSubmitting(true);
            const endpoint = employee?.id
                ? "/api/admin/leaves/requests/update"
                : "/api/admin/leaves/requests/create";
            const response = await axiosInstance.post(endpoint, {
                ...values,
                leave_date_range: {
                    start: values.leave_date_range.start,
                    end: values.leave_date_range.end,
                },
                url: uploadedUrls,
            });
            if (response.status === 200) {
                toast({
                    title: "Success",
                    description: `Leave request ${employee?.id ? "updated" : "created"} successfully.`,
                    variant: "success",
                });
                onOpen(false);
            }
        } catch (error) {
            const message = error instanceof AxiosError ? error.response?.data?.message : "An error occurred.";
            toast({ title: "Error", description: message, variant: "danger" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const normalizeDate = (inputDate: Date) => new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());

  

    const maxDate = useMemo(() => {
        const currentDate = new Date();
        const dayOfWeek = currentDate.getDay(); // 0 - Sunday, 1 - Monday, ..., 6 - Saturday

        if (!value || !value.start || !value.end) {
            // Disable maxDate if value is undefined or null
            return undefined;
        }

        // Get allowed days from the user's employees and their schedules
        const allowedDays = user?.employees
            .filter((item) => item.id === employeeIdSelected)
            .flatMap((employee) => employee.dim_schedules?.map((schedule) => schedule.days_json) || [])
            .flat() || [];

        // Remove duplicates using Set
        const uniqueDaysJson = [...new Set(allowedDays)];

        // Map the day of the week to the corresponding day string (sun, mon, tue, ...)
        const dayString = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dayOfWeek];

        // Check if the current day is in the allowed days
        const isAllowedDay = uniqueDaysJson.includes(dayString);

        // Get existing leave dates for the selected leave type
        const existingLeaveDates = user?.employees
            .flatMap((employee) =>
                employee.trans_leaves.filter(
                    (leave) => leave.leave_type_id === Number(form.watch("leave_type_id"))
                )
            ) || [];

        // Check if the current date falls within an existing leave range
        const isInExistingLeave = existingLeaveDates.some((leave) => {
            const startDate = normalizeDate(new Date(leave.start_date));
            const endDate = normalizeDate(new Date(leave.end_date));
            return currentDate >= startDate && currentDate <= endDate;
        });

        let count = 0;
        let currentDateInstance = dayjs(value.start.toString());
        let newDate; // This will hold the new date after the loop

        // Loop through the days to count available days up to the max date
        while (currentDateInstance.isBefore(value.end.toString())) {
            // Check if the date is available
            const isDateAvailable =
                !isAllowedDay || !isInExistingLeave || !isDateUnavailable(value.start);

            // If the date is available, increment the count
            if (isDateAvailable) {
                count++;
            }

            // Move to the next day in the range
            currentDateInstance = currentDateInstance.add(1, "day");
        }

        // The new date should be the day after the last checked date
        newDate = currentDateInstance; // At this point, currentDateInstance will be the next day after the last checked day
        console.log(`Total available days: ${count}`);
        console.log(`New Date: ${newDate.format("YYYY-MM-DD")}`);

        return new CalendarDate(newDate.year(), newDate.month() + 1, newDate.date());
    }, [employeeIdSelected, form, isDateUnavailable, user?.employees, value]);
    
    
    return (
        <FormDrawer
            title={title || "File a Leave Request"}
            description={description || "Fill out the form to request a leave."}
            onOpen={handleModalOpen}
            isOpen={isModalOpen}
            isLoading={isSubmitting}
            unSubmittable={!isValid || !isValidDate || (isAttachmentRequired && uploadedUrls.length === 0)}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <ScrollShadow>
                        <div className="space-y-4">
                            <EmployeeListForm
                                employees={user?.employees || []}
                                isLoading={isLoading}
                                onSelected={setEmployeeIdSelected}
                            />
                            <LeaveTypeSelection
                                max={handleMaxDaysChange}
                                isAttachmentRequired={setIsAttachmentRequired}
                                leaveTypes={employeeLeaveTypes!}
                                isDisabled={!form.watch("employee_id")}
                            />
                            <FormFields
                                items={[
                                    {
                                        name: "leave_date_range",
                                        label: "Date of Leave",
                                        Component: (field) => (
                                            <DateRangePicker
                                                maxValue={maxDate}
                                                isDisabled={!form.watch("leave_type_id")}
                                                variant="bordered"
                                                radius="sm"
                                                classNames={DateStyle}
                                                allowsNonContiguousRanges
                                                showMonthAndYearPickers
                                                granularity="minute"
                                                hideTimeZone
                                                minValue={today(getLocalTimeZone())}
                                                onChange={(value) => {
                                                    field.onChange(value);
                                                    setDateRange(value);
                                                }}

                                                calendarProps={{
                                                    onChange: (value) => {
                                                        const startDateOfLeave = normalizeCalendarDateToDate(value as CalendarDate);
                                                        console.log("Start Date: ", startDateOfLeave);

                                                        // Add the specified max days to calculate the end date
                                                        const addDays = dayjs(startDateOfLeave).add(maxLeaveDays, 'days');

                                                        // Check if the selected date is in the past (disable backward dates)
                                                        if (dayjs(startDateOfLeave).isBefore(dayjs(), 'day')) {
                                                            console.log("Selected date is in the past and will not trigger.");
                                                            return; // Do nothing for past dates
                                                        }

                                                        // Set the range for the leave, starting from the selected date
                                                        setValue({
                                                            start: value,
                                                            end: new CalendarDate(addDays.year(), addDays.month() + 1, addDays.date()),
                                                        });

                                                        console.log("Leave period set:", {
                                                            start: value.toString(),
                                                            end: new CalendarDate(addDays.year(), addDays.month() + 1, addDays.date()).toString(),
                                                        });
                                                    }

                                                }}
                                                isDateUnavailable={(date) => {
                                                    const existingLeaveDates = user?.employees
                                                        .map((employee) => employee.trans_leaves.filter((leave) => leave.leave_type_id === Number(form.watch("leave_type_id"))))
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

                                                    // Get the day of the week from the date (0 = Sunday, 1 = Monday, etc.)
                                                    const dayOfWeek = currentDate.getDay(); // 0 - Sunday, 1 - Monday, ..., 6 - Saturday
                                                    // const allowedDays = user?.employees.map(item => item.dim_schedules.filter(sched => sched.days_json)).map(days => days.);

                                                    const allowedDays = user?.employees.filter(item => item.id === employeeIdSelected).flatMap(employee => employee.dim_schedules?.map(schedule => schedule.days_json).flat() || []);


                                                    // Remove duplicates using Set
                                                    const uniqueDaysJson = [...new Set(allowedDays)];

                                                    // Map the day of the week to the corresponding day string (mon, tue, ...)
                                                    const dayString = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dayOfWeek];

                                                    // Check if the current day is in the allowed days
                                                    const isAllowedDay = uniqueDaysJson.includes(dayString);
                                                    // const isAllowedDay = !isWeekend(date, locale);


                                                    // Return if the date is unavailable (either already in leave or not in allowed days)
                                                    return !isAllowedDay || isInExistingLeave || isDateUnavailable(date);
                                                }}
                                            />
                                        ),
                                    },
                                    { name: "reason", label: "Reason for Leave", type: "text-area", isRequired: true },
                                ]}
                            />
                            {isAttachmentRequired && (
                                <FileDropzone
                                    onChange={setDocumentAttachments}
                                    value={documentAttachments}
                                    dropzoneOptions={{ accept: { "application/pdf": [".pdf"] } }}
                                />
                            )}
                        </div>
                    </ScrollShadow>
                </form>
            </Form>
        </FormDrawer>
    );
}

export default RequestForm;

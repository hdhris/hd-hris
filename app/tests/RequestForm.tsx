import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {EditCreditProp} from "@/app/(admin)/(core)/leaves/leave-credits/page";
import FormDrawer from '@/components/common/forms/FormDrawer';
import {useForm} from "react-hook-form";
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
import {CalendarDate, DateValue, getLocalTimeZone, Time, today} from "@internationalized/date";
import {useHolidays} from "@/helper/holidays/unavailableDates";
import dayjs from "dayjs";
import {toGMT8} from "@/lib/utils/toGMT8";
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
    const {isDateUnavailable} = useHolidays()
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [user, setUser] = useState<EmployeeLeavesStatus | null>(null)
    const [employeeIdSelected, setEmployeeIdSelected] = useState<number>(0)
    const [maxLeave, setMaxLeave] = useState<number>(0)
    const [isAttachmentRequired, setIsAttachmentRequired] = useState<boolean>(false)
    const [isValidTime, setIsValidTime] = useState<boolean>(false)

    const form = useForm<z.infer<typeof LeaveRequestFormValidation>>({
        resolver: zodResolver(LeaveRequestFormValidation), defaultValues: {
            employee_id: 0, reason: "", leave_type_id: 0, // Ensure the leave_type_id has a default value,
            leave_date_range: {
                start: "", end: ""
            },
        }
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
    const employee_leave_type = useMemo(() => {
        const employee = user?.employees.find(item => item.id === employeeIdSelected);

        if (!employee) {
            return []; // Return an empty array if the employee is not found
        }

        return user?.availableLeaves.filter(leaveType => employee.leave_balances.some(balance => balance.leave_type_id === leaveType.id))
    }, [user, employeeIdSelected])

    const max = useMemo(() => {
        const remainingLeaves =
            user?.employees
                .find((emp) => emp.id === employeeIdSelected)
                ?.leave_balances.find(
                (leave) => leave.leave_type_id === Number(form.watch("leave_type_id"))
            )?.remaining_days || 0;

       return  Math.min(remainingLeaves, maxLeave);
    }, [employeeIdSelected, form, maxLeave, user?.employees])

    const maxMinTime = useMemo(() => {
        const clock = user?.employees
            .filter(item => item.id === employeeIdSelected)  // Filter by employee ID
            .flatMap(item => item.dim_schedules)  // Flatten the array of schedules
            .find(item => item.ref_batch_schedules);

        if(clock){
            const clock_in = toGMT8(clock?.ref_batch_schedules.clock_in);
            const clock_out = toGMT8(clock?.ref_batch_schedules.clock_out);

            const time_in = clock_in;  // Format clock_in to hours and minutes
            const time_out = clock_out;
            return {
                time_in,
                time_out
            };
        }


        console.log("Clock: ", clock);
        return null
    }, [employeeIdSelected, user?.employees]);


    // console.log("Time: ", maxMinTime)

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
    },[employeeIdSelected, user?.employees])
    
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
    },[dateUnavailable]);


    const calculateRemainingDays = useCallback((startDate: DateValue, endDate: DateValue, basedDays: number) => {
        // Define new working hours (9:30 AM to 5:00 PM)
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
        const availableDaysCount = countAvailableDays(startDate, endDate);  // Function to calculate available working days excluding weekends

        // Calculate the fractional deduction based on available working days
        const fractionalDeduction =
            (availableDaysCount - 1) + workedFractionalDay;

        // Calculate the remaining days (as a decimal)
        const remainingDays = basedDays - fractionalDeduction;

        // Output the remaining days as a decimal
        console.log('Remaining Days (as decimal):', remainingDays.toFixed(2));

        return remainingDays.toFixed(2);
    }, [countAvailableDays]);


    const handleOnSubmit = useCallback((values: z.infer<typeof LeaveRequestFormValidation>) => {
        console.log("Values: ", values)
        // const remainingDays = calculateRemainingDays()

    }, [])

    // const isInvalid = (useCallback(() => {
    //     // Parsing input time, min time, and max time without 'Z' to avoid time zone issues
    //     const inputTime = new Date(`1970-01-01T${maxMinTime?.time_in}:00`);
    //     const minTime = new Date(`1970-01-01T${maxMinTime?.time_in}:00`);
    //     const maxTime = new Date(`1970-01-01T${maxMinTime?.time_out}:00`);
    //
    //     // Debug the values
    //     console.log("Input Time:", inputTime);
    //     console.log("Min Time:", minTime);
    //     console.log("Max Time:", maxTime);
    //
    //     const isInvalidTime = inputTime < minTime || inputTime > maxTime;
    //     console.log("Is Invalid Time:", isInvalidTime);
    //     return isInvalidTime;
    // }, [maxMinTime?.time_in, maxMinTime?.time_out]))();

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
                    timeInputProps={{
                        // isInvalid: true,  // Directly use the computed boolean value
                        // minValue: new Time(
                        //     Number(maxMinTime?.time_in.split(":")[0]),
                        //     Number(maxMinTime?.time_in.split(":")[1]),
                        //     0
                        // ),
                        // maxValue: new Time(
                        //     Number(maxMinTime?.time_out.split(":")[0]),
                        //     Number(maxMinTime?.time_out.split(":")[1]),
                        //     0
                        // ),
                        // onChange: (value) => {
                        //     console.log("Value: ", value)
                        // },
                        errorMessage: (value) => {
                            // console.log("Is Valid Time: ", value.isInvalid);
                            return "Please enter a valid time within the allowed range."
                        },
                    }}
                    onChange={(value) => {
                        const startDate = value?.start;
                        const endDate = value?.end;

                        console.log("Time: ", maxMinTime);
                        console.log("Start: ", startDate);
                        console.log("End: ", endDate);

// Normalize CalendarDate objects to JavaScript Date objects
                        const sd = normalizeCalendarDateToDate(startDate as CalendarDate);
                        const ed = normalizeCalendarDateToDate(endDate as CalendarDate);

// Extract the time portion from `time_in` and `time_out`
                        const startTime = new Date(`1970-01-01T${maxMinTime?.time_in}:00Z`);  // UTC-based date to avoid timezone issues
                        const endTime = new Date(`1970-01-01T${maxMinTime?.time_out}:00Z`);  // UTC-based date to avoid timezone issues

                        console.log("Normalized Start Date: ", dayjs(sd));
                        console.log("Normalized End Date: ", dayjs(ed));
                        console.log("Start Time: ", maxMinTime?.time_in);
                        console.log("End Time: ", maxMinTime?.time_out)

                        // if (!isValidStartTime || !isValidEndTime) {
                        //     console.log("Error: Invalid Time");
                        // } else {
                        //     console.log("Valid Time");
                        // }
                        if (startDate && endDate) {
                            const availableDays = countAvailableDays(startDate, endDate);
                            if(availableDays > max){
                                console.log("Error: Leave Days Exceeded");
                            }
                            console.log("User: ", user?.employees)
                            console.log(`Available days: ${availableDays}`);
                        }

                    }}
                />)
        }
    }, {
        name: "reason", label: "Reason for Leave", type: "text-area", isRequired: true, // Component: (field) => {
    },]


    return (<FormDrawer title={title || "File A leave Request"}
                        description={description || "Fill out the form to request a leave."}
                        onOpen={handleModalOpen} isOpen={isModalOpen}>
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
                        </div>
                    </ScrollShadow>
                </form>
            </Form>
        </FormDrawer>);
}

export default RequestForm;


const normalizeDate = (inputDate: Date) => new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());

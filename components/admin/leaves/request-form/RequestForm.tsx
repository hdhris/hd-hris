'use client';

import React, {useCallback, useEffect, useState} from 'react';
import {Card, CardBody, CardHeader, cn, DateRangePicker, RangeValue, Textarea} from "@nextui-org/react";
import {Form} from "@/components/ui/form";
import {useForm, useFormState} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {LeaveRequestFormValidation} from "@/helper/zodValidation/leaves/request-form/LeaveRequestFormValidation";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import EmployeeListForm from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";
import LeaveTypeSelection from "@/components/admin/leaves/request-form/LeaveTypeSelection";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import FileUpload from "@/components/common/forms/FileUpload";
import Typography from "@/components/common/typography/Typography";
import {Button} from "@nextui-org/button";
import {DateValue, getLocalTimeZone, parseAbsoluteToLocal, today} from "@internationalized/date";
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import {useFormTable} from "@/components/providers/FormTableProvider";
import {EmployeeLeavesStatus, RequestFormTableType, RequestFormWithMethod} from "@/types/leaves/LeaveRequestTypes";
import {useEmployeesLeaveStatus} from "@/services/queries";
import {Case, Default, Switch} from '@/components/common/Switch';
import {useEmployeeId} from "@/hooks/employeeIdHook";

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore);


function RequestForm() {
    const {data, isLoading} = useEmployeesLeaveStatus()
    const [user, setUser] = useState<EmployeeLeavesStatus | null>(null)
    const [isAdd, setIsAdd] = useState<boolean>(true)
    const [maxLeaveApplied, setMaxLeaveApplied] = useState<number>(0)

    const employeeId = useEmployeeId()
    console.log("Employee Id: ", employeeId)

    useEffect(() => {
        const dataFetch = async () => {
            const storedEmployees = localStorage.getItem("requestItems");
            if (data) {
                if (storedEmployees) {
                    const addedEmployees: RequestFormTableType[] = JSON.parse(storedEmployees);
                    // Filter out added employees from the original employee list
                    const filteredEmployees = data.employees.filter((employee) => !addedEmployees.some((addedEmp) => addedEmp.id === employee.id));


                    // Update user state with filtered employees
                    setUser(() => ({
                        availableLeaves: data.availableLeaves,  // Retain previous data
                        employees: filteredEmployees.sort((a, b) => a.name.localeCompare(b.name)),
                    }));
                } else {
                    // If no added employees, set user to the original data
                    setUser(data);
                }
            } else {
                // If no data is present, set user to null
                setUser(null);
            }
        }

        dataFetch()
    }, [data]);

    const {formData, setFormData} = useFormTable<RequestFormWithMethod>()
    const [leaveTypeDuration, setLeaveTypeDuration] = useState<number | null>(null)
    const [isDatePickerError, setIsDatePickerError] = useState<boolean>(false)
    const [leaveDate, setLeaveDate] = React.useState<RangeValue<DateValue> | null>(null);
    const [currentUser, setCurrentUser] = useState<any | null>(null); // State to store the currently edited user
    const form = useForm<z.infer<typeof LeaveRequestFormValidation>>({
        resolver: zodResolver(LeaveRequestFormValidation), defaultValues: {
            employee_id: 0, reason: "", leave_type_id: 0, // Ensure the leave_type_id has a default value,
            comment: ""
        }
    });

    const {isDirty, isValid} = useFormState(form)
    const reset = () => {
        form.reset({
            employee_id: 0, leave_type_id: 0, comment: "", reason: "",
        });
        setLeaveTypeDuration(null);
        setLeaveDate(null);
        setIsAdd(true);
    }

// Your other code...
    const handleClear = () => {
        reset()
        setUser((prevState) => {
            return {
                availableLeaves: prevState?.availableLeaves!,
                employees: prevState?.employees.filter(item => item.id !== currentUser?.id)!,
            };
        });

    };

    const handleFormDataChange = useCallback(() => {
        if (formData?.method === "Delete") {
            const newUser = formData.data.id;
            const addNew = data?.employees.find((emp) => emp.id === newUser)!;
            if (newUser) {
                reset()
                setUser((prevData) => {
                    const updatedEmployees = prevData?.employees.filter(emp => emp.id !== currentUser.id) || [];
                    return {
                        availableLeaves: prevData?.availableLeaves || [], employees: [addNew, ...updatedEmployees],
                    };
                });

            }
        } else if (formData?.method === "Edit") {
            const editUser = formData.data;
            const addNew = data?.employees.find((emp) => emp.id === editUser.id)!;
            const leave_duration_available = data?.availableLeaves.find((leave) => leave.id === editUser.leave_id)?.duration_days;

            if (editUser) {
                setCurrentUser(editUser);
                form.reset({
                    employee_id: editUser.id,
                    leave_type_id: editUser.leave_id,
                    comment: editUser.comment,
                    reason: editUser.reason,
                });

                setUser((prevData) => {
                    return {
                        availableLeaves: prevData?.availableLeaves || [], employees: [addNew],
                    };
                });

                const startDate = dayjs(editUser.start_date);
                const endDate = dayjs(editUser.end_date);

                if (startDate.isValid() && endDate.isValid()) {
                    const start = parseAbsoluteToLocal(startDate.toISOString());
                    const end = parseAbsoluteToLocal(endDate.toISOString());

                    setLeaveDate({start, end});
                } else {
                    console.error("Invalid start or end date in formData", {startDate, endDate});
                }

                const credit = addNew.leave_balances.remaining_days;
                const leaveDuration = leave_duration_available ?? 0; // Provide a default value if leave_duration_available is undefined
                setLeaveTypeDuration(credit < leaveDuration ? credit : leaveDuration);
            }
            setIsAdd(false);
        } else if(formData?.method === "Reset") {
            console.log("Reset...")

            console.log("Data: ", data)
            setUser((prevData) => {
                return {
                    availableLeaves: prevData?.availableLeaves || [],
                    employees: data?.employees!,
                };
            });
        }
    }, [formData, data, currentUser, form, setUser]);

// Use an effect to handle the form data change
    useEffect(() => {
        handleFormDataChange();
    }, [formData, handleFormDataChange]);


    useEffect(() => {
        const subscription = form.watch((value) => {
            const employeeId = value.employee_id;
            const leaveTypeId = value.leave_type_id;

            if (employeeId && leaveTypeId) {
                const selectedEmployee = user?.employees.find((emp) => emp.id === employeeId);
                if (selectedEmployee) {
                    setLeaveTypeDuration(selectedEmployee.leave_balances.remaining_days);
                } else {
                    setLeaveTypeDuration(null); // Reset if no employee is found
                }
            } else {
                setLeaveTypeDuration(null); // Reset if employee_id is empty
            }

        });

        // Cleanup subscription on unmount
        return () => subscription.unsubscribe();

    }, [form, user?.employees]);


    async function onSubmit(values: z.infer<typeof LeaveRequestFormValidation>) {
        if (!isDatePickerError && leaveDate) {
            const employee = user?.employees.find((e: any) => e.id === values.employee_id)
            const leaveTypeApplied = user?.availableLeaves.find((e: any) => e.id === values.leave_type_id)
            if (employee && leaveTypeApplied) {
                const start_date = dayjs(leaveDate.start.toDate(getLocalTimeZone())).format("YYYY-MM-DD hh:mm A")
                const end_date = dayjs(leaveDate.end.toDate(getLocalTimeZone())).format("YYYY-MM-DD hh:mm A")
                const duration = dayjs(end_date).diff(dayjs(start_date), 'day')
                const employee_leave_requests: RequestFormTableType = {
                    department: employee.department,
                    created_by: {
                        name: '', picture: ''
                    },
                    comment: values.comment || '',
                    reason: values.reason,
                    name: employee.name,
                    id: employee.id,
                    picture: employee.picture,
                    leave_type: leaveTypeApplied.name,
                    start_date: dayjs(leaveDate.start.toDate(getLocalTimeZone())).format("YYYY-MM-DD hh:mm A"),
                    end_date: dayjs(leaveDate.end.toDate(getLocalTimeZone())).format("YYYY-MM-DD hh:mm A"),
                    total_days: duration,
                    leave_id: leaveTypeApplied.id,
                }

                console.log("Max Available Days (Submit): ", leaveTypeDuration)
                setFormData({
                    method: "Add", data: employee_leave_requests
                })
                const newUser = user?.employees.filter((e: any) => e.id !== values.employee_id)!

                setUser((prevData) => ({
                    availableLeaves: prevData?.availableLeaves!,  // Retain previous data
                    employees: newUser,
                }))
                form.reset()
                setLeaveTypeDuration(null)
                setLeaveDate(null)
                setIsAdd(true)
            }

        } else {
            setIsDatePickerError(true)
            return
        }

    }

    const handleOnEdit = () => {
        const comment = form.getValues("comment")
        const reason = form.getValues("reason")
        const employee_id = form.getValues("employee_id");
        const leave_type_id = form.getValues("leave_type_id");
        const start_date = dayjs(leaveDate?.start.toDate(getLocalTimeZone())).format("YYYY-MM-DD hh:mm A")
        const end_date = dayjs(leaveDate?.end.toDate(getLocalTimeZone())).format("YYYY-MM-DD hh:mm A")
        const leaveTypeApplied = user?.availableLeaves.find((e: any) => e.id === leave_type_id)!
        const employee = user?.employees.find((e: any) => e.id === employee_id)!
        const duration = dayjs(end_date).diff(dayjs(start_date), 'day')

        setFormData({
            method: "Edit",
            data: {
                comment: comment || "", // Ensures comment is always a string
                reason: reason || "", // Provide fallback for reason
                id: employee_id, // Provide fallback for employee_id
                leave_type: leaveTypeApplied.name, // Provide fallback for leave_type_id
                start_date: start_date || "", // Provide fallback for start_date
                end_date: end_date || "" // Provide fallback for end_date
                ,

                created_by: {
                    name: '',
                    picture: ''
                },
                total_days: duration,
                leave_id: leaveTypeApplied.id,
                department: employee?.department,
                name: employee.name,
                picture: employee.picture,
            }
        });

        console.log("Edit: ", {
            comment, reason, employee_id, leave_type_id, start_date, end_date
        })
    }


    const LeaveRequestForm: FormInputProps[] = [{
        name: "leave_date_range",
        label: "Leave Date Range",
        inputClassName: isDatePickerError ? "text-destructive" : "",
        isRequired: true,
        Component: () => {
            return (<div
                    className={cn("w-full flex flex-row gap-4", leaveTypeDuration === null ? 'opacity-50 pointer-events-none cursor-not-allowed' : "")}>
                <DateRangePicker
                    granularity="hour"
                    aria-label="Leave Date Range"
                    variant="bordered"
                    radius="sm"
                    hideTimeZone
                    isDisabled={leaveTypeDuration === null}
                    value={leaveDate} // LeaveDate is used directly here
                    isRequired
                    errorMessage={(value) => {
                        if(value.isInvalid) {
                            setIsDatePickerError(true)
                            return value.validationErrors
                        }
                    }}
                    minValue={today(getLocalTimeZone())}
                    maxValue={today(getLocalTimeZone()).add({ days: leaveTypeDuration! })}
                    onChange={(value) => {
                        // Check if the selected value is null

                        // Define the allowed date range
                        const startDate = dayjs(today(getLocalTimeZone()).toString());
                        const endDate = dayjs(today(getLocalTimeZone()).add({ days: leaveTypeDuration! }).toString());

                        // Convert the input dates (start and end) to Day.js objects
                        const startDayJs = dayjs(value?.start?.toDate(getLocalTimeZone())); // Example input: 2024-09-29 00:00:00
                        const endDayJs = dayjs(value?.end?.toDate(getLocalTimeZone()));     // Example input: 2024-10-03 00:00:00

                        // Check if the selected start and end dates are within the specified range
                        const isStartInRange = startDayJs.isSameOrAfter(startDate); // Start date should be on or after today
                        const isEndInRange = endDayJs.isSameOrBefore(endDate);      // End date should be on or before max allowed date

                        const isDateRangeValid = isStartInRange && isEndInRange;

                        if (!isDateRangeValid) {
                            setIsDatePickerError(true);
                            setLeaveDate(null);
                        } else {
                            setIsDatePickerError(false);
                            setLeaveDate(value);
                        }
                    }}
                />


            </div>);
        }
    }, {
        name: "reason", label: "Reason for Leave", isRequired: true, Component: (field) => {
            return (<div className="w-full flex flex-row gap-4">
                <Textarea
                    radius="sm"
                    variant="bordered"
                    labelPlacement="outside"
                    placeholder="Add your reason here..."
                    className="col-span-12 md:col-span-6 mb-6 md:mb-0"
                    {...field}
                />
            </div>);
        }
    }, {
        name: "comment", label: "Comment", Component: (field) => {
            return (<div className="w-full flex flex-row gap-4">
                <Textarea
                    radius="sm"
                    variant="bordered"
                    labelPlacement="outside"
                    placeholder="Add your comment here..."
                    className="col-span-12 md:col-span-6 mb-6 md:mb-0"
                    {...field}
                />
            </div>);
        }
    }]

    return (<Card className="h-full w-[400px] pb-4" radius="sm">
        <CardHeader>Leave Request</CardHeader>
        <CardBody>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <ScrollShadow>
                        <div className="space-y-4">
                            <div className="flex flex-col space-y-4">
                                <EmployeeListForm employees={user?.employees!} isLoading={isLoading}/>
                                <LeaveTypeSelection duration={(days) => {
                                    if (user?.employees) {
                                        const selectedEmployee = user.employees.find((emp) => emp.id === form.getValues("employee_id"));

                                        const remainingDays = selectedEmployee?.leave_balances?.remaining_days ?? null;
                                        console.log("Days: ", days)
                                        console.log("Remaining Days: ", remainingDays)
                                        if (remainingDays) {
                                            if (remainingDays < days!) {
                                                setLeaveTypeDuration(remainingDays);
                                            } else {
                                                setLeaveTypeDuration(days);
                                            }
                                        }
                                    }

                                    // setLeaveTypeDuration(days)
                                }}
                                                    leaveTypes={user?.availableLeaves!} isLoading={isLoading}/>
                            </div>
                            <FormFields items={LeaveRequestForm}/>
                            <div className="flex flex-col gap-2">
                                <Typography className="text-sm font-medium">Upload Documents</Typography>
                                <FileUpload
                                    className="rounded-sm"
                                    dropzoneOptions={{
                                        accept: {
                                            'application/pdf': ['.pdf'],
                                            'application/msword': ['.doc'],
                                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                                        },
                                    }}
                                />

                            </div>
                            <div className="w-full flex justify-end gap-2">
                                <Button variant="light" radius="sm" size="sm" onClick={handleClear}>Clear</Button>
                                <Switch expression={isAdd}>
                                    <Case of={true}>
                                        <Button color="primary" isDisabled={!isDirty || !isValid || isDatePickerError} radius="sm" size="sm" type="submit">Add</Button>
                                    </Case>
                                    <Default>
                                        <Button color="primary" isDisabled={isDatePickerError} radius="sm" size="sm" onClick={handleOnEdit}>Update</Button>
                                    </Default>
                                </Switch>

                            </div>


                        </div>
                    </ScrollShadow>
                </form>
            </Form>
        </CardBody>
    </Card>);
}

export default RequestForm;

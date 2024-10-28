'use client';

import React, {useCallback, useEffect, useState} from 'react';
import {Card, CardBody, CardHeader, RangeValue} from "@nextui-org/react";
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
import {EmployeeLeavesStatus, RequestFormTableType} from "@/types/leaves/LeaveRequestTypes";
import {useEmployeesLeaveStatus} from "@/services/queries";
import {Case, Default, Switch} from '@/components/common/Switch';

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore);


function RequestForm() {
    const {data, isLoading} = useEmployeesLeaveStatus()
    const [user, setUser] = useState<EmployeeLeavesStatus | null>(null)
    const [isAdd, setIsAdd] = useState<boolean>(true)
    const [minLeave, setMinLeave] = useState<number>(0)
    const [maxLeave, setMaxLeave] = useState<number>(0)
    const [isAttachmentRequired, setIsAttachmentRequired] = useState<boolean>(false)

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

    const {formData, setFormData} = useFormTable<RequestFormTableType>()
    // const [leaveTypeDuration, setLeaveTypeDuration] = useState<number | null>(null)
    const [isDatePickerError, setIsDatePickerError] = useState<boolean>(false)
    const [leaveDate, setLeaveDate] = React.useState<RangeValue<DateValue> | null>();
    const [employeeIdSelected, setEmployeeIdSelected] = useState<number>(0)
    const [currentUser, setCurrentUser] = useState<any | null>(null); // State to store the currently edited user
    const form = useForm<z.infer<typeof LeaveRequestFormValidation>>({
        resolver: zodResolver(LeaveRequestFormValidation), defaultValues: {
            employee_id: 0, reason: "", leave_type_id: 0, // Ensure the leave_type_id has a default value,
            days_of_leave: "", leave_date: "", comment: ""
        }
    });
    const {isDirty, isValid} = useFormState(form)
    const reset = useCallback(() => {
        form.reset({
            employee_id: 0, reason: "", leave_type_id: 0, // Ensure the leave_type_id has a default value,
            days_of_leave: "", leave_date: "", comment: ""
        });        // setLeaveTypeDuration(null);
        setLeaveDate(null);
        setIsAdd(true);
    }, [form])

    const minMax = React.useMemo(() => {

        const remainingLeaves = user?.employees.find(emp => emp.id === employeeIdSelected)?.leave_balances.remaining_days ?? 0

        if (remainingLeaves > maxLeave) {
            return Array.from({length: maxLeave - minLeave + 1}).map((_, i) => ({
                label: String(`${minLeave + i} ${minLeave + i === 1 ? "Day" : "Days"}`), value: String(minLeave + i)
            }))
        } else {
            return Array.from({length: remainingLeaves - minLeave + 1}).map((_, i) => ({
                label: String(`${minLeave + i} ${minLeave + i === 1 ? "Day" : "Days"}`), value: String(minLeave + i)
            }))
        }
        // return Array.from({length: maxLeave - minLeave + 1}).map((_, i) => ({
        //     label: String(`${minLeave + i} ${minLeave + i === 1 ? "Day" : "Days"}`), value: String(minLeave + i)
        // }));
    }, [employeeIdSelected, maxLeave, minLeave, user?.employees])

// Your other code...
    const handleClear = () => {
        reset()
        setUser((prevState) => {
            return {
                availableLeaves: prevState?.availableLeaves!,
                employees: prevState?.employees!,
            };
        });

    };

    const handleFormDataChange = useCallback(() => {
        if (formData?.method === "Delete") {
            const newUser = formData.data.id;
            const addNew = data?.employees.find((emp) => emp.id === newUser)!;
            if (newUser) {
                reset()
                console.log("New: ", addNew);
                setUser((prevData) => {
                    // const updatedEmployees = prevData?.employees.filter(emp => emp.id !== currentUser.id) || [];
                    console.log("Updated: ", prevData);
                    return {
                        availableLeaves: prevData?.availableLeaves || [], employees: [addNew, ...prevData?.employees!],
                    };
                });

            }
        } else if (formData?.method === "Edit") {
            const editUser = formData.data;
            const addNew = data?.employees.find((emp) => emp.id === editUser.id)!;
            const leave_duration_available = data?.availableLeaves.find((leave) => leave.id === editUser.leave_id)?.max;

            console.log("Edit User: ", editUser);
            if (editUser) {
                setCurrentUser(editUser);
                form.reset({
                    employee_id: editUser.id,
                    leave_type_id: editUser.leave_id,
                    days_of_leave: String(editUser.total_days),
                    leave_date: "",
                    comment: editUser.comment,
                    reason: editUser.reason,
                });

                setUser((prevData) => {
                    return {
                        availableLeaves: prevData?.availableLeaves || [], employees: [addNew],
                    };
                });
                //
                // const startDate = dayjs(editUser.start_date);
                // const endDate = dayjs(editUser.end_date);
                //
                // if (startDate.isValid() && endDate.isValid()) {
                //     const start = parseAbsoluteToLocal(startDate.toISOString());
                //     const end = parseAbsoluteToLocal(endDate.toISOString());
                //
                //     setLeaveDate({start, end});
                // } else {
                //     console.error("Invalid start or end date in formData", {startDate, endDate});
                // }
                //
                // const credit = addNew.leave_balances.remaining_days;
                // const leaveDuration = leave_duration_available ?? 0; // Provide a default value if leave_duration_available is undefined
                // setLeaveTypeDuration(credit < leaveDuration ? credit : leaveDuration);
            }
            setIsAdd(false);
        } else if (formData?.method === "Reset") {
            setUser((prevData) => {
                return {
                    availableLeaves: prevData?.availableLeaves || [], employees: data?.employees!,
                };
            });
        }
    }, [formData, data, form, reset, setUser]);

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
                    setMaxLeave(selectedEmployee.leave_balances.remaining_days);
                } else {
                    setMaxLeave(0); // Reset if no employee is found
                }
            } else {
                setMaxLeave(0); // Reset if employee_id is empty
            }

        });

        // Cleanup subscription on unmount
        return () => subscription.unsubscribe();

    }, [form, user?.employees]);


    async function onSubmit(values: z.infer<typeof LeaveRequestFormValidation>) {
        console.log("Values: ", values)
        const employee = user?.employees.find((e: any) => e.id === values.employee_id)
        const leaveTypeApplied = user?.availableLeaves.find((e: any) => e.id === values.leave_type_id)
        if (employee && leaveTypeApplied) {
            const start_date = dayjs(values.leave_date).format("YYYY-MM-DD hh:mm A")
            const end_date = dayjs(values.leave_date).add(Number(values.days_of_leave), "day").format("YYYY-MM-DD hh:mm A")
            console.log("End: ", end_date)
            const duration = Number(values.days_of_leave)
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
                start_date: start_date,
                end_date: end_date,
                total_days: duration,
                leave_id: leaveTypeApplied.id,
            }

            // console.log("Max Available Days (Submit): ", leaveTypeDuration)
            setFormData({
                method: 'Add', data: employee_leave_requests
            })
            const newUser = user?.employees.filter((e: any) => e.id !== values.employee_id)!

            setUser((prevData) => ({
                availableLeaves: prevData?.availableLeaves!,  // Retain previous data
                employees: newUser,
            }))
            form.reset()
            setMaxLeave(0)
            setLeaveDate(null)
            setIsAdd(true)
        }
        // if (!isDatePickerError && leaveDate) {
        //
        //
        // } else {
        //     setIsDatePickerError(true)
        //     return
        // }

    }

    const handleOnEdit = () => {
        const comment = form.getValues("comment")
        const reason = form.getValues("reason")
        const employee_id = form.getValues("employee_id");
        const leave_type_id = form.getValues("leave_type_id");
        const start_date = form.getValues("leave_date")
        const duration = Number(form.getValues("days_of_leave"))
        const end_date = dayjs(start_date).add(duration, "day").format("YYYY-MM-DD hh:mm A")
        const leaveTypeApplied = user?.availableLeaves.find((e: any) => e.id === leave_type_id)!
        const employee = user?.employees.find((e: any) => e.id === employee_id)!

        setFormData({
            method: "Edit", data: {
                comment: comment || "", // Ensures comment is always a string
                reason: reason || "", // Provide fallback for reason
                id: employee_id, // Provide fallback for employee_id
                leave_type: leaveTypeApplied.name, // Provide fallback for leave_type_id
                start_date: start_date || "", // Provide fallback for start_date
                end_date: end_date || "" // Provide fallback for end_date
                ,

                created_by: {
                    name: '', picture: ''
                },
                total_days: duration,
                leave_id: leaveTypeApplied.id,
                department: employee?.department,
                name: employee.name,
                picture: employee.picture,
            }
        });

    }


    const LeaveRequestForm: FormInputProps[] = [{

        isRequired: true, name: "days_of_leave", type: "auto-complete", label: "Days of Leave", config: {
            options: minMax, isClearable: true, isDisabled: !form.watch("leave_type_id") || minMax.length === 0,
        }

    }, {
        inputDisabled: !form.watch("leave_type_id") || minMax.length === 0,
        isRequired: true,
        name: "start_date",
        type: "date-picker",
        label: "Start Date",
        config: {
            granularity: "hour", hideTimeZone: true, minValue: today(getLocalTimeZone())
        }

    }, {
        name: "reason", label: "Reason for Leave", type: "text-area", isRequired: true, // Component: (field) => {
    }, {
        name: "comment", label: "Comment", type: "text-area", // Component: (field) => {
    }]

    return (<Card className="h-full w-[400px] pb-4" radius="sm">
        <CardHeader>Leave Request</CardHeader>
        <CardBody>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <ScrollShadow>
                        <div className="space-y-4">
                            <div className="flex flex-col space-y-4">
                                <EmployeeListForm employees={user?.employees!} isLoading={isLoading}
                                                  onSelected={setEmployeeIdSelected}/>
                                <LeaveTypeSelection min={setMinLeave} max={setMaxLeave}
                                                    isAttachmentRequired={setIsAttachmentRequired}
                                                    leaveTypes={user?.availableLeaves!} isLoading={isLoading}/>
                                {form.watch("leave_type_id") && minMax.length === 0 ?
                                    <Typography className="!text-danger text-sm">Cannot apply this leave to this
                                        employee.
                                        Low leave credit balance</Typography> : ""}
                            </div>
                            <FormFields items={LeaveRequestForm}/>
                            {isAttachmentRequired && <div className="flex flex-col gap-2">
                                <div className="flex">
                                    <Typography className="text-sm font-medium mt-2">Upload Documents</Typography>
                                    <span className="ml-2 inline-flex text-destructive text-medium"> *</span>
                                </div>
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

                            </div>}
                            <div className="w-full flex justify-end gap-2">
                                <Button variant="light" radius="sm" size="sm" onClick={handleClear}>Clear</Button>
                                <Switch expression={isAdd}>
                                    <Case of={true}>
                                        <Button color="primary"
                                            // isDisabled={!isDirty || !isValid || isDatePickerError}
                                                radius="sm" size="sm" type="submit">Add</Button>
                                    </Case>
                                    <Default>
                                        <Button color="primary" isDisabled={isDatePickerError} radius="sm" size="sm"
                                                onClick={handleOnEdit}>Update</Button>
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

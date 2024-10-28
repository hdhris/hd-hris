"use client"
import React, {useCallback, useEffect, useState} from 'react';
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import EmployeeListForm from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";
import LeaveTypeSelection from "@/components/admin/leaves/request-form/LeaveTypeSelection";
import Typography from "@/components/common/typography/Typography";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import FileUpload from "@/components/common/forms/FileUpload";
import {Form} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {LeaveRequestFormValidation} from "@/helper/zodValidation/leaves/request-form/LeaveRequestFormValidation";
import {zodResolver} from "@hookform/resolvers/zod";
import {getLocalTimeZone, today} from "@internationalized/date";
import {useEmployeesLeaveStatus} from "@/services/queries";
import {EmployeeLeavesStatus} from "@/types/leaves/LeaveRequestTypes";
import {EditCreditProp} from "@/app/(admin)/(core)/leaves/leave-credits/page";
import FormDrawer from '@/components/common/forms/FormDrawer';
import {axiosInstance} from "@/services/fetcher";
import {AxiosError} from "axios";
import {useToast} from "@/components/ui/use-toast";


interface LeaveRequestFormProps {
    title?: string
    description?: string
    onOpen: (value: boolean) => void
    isOpen: boolean,
    employee?: EditCreditProp
}

function RequestForm({title, description, onOpen, isOpen, employee}: LeaveRequestFormProps) {
    const {data, isLoading} = useEmployeesLeaveStatus()
    const [user, setUser] = useState<EmployeeLeavesStatus | null>(null)
    const [employeeIdSelected, setEmployeeIdSelected] = useState<number>(0)
    const [minLeave, setMinLeave] = useState<number>(0)
    const [maxLeave, setMaxLeave] = useState<number>(0)
    const [isAttachmentRequired, setIsAttachmentRequired] = useState<boolean>(false)

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const {toast} = useToast()
    // Handle modal open/close state changes
    const handleModalOpen = useCallback((value: boolean) => {
        setIsModalOpen(value);
        onOpen(value);
    }, [onOpen]);

    const form = useForm<z.infer<typeof LeaveRequestFormValidation>>({
        resolver: zodResolver(LeaveRequestFormValidation), defaultValues: {
            employee_id: 0, reason: "", leave_type_id: 0, // Ensure the leave_type_id has a default value,
            days_of_leave: "", leave_date: "", comment: ""
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

    const minMax = React.useMemo(() => {

        const remainingLeaves = user?.employees.find(emp => emp.id === employeeIdSelected)?.leave_balances.remaining_days ?? 0

        console.log("Emp: ", user?.employees)
        console.log("Remaining: ", remainingLeaves)
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

    const LeaveRequestForm: FormInputProps[] = [{
        isRequired: true, name: "days_of_leave", type: "auto-complete", label: "Days of Leave", config: {
            options: minMax, isClearable: true, isDisabled: !form.watch("leave_type_id") || minMax.length === 0,
        }

    }, {
        inputDisabled: !form.watch("leave_type_id") || minMax.length === 0,
        isRequired: true,
        name: "leave_date",
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

    async function onSubmit(values: z.infer<typeof LeaveRequestFormValidation>) {
        console.log("Values: ", values)
        const items = {
            id: employee?.id, ...values,
        }

        // console.log("Values: ", values)
        try {
            setIsSubmitting(true)
            if (employee?.id) {
                const res = await axiosInstance.post("/api/admin/leaves/requests/update", items)
                if (res.status === 200) {
                    toast({
                        title: "Success", description: "Leave credit updated successfully", variant: "success",
                    })
                    form.reset({
                        employee_id: 0, reason: "", leave_type_id: 0, // Ensure the leave_type_id has a default value,
                        days_of_leave: "", leave_date: "", comment: ""
                    });
                    setIsModalOpen(false)
                } else {
                    toast({
                        title: "Error", description: res.data.message, variant: "danger",
                    })
                }
            } else {
                const res = await axiosInstance.post("/api/admin/leaves/requests/create", values)
                if (res.status === 200) {
                    toast({
                        title: "Success", description: "Leave credit created successfully", variant: "success",
                    })
                    form.reset({
                        employee_id: 0, reason: "", leave_type_id: 0, // Ensure the leave_type_id has a default value,
                        days_of_leave: "", leave_date: "", comment: ""
                    });
                } else {
                    toast({
                        title: "Error", description: res.data.message, variant: "danger",
                    })
                }
            }
            // const res = await axiosInstance.post('/api/admin/leaves/leave-credit/create', data)

        } catch (e) {
            console.log("Error: ", e)
            if (e instanceof AxiosError) {
                toast({
                    title: "Error", description: e.response?.data.message, variant: "danger",
                })
            }
        } finally {
            setIsSubmitting(false)
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
                        {/*<div className="w-full flex justify-end gap-2">*/}
                        {/*    <Button variant="light" radius="sm" size="sm" onClick={handleClear}>Clear</Button>*/}
                        {/*    <Switch expression={isAdd}>*/}
                        {/*        <Case of={true}>*/}
                        {/*            <Button color="primary"*/}
                        {/*                // isDisabled={!isDirty || !isValid || isDatePickerError}*/}
                        {/*                    radius="sm" size="sm" type="submit">Add</Button>*/}
                        {/*        </Case>*/}
                        {/*        <Default>*/}
                        {/*            <Button color="primary" isDisabled={isDatePickerError} radius="sm" size="sm"*/}
                        {/*                    onClick={handleOnEdit}>Update</Button>*/}
                        {/*        </Default>*/}
                        {/*    </Switch>*/}

                        {/*</div>*/}


                    </div>
                </ScrollShadow>
            </form>
        </Form>
    </FormDrawer>);
}

export default RequestForm;
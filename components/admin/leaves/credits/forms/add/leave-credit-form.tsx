'use client'
import React, {Key, useCallback, useEffect, useState} from 'react';
import {useForm} from "react-hook-form";
import {LeaveCreditFormSchema} from "@/helper/zodValidation/leaves/leave-credits-form/leave-credit-form-schema";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {Form} from "@/components/ui/form";
import EmployeeListForm, {Employee} from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";
import {useLeaveCreditEmployees} from "@/services/queries";
import {axiosInstance} from "@/services/fetcher";
import {useToast} from "@/components/ui/use-toast";
import {AxiosError} from "axios";
import FormDrawer from "@/components/common/forms/FormDrawer";
import {Button} from "@nextui-org/button";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {LeaveTypeForEmployee} from "@/types/leaves/LeaveTypes";
import Typography from "@/components/common/typography/Typography";
import {Chip} from '@nextui-org/react';
import {LuInfo} from "react-icons/lu";
import {icon_size_sm} from "@/lib/utils";

interface LeaveCreditFormProps {
    onOpen: (value: boolean) => void
    isOpen: boolean,
}

function LeaveCreditForm({onOpen, isOpen}: LeaveCreditFormProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);
    const [employeeState, setEmployeeState] = useState<Employee[]>([]); // Initialize with employee prop if available
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [leaveTypes, setLeaveTypes] = useState<LeaveTypeForEmployee[]>([])
    const [employeeLeaveType, setEmployeeLeaveType] = useState<LeaveTypeForEmployee[] | null>()

    // Handle modal open/close state changes
    const handleModalOpen = useCallback((value: boolean) => {
        setIsModalOpen(value);
        onOpen(value);
    }, [onOpen]);

    const {toast} = useToast()
    const data = useLeaveCreditEmployees()
    const form = useForm<z.infer<typeof LeaveCreditFormSchema>>({
        defaultValues: {
            employee_id: 0, leave_credits: [],
        }, resolver: zodResolver(LeaveCreditFormSchema),
    });

    useEffect(() => {
        if (isOpen !== isModalOpen) {
            setIsModalOpen(isOpen);
        }
    }, [isLoadingDelete, isModalOpen, isOpen]);

    useEffect(() => {
        if (data && data.data) {
            setEmployeeState(data.data.employees);
            setLeaveTypes(data.data.leave_types)
        }
    }, [data]);


    const onSubmit = async (data: z.infer<typeof LeaveCreditFormSchema>) => {

        let values: {}


        const assign_to = data.apply_for
        if (assign_to === "all") {
            values = {
                employee_id: employeeState.map(emp => emp.id), leave_credits: data.leave_credits
            }
        } else if (assign_to === "regular") {
            values = {
                employee_id: employeeState.filter(item => item.is_regular === true).map(emp => emp.id),
                leave_credits: data.leave_credits
            }
        } else if (assign_to === "probationary") {
            values = {
                employee_id: employeeState.filter(item => item.is_regular === false).map(emp => emp.id),
                leave_credits: data.leave_credits
            }
        } else {
            values = {
                employee_id: [data.employee_id], leave_credits: data.leave_credits
            }
        }
        console.log("Create Data: ", values)

        try {
            setIsLoading(true)

            const res = await axiosInstance.post("/api/admin/leaves/leave-credit/create", values)
            if (res.status === 200) {
                toast({
                    title: "Success", description: "Leave credit created successfully", variant: "success",
                })
                form.reset()
            } else {
                toast({
                    title: "Error", description: res.data.message, variant: "danger",
                })
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
            setIsLoading(false)
        }
    }

    const handleOnSelectEmployee = (id: number) => {
        const is_regular = employeeState.find(emp => emp.id === id)?.is_regular

        const all_leave_type = leaveTypes.filter(leave_type => leave_type.applicable_to_employee_types === 'all')
        const available_leave_types = [...all_leave_type]
        if (is_regular) {
            const leave_type = leaveTypes.filter(leave_type => leave_type.applicable_to_employee_types === 'regular')
            available_leave_types.push(...leave_type)

        } else {
            const leave_type = leaveTypes.filter(leave_type => leave_type.applicable_to_employee_types === 'probationary')
            available_leave_types.push(...leave_type)
        }

        setEmployeeLeaveType(available_leave_types)
    }

    const handleDelete = useCallback(async (id: Key) => {
        setIsLoadingDelete(true)
        try {
            const res = await axiosInstance.post("/api/admin/leaves/leave-credit/delete", Number(id))
            if (res.status === 200) {
                toast({
                    title: "Success", description: "Leave credit deleted successfully", variant: "success",
                })
                handleModalOpen(false)
                form.reset({
                    employee_id: 0, leave_credits: [],
                })
            }
        } catch (err) {
            console.log(err)
            toast({
                title: "Error", description: "Failed to delete leave credit", variant: "danger",
            })
        } finally {
            setIsLoadingDelete(false)
        }
    }, [form, handleModalOpen, toast])

    const formFields: FormInputProps[] = [{
        name: 'allocated_days',
        label: 'Allocated Days',
        type: 'number',
        placeholder: 'Allocated Days',
        description: "Set the number of days allocated to this employees.",
        isRequired: true
    }, {
        name: 'carry_forward_days',
        label: 'Carry Forward Days',
        type: 'number',
        placeholder: 'Carry Forward Days',
        description: "Set the number of days can be carried forward to this employee for the next year."
    }]


    return (<FormDrawer isLoading={isLoading} title={"Add Leave Credit"}
                        description={"Steps to Set Up and Allocate Employee Leave Credits."}
                        footer={<div className="w-full flex justify-end gap-4">
                            <Button form="drawer-form" type="submit" isDisabled={isLoading || isLoadingDelete}
                                    isLoading={isLoading} {...uniformStyle()}>Save</Button>
                        </div>}
                        onOpen={handleModalOpen} isOpen={isModalOpen}>
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                id="drawer-form"
            >
                <FormFields items={[{
                    name: "apply_for",
                    label: "Assign to",
                    description: "Select type of employee or specify an employee.",
                    type: "select",
                    isRequired: true,
                    config: {
                        options: [{
                            value: "all", label: "All Employees"
                        }, {
                            value: "regular", label: "Regular"
                        }, {
                            value: "probationary", label: "Probationary"
                        }, {
                            value: "specific_employee", label: "Specify..."
                        }]
                    }
                }]}/>

                {form.watch("apply_for") !== "specific_employee" && form.watch("apply_for") !== undefined &&
                    <Chip startContent={<LuInfo className={icon_size_sm}/>} color="danger" variant="bordered"
                          className="word-break text-sm">Existing leave credits won&apos;t be overwritten.</Chip>}

                {form.watch("apply_for") === "specific_employee" && <EmployeeListForm
                    employees={employeeState!}
                    isLoading={data.isLoading}
                    onSelected={handleOnSelectEmployee}
                />}
                {form.watch("apply_for") === "all" &&
                    <div className="flex flex-col gap-4 border-2 border-divider/20 rounded-[5px]">
                        {/*{employeeState.map(emp => {*/}
                        {/*    return <input*/}
                        {/*        key={emp.id}*/}
                        {/*        type="hidden"*/}
                        {/*        name="employee_id"*/}
                        {/*        value={emp.id} // Ensure this stays hidden and set*/}
                        {/*    />*/}
                        {/*})}*/}
                        {leaveTypes.map((leaveType, index) => {
                            return (<div key={leaveType.id} className="space-y-2 border-b-2 last:border-none p-4">
                                <div className="flex justify-between">
                                    <Typography className="font-semibold text-medium">
                                        {leaveType.name}
                                    </Typography>
                                    <Chip>{leaveType.applicable_to_employee_types}</Chip>
                                    {/* Register leave_type_id as a hidden field */}
                                    <input
                                        type="hidden"
                                        {...form.register(`leave_credits.${index}.leave_type_id`)}
                                        value={leaveType.id} // Ensure this stays hidden and set
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <FormFields
                                        items={formFields.map((field) => ({
                                            ...field, name: `leave_credits.${index}.${field.name}`, // Use numeric index
                                        }))}
                                    />
                                </div>
                            </div>)
                        })}
                    </div>}

                {form.watch("apply_for") === "regular" &&
                    <div className="flex flex-col gap-4 border-2 border-divider/20 rounded-[5px]">
                        {/*{employeeState.filter(emp => emp.is_regular === true).map(emp => {*/}
                        {/*    return <input*/}
                        {/*        key={emp.id}*/}
                        {/*        type="hidden"*/}
                        {/*        name="employee_id"*/}
                        {/*        value={emp.id} // Ensure this stays hidden and set*/}
                        {/*    />*/}
                        {/*})}*/}
                        {leaveTypes.filter(leave_type => leave_type.applicable_to_employee_types === "all" || leave_type.applicable_to_employee_types === "regular").map((leaveType, index) => {
                            return (<div key={leaveType.id} className="space-y-2 border-b-2 last:border-none p-4">
                                <div className="flex justify-between">
                                    <Typography className="font-semibold text-medium">
                                        {leaveType.name}
                                    </Typography>
                                    <Chip>{leaveType.applicable_to_employee_types}</Chip>
                                    {/* Register leave_type_id as a hidden field */}
                                    <input
                                        type="hidden"
                                        {...form.register(`leave_credits.${index}.leave_type_id`)}
                                        value={leaveType.id} // Ensure this stays hidden and set
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <FormFields
                                        items={formFields.map((field) => ({
                                            ...field, name: `leave_credits.${index}.${field.name}`, // Use numeric index
                                        }))}
                                    />
                                </div>
                            </div>)
                        })}
                    </div>}
                {form.watch("apply_for") === "probationary" &&
                    <div className="flex flex-col gap-4 border-2 border-divider/20 rounded-[5px]">
                        {leaveTypes.filter(leave_type => leave_type.applicable_to_employee_types === "all" || leave_type.applicable_to_employee_types === "probationary").map((leaveType, index) => {
                            return (<div key={leaveType.id} className="space-y-2 border-b-2 last:border-none p-4">
                                <div className="flex justify-between">
                                    <Typography className="font-semibold text-medium">
                                        {leaveType.name}
                                    </Typography>
                                    <Chip>{leaveType.applicable_to_employee_types}</Chip>
                                    {/* Register leave_type_id as a hidden field */}
                                    <input
                                        type="hidden"
                                        {...form.register(`leave_credits.${index}.leave_type_id`)}
                                        value={leaveType.id} // Ensure this stays hidden and set
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <FormFields
                                        items={formFields.map((field) => ({
                                            ...field, name: `leave_credits.${index}.${field.name}`, // Use numeric index
                                        }))}
                                    />
                                </div>
                            </div>)
                        })}
                    </div>}

                {employeeLeaveType && form.watch("employee_id") ? (
                    <div className="flex flex-col gap-4 border-2 border-divider/20 rounded-[5px]">
                        {employeeLeaveType.map((leaveType, index) => {
                            return (<div key={leaveType.id} className="space-y-2 border-b-2 last:border-none p-4">
                                <div className="flex justify-between">
                                    <Typography className="font-semibold text-medium">
                                        {leaveType.name}
                                    </Typography>
                                    <Chip>{leaveType.applicable_to_employee_types}</Chip>
                                    {/* Register leave_type_id as a hidden field */}
                                    <input
                                        type="hidden"
                                        {...form.register(`leave_credits.${index}.leave_type_id`)}
                                        value={leaveType.id} // Ensure this stays hidden and set
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <FormFields
                                        items={formFields.map((field) => ({
                                            ...field, name: `leave_credits.${index}.${field.name}`, // Use numeric index
                                        }))}
                                    />
                                </div>
                            </div>)
                        })}
                    </div>) : null}

            </form>
        </Form>
    </FormDrawer>)

}

export default LeaveCreditForm;


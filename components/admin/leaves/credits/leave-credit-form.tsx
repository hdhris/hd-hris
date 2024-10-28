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
import {EditCreditProp} from "@/app/(admin)/(core)/leaves/leave-credits/page";
import FormDrawer from "@/components/common/forms/FormDrawer";
import {Button} from "@nextui-org/button";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";

interface LeaveCreditFormProps {
    title?: string
    description?: string
    onOpen: (value: boolean) => void
    isOpen: boolean,
    employee?: EditCreditProp
}

function LeaveCreditForm({employee, title, description, onOpen, isOpen}: LeaveCreditFormProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);
    const [employeeState, setEmployeeState] = useState<Employee[]>([]); // Initialize with employee prop if available
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Handle modal open/close state changes
    const handleModalOpen = useCallback((value: boolean) => {
        setIsModalOpen(value);
        onOpen(value);
    }, [onOpen]);

    const {toast} = useToast()
    const data = useLeaveCreditEmployees()
    const form = useForm<z.infer<typeof LeaveCreditFormSchema>>({
        resolver: zodResolver(LeaveCreditFormSchema), defaultValues: {
            employee_id: 0, allocated_days: 0, carry_forward_days: 0,
        },
    });


    useEffect(() => {
        if (isOpen !== isModalOpen) {
            setIsModalOpen(isOpen);
        }
    }, [isLoadingDelete, isModalOpen, isOpen]);

    useEffect(() => {
        if (employee) {
            setEmployeeState((prevState) => {
                // Ensure prevState is initialized properly
                const currentState = prevState || []; // Fallback to empty array

                // Check if employee is already in the state to avoid unnecessary updates
                if (currentState[0]?.id !== employee.id) {
                    return [employee]; // Update only if it's different
                }
                return currentState; // Return the previous state if it's the same
            });

        } else if (data && data.data) {
            setEmployeeState(data.data);
        }
    }, [data, employee, isOpen]);

    useEffect(() => {
        // Reset the form with employee details
        if (employee) {

            form.reset({
                employee_id: employee.id,
                allocated_days: employee.allocated_days,
                carry_forward_days: employee.carry_forward_days,
            });
        }
    }, [employee, form, isOpen]);


    const onSubmit = async (data: z.infer<typeof LeaveCreditFormSchema>) => {
        const items = {
            id: employee?.id, ...data,
        }

        try {
            setIsLoading(true)
            if (employee?.id) {
                const res = await axiosInstance.post("/api/admin/leaves/leave-credit/update", items)
                if (res.status === 200) {
                    toast({
                        title: "Success", description: "Leave credit updated successfully", variant: "success",
                    })
                    form.reset({
                        employee_id: 0, allocated_days: 0, carry_forward_days: 0,
                    })
                    setIsModalOpen(false)
                } else {
                    toast({
                        title: "Error", description: res.data.message, variant: "danger",
                    })
                }
            } else {
                const res = await axiosInstance.post("/api/admin/leaves/leave-credit/create", data)
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
                    employee_id: 0, allocated_days: 0, carry_forward_days: 0,
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
        name: 'allocated_days', label: 'Allocated Days', type: 'number', placeholder: 'Allocated Days', description: "Set the number of days allocated to this employees.", isRequired: true
    }, {
        name: 'carry_forward_days', label: 'Carry Forward Days', type: 'number', placeholder: 'Carry Forward Days', description: "Set the number of days can be carried forward to this employee for the next year.", isRequired: true
    }]

    //     <FormDrawer isLoading={false} title={title || "Add Leave Credit"}
    // description={description || "Steps to Set Up and Allocate Employee Leave Credits."}
    // onOpen={onOpen} isOpen={isOpen}>
    //     </FormDrawer>

    return (<FormDrawer isLoading={isLoading} title={title || "Add Leave Credit"}
                        description={description || "Steps to Set Up and Allocate Employee Leave Credits."}
                        footer={<div className="w-full flex justify-end gap-4">
                            {employee && <Button onClick={() => handleDelete(employee.id)}
                                                 isLoading={isLoadingDelete}
                                                 isDisabled={isLoading || isLoadingDelete} {...uniformStyle({color: "danger"})}>Delete</Button>}
                            <Button form="drawer-form" type="submit" isDisabled={isLoading || isLoadingDelete}
                                    isLoading={isLoading} {...uniformStyle()}>Save</Button>
                        </div>}
                        onOpen={handleModalOpen} isOpen={isModalOpen}>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="drawer-form">
                <EmployeeListForm employees={employeeState!} isLoading={data.isLoading}/>
                <FormFields items={formFields}/>

                {/*<div className="w-full flex justify-end">*/}
                {/*    <Button type="submit" isLoading={isLoading} {...uniformStyle()}>Save</Button>*/}
                {/*</div>*/}
            </form>
        </Form>
    </FormDrawer>)

}

export default LeaveCreditForm;
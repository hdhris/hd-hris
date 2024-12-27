'use client';

import React, { Key, useCallback, useEffect, useMemo, useState } from 'react';
import {useForm, useFormState} from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LeaveCreditFormSchema } from '@/helper/zodValidation/leaves/leave-credits-form/leave-credit-form-schema';
import { useEmploymentStatusTypes, useLeaveCreditEmployees } from '@/services/queries';
import { axiosInstance } from '@/services/fetcher';
import { useToast } from '@/components/ui/use-toast';
import { AxiosError } from 'axios';
import FormDrawer from '@/components/common/forms/FormDrawer';
import { Button } from '@nextui-org/button';
import FormFields, { FormInputProps } from '@/components/common/forms/FormFields';
import EmployeeListForm, { Employee } from '@/components/common/forms/employee-list-autocomplete/EmployeeListForm';
import Typography from '@/components/common/typography/Typography';
import { Chip } from '@nextui-org/react';
import { LuInfo } from 'react-icons/lu';
import { uniformChipStyle, uniformStyle } from '@/lib/custom/styles/SizeRadius';
import { icon_size_sm } from '@/lib/utils';
import { capitalize } from '@nextui-org/shared-utils';
import { LeaveTypeForEmployee } from '@/types/leaves/LeaveTypes';
import {Form} from "@/components/ui/form";

interface LeaveCreditFormProps {
    onOpen: (value: boolean) => void;
    isOpen: boolean;
}

function LeaveCreditForm({ onOpen, isOpen }: LeaveCreditFormProps) {
    const { data: employeeStatus } = useEmploymentStatusTypes();
    const { data, isLoading: isLoadingData } = useLeaveCreditEmployees();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDelete, setIsLoadingDelete] = useState(false);
    const [employeeState, setEmployeeState] = useState<Employee[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(isOpen);
    const [leaveTypes, setLeaveTypes] = useState<LeaveTypeForEmployee[]>([]);
    const [employeeLeaveType, setEmployeeLeaveType] = useState<LeaveTypeForEmployee[] | null>(null);

    const employmentStatus = useMemo(() => employeeStatus || [], [employeeStatus]);

    const form = useForm<z.infer<typeof LeaveCreditFormSchema>>({
        defaultValues: {
            apply_for: '',
            employee_id: 0,
            leave_credits: [],
        },
        resolver: zodResolver(LeaveCreditFormSchema),
    });

    const {isValid} = useFormState(form)
    useEffect(() => {
        setIsModalOpen(isOpen);
    }, [isOpen]);

    useEffect(() => {
        if (data) {
            setEmployeeState(data.employees);
            setLeaveTypes(data.leave_types);
            console.log("Leave Employees: ", data.employees)
        }
    }, [data]);

    const handleModalOpen = useCallback(
        (value: boolean) => {
            setIsModalOpen(value);
            onOpen(value);
        },
        [onOpen]
    );

    const handleOnSelectEmployee = (id: number) => {
        const employeeStatus = employeeState?.find(emp => emp.id === id)?.employment_status!.name;
        const applicableLeaveTypes = leaveTypes.filter(item => item.applicable_to_employee_types.some(type => type === employeeStatus))

        setEmployeeLeaveType(applicableLeaveTypes);
    };

    const handleSubmit = async (data: z.infer<typeof LeaveCreditFormSchema>) => {

        const { apply_for, employee_id, leave_credits } = data;


        // console.log("Emp: ", employeeState.find(item => item.id === employee_id)?.employment_status.id)
        const payload =
                apply_for === 'specific_employee'
                    ? { employee_id: [employee_id],
                    apply_for: employeeState?.find(item => Number(item.id) === Number(employee_id))?.employment_status!.id,
                        leave_credits }
                    : {
                        employee_id: employeeState
                            .filter(emp => emp.employment_status!.name.toLowerCase() === apply_for.toLowerCase())
                            .map(emp => emp.id),
                        apply_for: employeeState
                            .find(emp => emp.employment_status!.name.toLowerCase() === apply_for.toLowerCase())?.employment_status!.id,
                        leave_credits,
                    };

        console.log("Payload ", payload)

        if(payload.employee_id.length <= 0) {
            toast({
                title: 'Error',
                description: `No ${capitalize(apply_for)} Employee Found`,
                variant: 'danger',
            });
            return
        }


        try {
            setIsLoading(true);
            const res = await axiosInstance.post('/api/admin/leaves/leave-credit/create', payload);

            if (res.status === 200) {
                toast({
                    title: 'Success',
                    description: 'Leave credit created successfully',
                    variant: 'success',
                });
                form.reset();
            } else {
                toast({
                    title: 'Error',
                    description: res.data.message,
                    variant: 'danger',
                });
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({
                    title: 'Error',
                    description: error.response?.data.message || 'An error occurred',
                    variant: 'danger',
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = useCallback(
        async (id: Key) => {
            setIsLoadingDelete(true);
            try {
                const res = await axiosInstance.post('/api/admin/leaves/leave-credit/delete', { id });

                if (res.status === 200) {
                    toast({
                        title: 'Success',
                        description: 'Leave credit deleted successfully',
                        variant: 'success',
                    });
                    handleModalOpen(false);
                    form.reset();
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to delete leave credit',
                    variant: 'danger',
                });
            } finally {
                setIsLoadingDelete(false);
            }
        },
        [form, handleModalOpen, toast]
    );

    const formFields: FormInputProps[] = [
        {
            name: 'allocated_days',
            label: 'Allocated Days',
            type: 'number',
            placeholder: 'Allocated Days',
            description: 'Set the number of days allocated to this employee.',
            isRequired: true,
        },
        {
            name: 'carry_forward_days',
            label: 'Carry Forward Days',
            type: 'number',
            placeholder: 'Carry Forward Days',
            description: 'Set the number of days that can be carried forward to the next year.',
        },
    ];

    const renderLeaveTypes = (filteredLeaveTypes: LeaveTypeForEmployee[], key?: string) => {
        return filteredLeaveTypes.map((leaveType, index) => {
            return(
                <div key={leaveType.id} className="space-y-2 border-b-2 last:border-none p-4">
                    <div className="flex justify-between">
                        <Typography className="font-semibold text-medium">{leaveType.name}</Typography>
                        <input
                            type="hidden"
                            {...form.register(`leave_credits.${index}.leave_type_id`)}
                            value={leaveType.id}
                        />
                    </div>
                    <div className="flex gap-4">
                        <FormFields
                            items={formFields.map(field => ({
                                ...field,
                                name: `leave_credits.${index}.${String(field.name)}`,
                            }))}
                        />
                    </div>
                </div>
            )
        });
    }

    console.log("Form: ", form.watch("apply_for"))
    return (
        <FormDrawer
            isLoading={isLoading}
            title="Add Leave Credit"
            description="Steps to Set Up and Allocate Employee Leave Credits."
            footer={
                <div className="w-full flex justify-end gap-4">
                    <Button form="drawer-form" type="submit" isDisabled={!isValid || isLoading || isLoadingDelete} isLoading={isLoading} {...uniformStyle()}>
                        Save
                    </Button>
                </div>
            }
            onOpen={handleModalOpen}
            isOpen={isModalOpen}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" id="drawer-form">
                    <FormFields
                        items={[
                            {
                                name: 'apply_for',
                                label: 'Assign to',
                                description: 'Select type of employee or specify an employee.',
                                type: 'select',
                                isRequired: true,
                                config: {
                                    options: [
                                        ...employmentStatus.map(status => ({
                                            value: status.name.toLowerCase(),
                                            label: capitalize(status.name),
                                        })),
                                        { value: 'specific_employee', label: 'Specify...' },
                                    ],
                                },
                            },
                        ]}
                    />

                    {
                        form.watch('apply_for') ==='specific_employee' ? (
                            <>
                                <EmployeeListForm
                                    employees={employeeState}
                                    isLoading={isLoadingData}
                                    onSelected={handleOnSelectEmployee}
                                />
                                {employeeLeaveType && renderLeaveTypes(employeeLeaveType)}
                            </>

                            // item => item.applicable_to_employee_types.some(type => type === employeeStatus)
                        ): form.watch("apply_for") && renderLeaveTypes(leaveTypes.filter(item => item.applicable_to_employee_types.some(item => item.toLowerCase() === form.watch("apply_for").toLowerCase())), form.watch("apply_for"))
                    }
                </form>
            </Form>
        </FormDrawer>
    );
}

export default LeaveCreditForm;

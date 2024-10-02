"use client"

import React from 'react';
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import BorderCard from "@/components/common/BorderCard";
import {Form} from "@/components/ui/form";
import {LeaveTypeFormSchema} from "@/helper/zodValidation/leaves/leave-types-form/LeaveTypesForm";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";

function LeaveTypesForm() {

    const form = useForm({
        resolver: zodResolver(LeaveTypeFormSchema),
        defaultValues: {
            name: "",
            code: "",
            duration_days: 0,
            is_active: false,
            is_carry_forward: false
        }
    });

    const handleSubmit = (values: z.infer<typeof LeaveTypeFormSchema>) => {

    }

    const leaveTypeForm: FormInputProps[] = [
        {label: 'Name', name: 'name', type: 'text', isRequired: true},
        {label: "Code", name: "code", type: "text", isRequired: true},
        {label: "Duration Days", name: "duration_days", type: "number", isRequired: true},
        {label: "Is Active", name: "is_active", isRequired: true, Component: (field) => (
                <input type="checkbox" {...field} />
            )
        },
        {label: "Is Carry Forward", name: "is_carry_forward", isRequired: true, Component: (field) => (
                <input type="checkbox" {...field} />
        )},
    ]

    return (
       <BorderCard heading="Leave Types">
         <Form {...form}>
             <form onSubmit={form.handleSubmit(handleSubmit)} className=" mt-2 space-y-4">
                 <FormFields items={leaveTypeForm}/>
             </form>
         </Form>
       </BorderCard>
    );
}

export default LeaveTypesForm;
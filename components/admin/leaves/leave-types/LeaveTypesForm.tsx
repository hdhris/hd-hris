"use client"

import React from 'react';
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import BorderCard from "@/components/common/BorderCard";
import {Form} from "@/components/ui/form";
import {LeaveTypeFormSchema} from "@/helper/zodValidation/leaves/leave-types-form/LeaveTypesForm";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {cn, Switch, SwitchProps} from "@nextui-org/react";



interface Props {
    label?: string
    name?: string
}
function LeaveTypesForm({label, name, ...props}: Props & SwitchProps) {

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
        {label: 'Name', name: 'name', type: 'date', isRequired: true},
        {label: "Code", name: "code", type: "text", isRequired: true},
        {label: "Duration Days", name: "duration_days", type: "number", isRequired: true},
        {name: "is_active", isRequired: true, Component: (field) => (
                <Switch
                    {...props}
                    checked={field.value}
                    classNames={{
                        base: cn(
                            "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center",
                            "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                            "data-[selected=true]:border-primary",
                            "rounded-2xl",
                        ),
                        wrapper: "p-0 h-4 overflow-visible",
                        thumb: cn("w-6 h-6 border-2 shadow-lg",
                            "group-data-[hover=true]:border-primary",
                            //selected
                            "group-data-[selected=true]:ml-6",
                            // pressed
                            "group-data-[pressed=true]:w-7",
                            "group-data-[selected]:group-data-[pressed]:ml-4",
                        ),
                    }}
                >
                    <div className="flex flex-col gap-1">
                        <p className="text-medium">Is Active</p>
                        <p className="text-tiny text-default-400">
                            Get access to new features before they are released.
                        </p>
                    </div>
                </Switch>
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
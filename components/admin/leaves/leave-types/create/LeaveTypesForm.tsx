"use client"

import React, {useState} from 'react';
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import BorderCard from "@/components/common/BorderCard";
import {Form} from "@/components/ui/form";
import {LeaveTypeFormSchema} from "@/helper/zodValidation/leaves/leave-types-form/LeaveTypesForm";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {cn, Switch, SwitchProps} from "@nextui-org/react";
import {Button} from "@nextui-org/button";
import {Switch as SwitchCase, Case, Default} from "@/components/common/Switch";
import {useFormTable} from "@/components/providers/FormTableProvider";
import {LeaveTypesItems} from "@/types/leaves/LeaveRequestTypes";
import {axiosInstance} from "@/services/fetcher";
import {useToast} from "@/components/ui/use-toast";



interface Props {
    label?: string
    name?: string
}
function LeaveTypesForm({label, name, ...props}: Props & SwitchProps) {
    const [isAdd, setIsAdd] = useState<boolean>(true)
    const [isActive, setIsActive] = useState<boolean>(false)
    const [isCarryForward, setIsCarryForward] = useState<boolean>(false)
    const {toast} = useToast()

    const form = useForm({
        resolver: zodResolver(LeaveTypeFormSchema),
        defaultValues: {
            name: "",
            code: "",
            duration_days: "",
        }
    });

    const handleSubmit = async (values: z.infer<typeof LeaveTypeFormSchema>) => {
        const data = {
            ...values,
            isActive,
            isCarryForward
        }
        // setFormData({
        //     name: data.name,
        //     code: data.code.toUpperCase(),
        //     duration_days: Number(data.duration_days),
        //     is_active: data.isActive,
        //     is_carry_forward: data.isCarryForward
        // })

        try{
            const res = await axiosInstance.post("/api/admin/leaves/leave-types/create", data)
           if(res.status === 200){
               toast({
                   title: "Success",
                   description: "Leave type created successfully",
                   variant: "success",
                   duration: 3000
               })
           }
        } catch (err: any) {
            console.log(err)
            toast({
                title: "Error",
                description: err.message,
                variant: "danger",
                duration: 3000,
            })
        }
        setIsActive(false)
        setIsCarryForward(false)
        form.reset()
    }

    const leaveTypeForm: FormInputProps[] = [
        {label: 'Name', name: 'name', type: 'text', isRequired: true},
        {label: "Code", name: "code", type: "text", isRequired: true},
        {label: "Duration Days", name: "duration_days", type: "number", isRequired: true},
        {name: "is_active", isRequired: true, Component: (field) => (
                <Switch
                    {...props}
                    checked={isActive}
                    onValueChange={setIsActive}
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
        {name: "is_carry_forward", isRequired: true, Component: (field) => (
                <Switch
                    {...props}
                    checked={isCarryForward}
                    onValueChange={setIsCarryForward}
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
                        <p className="text-medium">Carry Forward</p>
                        <p className="text-tiny text-default-400">
                            Get access to new features before they are released.
                        </p>
                    </div>
                </Switch>
            )},
    ]

    return (
       <BorderCard heading="Leave Types">
         <Form {...form}>
             <form onSubmit={form.handleSubmit(handleSubmit)} className=" mt-2 space-y-4">
                 <FormFields items={leaveTypeForm}/>
                 <div className="w-full flex justify-end gap-2">
                     <Button variant="light" radius="sm" size="sm"
                             // onClick={handleClear}
                     >Clear</Button>
                     <SwitchCase expression={isAdd}>
                         <Case of={true}>
                             <Button color="primary" radius="sm"
                                     size="sm" type="submit">Add</Button>
                         </Case>
                         <Default>
                             <Button color="primary"
                                     // isDisabled={isDatePickerError}
                                     radius="sm" size="sm"
                                     // onClick={handleOnEdit}
                             >Update</Button>
                         </Default>
                     </SwitchCase>
                 </div>
             </form>
         </Form>
       </BorderCard>
    );
}

export default LeaveTypesForm;
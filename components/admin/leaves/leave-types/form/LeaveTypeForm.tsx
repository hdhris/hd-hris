import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {cn} from "@nextui-org/react";
import React, {FC, ReactNode, useCallback, useEffect, useState} from "react";
import Drawer from "@/components/common/Drawer";
import {Form} from "@/components/ui/form";
import {Section, Title} from "@/components/common/typography/Typography";
import {LeaveTypeSchema} from "@/helper/zodValidation/leaves/leave-types-form/LeaveTypesForm";
import {axiosInstance} from "@/services/fetcher";
import {useToast} from "@/components/ui/use-toast";
import {LeaveType} from "@/types/leaves/LeaveTypes";

interface LeaveTypeFormProps {
    title?: string
    description?: string
    data?: LeaveType
    onOpen: (value: boolean) => void
    isOpen: boolean
}
const LeaveTypeForm = ({title, description, data, onOpen, isOpen}: LeaveTypeFormProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const {toast} = useToast()

    const form = useForm<z.infer<typeof LeaveTypeSchema>>({
        resolver: zodResolver(LeaveTypeSchema), defaultValues: {
            //general information
            name: "",
            code: "",
            description: "",
            //accrual setting
            accrualRate: undefined,
            accrualFrequency: "",
            maxAccrual: undefined,
            carryOver: false,
            //Leave Duration
            minDuration: undefined,
            maxDuration: undefined,
            noticeRequired: undefined,
            //Additional Settings
            paidLeave: false,
            isActive: false,
            attachmentRequired: false,
            applicableToEmployeeTypes: "",
        }
    })

    // useEffect(() => {
    //     if(data){
    //         console.log("Form Rendered")
    //     }
    //
    //     // if(data){
    //     //     form.reset({
    //     //         name: data.name,
    //     //         code: data.code,
    //     //         description: data.description,
    //     //         //accrual setting
    //     //         accrualRate: data.accrual_rate,
    //     //         accrualFrequency: data.accrual_frequency,
    //     //         maxAccrual: data.max_accrual,
    //     //         carryOver: data.carry_over,
    //     //         //Leave Duration
    //     //         minDuration: data.min_duration,
    //     //         maxDuration: data.max_duration,
    //     //         noticeRequired: data.notice_required,
    //     //         //Additional Settings
    //     //         paidLeave: data.paid_leave,
    //     //         isActive: data.is_active,
    //     //         attachmentRequired: data.attachment_required,
    //     //     })
    //     // }
    // }, [data]);

    const onSubmit = async (data: any) => {
        setIsLoading(true)
        try {
            const rest = await axiosInstance.post("/api/admin/leaves/leave-types/create", data)
            if (rest.status === 200) {
                toast({
                    title: "Success", description: "Leave type created successfully", variant: "success",
                })
                form.reset()
            }
        } catch (err) {
            console.log(err)
            toast({
                title: "Error", description: "Something went wrong", variant: "danger",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const generalLeaveTypeForm: FormInputProps[] = [{
        name: 'name',
        label: 'Name',
        isFocus: true,
        placeholder: "e.g., Vacation, Sick Leave",
        description: "The name of the leave type.",
        isRequired: true,
    }, {
        name: 'code',
        type: "text",
        label: 'Code',
        description: "The code used to identify this leave type.",
        placeholder: "e.g., VL, SL",
        isRequired: true,
    }, {
        name: 'description',
        type: "text-area",
        label: 'Description',
        description: "Provide additional details about this leave type.",
        isRequired: true,
        placeholder: "Brief description of the leave type"

    },]
    const accrualSettingForm: FormInputProps[] = [{
        name: 'accrualRate',
        type: "number",
        label: 'Accrual Rate',
        description: "Rate at which leave is accrued.",
        placeholder: "e.g., 2",
    }, {
        name: "accrualFrequency",
        type: "select",
        label: "Accrual Frequency",
        description: "How often leave is accrued.",
        placeholder: "e.g., Monthly, Weekly, etc.",
        config: {
            options: [{
                value: "daily", label: "Daily"
            }, {
                value: "weekly", label: "Weekly"
            }, {
                value: "monthly", label: "Monthly"
            }, {
                value: "annually", label: "Annually"
            }]
        }
    }, {
        name: "maxAccrual",
        type: "number",
        label: "Maximum Accrual",
        placeholder: "e.g., 12",
        description: "Maximum amount of leave that can be accrued.",
    }, switchToggle({
        name: 'carryOver', label: 'Carry Over', description: "Does this leave can be carried over to the next year?"
    })]
    const leaveDuration: FormInputProps[] = [
        {
        name: "minDuration",
        type: "number",
        label: "Minimum Duration (hours)",
        placeholder: "e.g., 4",
        isRequired: true,
        description: "Minimum duration of leave that can be taken.",
    }, {
        name: "maxDuration",
        type: "number",
        label: "Maximum Duration (hours)",
        placeholder: "e.g., 8",
        isRequired: true,
        description: "Maximum duration of leave that can be taken.",
    },{
        name: "noticeRequired",
        type: "number",
        label: "Notice Required (days)",
        placeholder: "e.g., 7",
        isRequired: true,
        description: "Notice required before taking leave.",
    }]
    const additionalSettings: FormInputProps[] = [
        switchToggle({
        name: 'paidLeave', label: 'Paid Leave', description: " Is this a paid leave type?"
    }), switchToggle({
        name: 'isActive', label: 'Active', description: "Defines if the leave type is marked as active or inactive."
    }), {
        name: "applicableToEmployeeTypes",
        type: "select",
        label: "Applicable to Employee Types",
        placeholder: "e.g., Regular, Probationary",
        isRequired: true,
        description: "Select the employee types this leave applies to.",
        config: {
            options: [{
                value: "all", label: "All Employee Types",
            }, {
                value: "regular", label: "Regular"
            }, {
                value: "probationary", label: "Probationary"
            }]
        }
    }, switchToggle({
        name: "attachmentRequired",
        label: "Attachment Required",
        description: "  Is an attachment (e.g., medical certificate) required?"
    })]

    return (<>
        <Drawer isSubmitting={isLoading} isOpen={isOpen} onClose={onOpen} size="sm" title={<Title
            className="ms-1"
            heading={title || "Add Leave Types"}
            subHeading={description || "Define the details for the new leave type below."}
            classNames={{
                heading: "text-lg", subHeading: "font-normal"
            }}
        />}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} id="drawer-form">
                    <div className="flex flex-col gap-8 mb-4">
                        <GroupForm title='General Information' description='Provide basic details like the name, code, and description to identify and explain the leave type.'>
                            <FormFields items={generalLeaveTypeForm}/>
                        </GroupForm>
                        <GroupForm title='Accrual Settings' description='Define how leave is earned, including the rate, frequency, maximum limit, and whether it can be carried over to the next year.'>
                            <FormFields items={accrualSettingForm}/>
                        </GroupForm>
                        <GroupForm title='Leave Duration' description='Set rules for using the leave, such as the minimum/maximum hours allowed and the required notice period.'>
                            <FormFields items={leaveDuration}/>
                        </GroupForm>
                        <GroupForm title='Additional Settings'
                                   description='Configure options like whether the leave is paid, active, applicable to specific employee types, and if attachments (e.g., documents) are needed.'>
                            <FormFields items={additionalSettings}/>
                        </GroupForm>
                    </div>
                </form>
            </Form>
        </Drawer>
    </>)
}

interface GroupFormProps {
    title: string
    description: string
    children: ReactNode
    icon?: ReactNode
}

const GroupForm: FC<GroupFormProps> = ({title, description, children, icon}) => {
    return (<div>
        <Section title={title} subtitle={description} className="ms-0" classNames={{
            subHeading: "italic"
        }}>
            {icon && icon}
        </Section>
        <div className='ms-5 space-y-5 mt-5'>
            {children}
        </div>
    </div>)
}

GroupForm.displayName = "GroupForm"


interface SwitchToggle {
    name: string
    description?: string
    label: string;
}

const switchToggle = ({name, description, label}: SwitchToggle) => {
    return {
        name: name, type: "switch", label: (<div className="flex flex-col gap-1">
            <p className="text-medium">{label}</p>
            {description ? <p className="text-[0.8rem] text-muted-foreground">
                {description}
            </p> : ""}
        </div>), config: {
            classNames: {
                base: cn("inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center", "justify-between cursor-pointer rounded-lg gap-2 px-2 py-4 border-2 border-transparent", "data-[selected=true]:border-primary", "rounded"),
                wrapper: "p-0 h-4 overflow-visible",
                thumb: cn("w-6 h-6 border-2 shadow-lg", "group-data-[hover=true]:border-primary", //selected
                    "group-data-[selected=true]:ml-6", // pressed
                    "group-data-[pressed=true]:w-7", "group-data-[selected]:group-data-[pressed]:ml-4",),
            }
        }
    } as FormInputProps
}

export default LeaveTypeForm
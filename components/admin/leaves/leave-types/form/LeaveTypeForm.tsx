import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {cn} from "@nextui-org/react";
import React, {useState} from "react";
import Drawer from "@/components/common/Drawer";
import {Button} from "@nextui-org/button";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {Form} from "@/components/ui/form";
import {Title} from "@/components/common/typography/Typography";
import {LeaveTypeSchema} from "@/helper/zodValidation/leaves/leave-types-form/LeaveTypesForm";
import {axiosInstance} from "@/services/fetcher";
import {useToast} from "@/components/ui/use-toast";

const LeaveTypeForm = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const {toast} = useToast()

    const form = useForm<z.infer<typeof LeaveTypeSchema>>({
        resolver: zodResolver(LeaveTypeSchema), defaultValues: {
            name: "",
            code: "",
            description: "",
            accrualRate: 0,
            accrualFrequency: "",
            maxAccrual: 0,
            carryOver: false,
            paidLeave: false,
            affectsOvertime: false,
            requiresSignatories: false,
            isActive: false,
            minDuration: 0,
            maxDuration: 0,
            noticeRequired: 0,
            proRatedForProbationary: false,
            attachmentRequired: false,
            payRate: undefined,
            payRateFrequency: undefined,
            applicableToEmployeeTypes: ""
        }
    })

    const leave_type_fields: FormInputProps[] = [
        {
        name: 'name',
        label: 'Name',
        placeholder: "e.g., Vacation, Sick Leave",
        description: "The name of the leave type.",
        isRequired: true,
    },
        {
        name: 'code', type: "text", label: 'Code', description: "The code of the leave type.", isRequired: true,
    },
        {
        name: 'description',
        type: "text-area",
        label: 'Description',
        description: "Provide additional details about this leave type.",
        isRequired: true,
        config: {
            placeholder: "Brief description of the leave type"
        }
    },
        {
        name: 'accrualRate',
        type: "number",
        label: 'Accrual Rate',
        description: "Rate at which leave is accrued.",
        isRequired: true
    },
        {
        name: "accrualFrequency",
        type: "select",
        label: "Accrual Frequency",
        isRequired: true,
        description: "How often leave is accrued.",
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
    },
        {
        name: "maxAccrual",
        type: "number",
        label: "Maximum Accrual",
        isRequired: true,
        description: "Maximum amount of leave that can be accrued.",
    },
        switchToggle({
            name: 'carryOver', label: 'Carry Over', description: "Does this leave can be carried over to the next year?"
        }),
        switchToggle({
        name: 'paidLeave', label: 'Paid Leave', description: " Is this a paid leave type?"
    }),
        {
        isVisible: form.watch("paidLeave") as boolean,
        name: "payRate",
        type: "number",
        label: "Pay Rate",
        isRequired: true,
        description: "Rate at which leave is paid.",
        isFocus: form.watch("paidLeave")
    },
        {
        isVisible: form.watch("paidLeave"),
        name: "payRateFrequency",
        type: "select",
        label: "Pay Rate Frequency",
        isRequired: true,
        description: "How often leave is paid.",
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
    },
        switchToggle({
        name: 'affectsOvertime', label: 'Affects Overtime', description: "Does this leave type affect overtime?"
    }),
        switchToggle({
        name: 'requiresSignatories',
        label: 'Required Signatories',
        description: "Does this leave type require signatories before it can be applied?"
    }),
        switchToggle({
        name: 'isActive', label: 'Active', description: "Defines if the leave type is marked as active or inactive."
    }),
        {
        name: "minDuration",
        type: "number",
        label: "Minimum Duration (hours)",
        isRequired: true,
        description: "Minimum duration of leave that can be taken.",
    },
        {
        name: "maxDuration",
        type: "number",
        label: "Maximum Duration (hours)",
        isRequired: true,
        description: "Maximum duration of leave that can be taken.",
    },
        {
        name: "noticeRequired",
        type: "number",
        label: "Notice Required (days)",
        isRequired: true,
        description: "Notice required before taking leave.",
    },
        {
        name: "applicableToEmployeeTypes",
        type: "select",
        label: "Applicable to Employee Types",
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
    },
        switchToggle({
        name: "proRatedForProbationary",
        label: "Pro-rated for Probationary",
        description: "Is this leave type pro-rated for probationary employees?"
    }),
        switchToggle({
        name: "attachmentRequired",
        label: "Attachment Required",
        description: "  Is an attachment (e.g., medical certificate) required?"
    })]

    const onSubmit = async (data: z.infer<typeof LeaveTypeSchema>) => {
        setIsLoading(true)
        try{
            const rest = await axiosInstance.post("/api/admin/leaves/leave-types/create", data)
            if(rest.status === 200){
                toast({
                    title: "Success",
                    description: "Leave type created successfully",
                    variant: "success",
                })
                form.reset()
            }
        } catch(err){
            console.log(err)
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "danger",
            })
        } finally {
            setIsLoading(false)
        }
    }
    return (<>
        <Button {...uniformStyle()} onClick={() => setIsOpen(true)}>
            Add Leave Type
        </Button>
        <Drawer isSubmitting={isLoading} isOpen={isOpen} onClose={setIsOpen} title={<Title
            className="ms-1"
            heading="Add Leave Types"
            subHeading="Define the details for the new leave type below."
            classNames={{
                heading: "text-lg", subHeading: "font-normal"
            }}
        />}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} id="drawer-form">
                    <div className="space-y-4 mb-4">
                        <FormFields items={leave_type_fields}/>
                    </div>
                </form>
            </Form>
        </Drawer>
    </>)
}


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
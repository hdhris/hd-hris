import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {cn, Select, SelectItem} from "@nextui-org/react";
import React, {FC, ReactNode, useEffect, useMemo, useState} from "react";
import Drawer from "@/components/common/Drawer";
import {Form} from "@/components/ui/form";
import {Section, Title} from "@/components/common/typography/Typography";
import {LeaveTypeSchema} from "@/helper/zodValidation/leaves/leave-types-form/LeaveTypesForm";
import {axiosInstance} from "@/services/fetcher";
import {useToast} from "@/components/ui/use-toast";
import {LeaveType} from "@/types/leaves/LeaveTypes";
import {AxiosError} from "axios";
import {useEmploymentStatus} from "@/services/queries";
import {Logger, LogLevel} from "@/lib/logger/Logger";

interface LeaveTypeFormProps {
    title?: string
    description?: string
    onOpen: (value: boolean) => void
    isOpen: boolean,
    data?: LeaveType
}


const LeaveTypeForm = ({title, description, data, onOpen, isOpen}: LeaveTypeFormProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const {toast} = useToast()
    const {data: employment_status} = useEmploymentStatus()

    // console.log("Data Received: ", data)
    const logger = new Logger(LogLevel.DEBUG)
    const form = useForm<z.infer<typeof LeaveTypeSchema>>({
        resolver: zodResolver(LeaveTypeSchema), defaultValues: {
            //general information
            name: "", code: "", description: "", carryOver: false, //Leave Duration
            // minDuration: 0,
            maxDuration: 0, //Additional Settings
            paidLeave: false, isActive: false, attachmentRequired: false, applicableToEmployeeTypes: new Set([]),
        }
    })
    const employeeStatus = useMemo(() => {
        if (employment_status) {
            return employment_status.data
        }
        return []
    }, [employment_status])

    useEffect(() => {
        if (data) {

            // logger.debug(data)
            form.reset({
                name: data.name,
                code: data.code,
                description: data.description,
                carryOver: data.carry_over, // minDuration: data.min_duration,
                maxDuration: data.max_duration,
                paidLeave: data.paid_leave,
                isActive: data.is_active,
                attachmentRequired: data.attachment_required,
                applicableToEmployeeTypes: new Set(data.applicable_to_employee_types.map(item => String(item.id)))
            })

        }

    }, [data, form]);


    const onSubmit = async (values: z.infer<typeof LeaveTypeSchema>) => {
        setIsLoading(true)

        console.log("Data Leave Types: ", values)
        let emp_status = Array.from(values.applicableToEmployeeTypes)
        const items = {
            id: data?.id, ...values, applicableToEmployeeTypes: emp_status
        }




        try {
            let rest
            if (data?.id) {
                rest = await axiosInstance.patch("/api/admin/leaves/leave-types/update", items)
            } else {
                rest = await axiosInstance.post("/api/admin/leaves/leave-types/create", items)
            }

            if (rest.status === 200) {
                toast({
                    title: "Success", description: "Leave type created successfully", variant: "success",
                })

                onOpen(false)
                form.reset({
                    name: "", code: "", description: "", carryOver: false, //Leave Duration
                    // minDuration: 0,
                    maxDuration: 0, //Additional Settings
                    paidLeave: false, isActive: false, attachmentRequired: false, applicableToEmployeeTypes: new Set([])
                })
            }
        } catch (err) {
            console.log(err)
            if (err instanceof AxiosError) {
                toast({
                    title: "Error", description: err.response?.data.message, variant: "danger",
                })
            } else {
                toast({
                    title: "Error", description: "Something went wrong", variant: "danger",
                })
            }


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
        config: {
            autoFocus: true
        }
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
        placeholder: "Brief description of the leave type",
        config: {
            maxLength: 255, maxRows: 4,
        }

    },]

    const leaveDuration: FormInputProps[] = [//     {
        //     name: "minDuration",
        //     type: "number",
        //     label: "Minimum Duration (days)",
        //     placeholder: "e.g., 4",
        //     isRequired: true,
        //     description: "Minimum duration of leave that can be taken.",
        // },
        //
        {
            name: "maxDuration",
            type: "number",
            label: "Maximum Duration (days)",
            placeholder: "e.g., 8",
            isRequired: true,
            description: "Maximum duration of leave that can be taken.",
        }]
    const additionalSettings: FormInputProps[] = [switchToggle({
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
        Component: (field) => {
            return (<Select selectionMode="multiple"
                            aria-label="Selection"
                            color="primary"
                            variant="bordered"
                            radius="sm"
                            selectedKeys={form.getValues("applicableToEmployeeTypes").has("all")
                                ? "all"
                                : form.getValues("applicableToEmployeeTypes")}
                            onSelectionChange={(keys) => {
                                field.onChange(keys)
                            }}>
                    {Array.isArray(employeeStatus) ? (employeeStatus.map((item) => (<SelectItem key={item.id}>
                                {item.name}
                            </SelectItem>))) : (<></>)}
                </Select>)
        }
        // config: {
        //     options: [
        //         { value: "all", label: "All Employee Types" },
        //         ...(Array.isArray(employeeStatus)
        //                 ? employeeStatus.map((item) => ({
        //                     value: String(item.id),
        //                     label: item.name,
        //                 }))
        //                 : []
        //         )
        //     ],
        //     selectionMode: "multiple"
        // }
    }, switchToggle({
        name: 'carryOver', label: 'Carry Over', description: "Does this leave can be carried over to the next year?"
    }), switchToggle({
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
                        <GroupForm title='General Information'
                                   description='Provide basic details like the name, code, and description to identify and explain the leave type.'>
                            <FormFields items={generalLeaveTypeForm}/>
                        </GroupForm>
                        <GroupForm title='Leave Duration'
                                   description='Set rules for using the leave, such as the minimum/maximum hours allowed and the required notice period.'>
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
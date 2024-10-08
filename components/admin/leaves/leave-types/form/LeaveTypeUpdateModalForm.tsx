import React from 'react';
import {cn, Modal, ModalBody, ModalContent, ModalHeader} from "@nextui-org/react";
import {Form} from "@/components/ui/form";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";


interface LeaveTypeUpdateProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
}

function LeaveTypeModalForm({isOpen, onOpenChange, onClose}: LeaveTypeUpdateProps) {

    return (<Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="md" isDismissable={false}>
        <ModalContent>
            {(onClose) => (<>
                <ModalHeader className="flex flex-col gap-1">Leave Types</ModalHeader>
                <ModalBody>
                    <LeaveTypeForm/>
                </ModalBody>
            </>)}
        </ModalContent>
    </Modal>);
}

export default LeaveTypeModalForm;


const LeaveTypeSchema = z.object({
    leave_type_name: z.string().min(1, {message: "Name is required"}),
})
const LeaveTypeForm = () => {
    const form = useForm<z.infer<typeof LeaveTypeSchema>>({
        resolver: zodResolver(LeaveTypeSchema), defaultValues: {
            leave_type_name: "",
        }
    })

    const leave_type_fields: FormInputProps[] = [{
        name: 'leave_type_name', type: "auto-complete", label: 'Name', isRequired: true, config: {
            allowsCustomValue: true, options: [{
                value: "sick_leave", label: "Sick Leave"
            }]
        }
    }, {
        name: 'code', type: "text", label: 'Code', isRequired: true,
    }, {
        name: 'duration_days', type: "number", label: 'Duration (Days)', isRequired: true,
    }, switchToggle({
        name: 'is_active', label: 'Active', description: "Defines if the leave type is marked as active or inactive."
    }),switchToggle({
        name: 'is_carry_forward', label: 'Carry Forward', description: "Specifies whether unused leave days can be transferred to the next period."
    }),switchToggle({
        name: 'is_paid', label: 'Is Paid', description: "Determines if the leave type offers payment during the time off."
    }),]
    const onSubmit = (data: z.infer<typeof LeaveTypeSchema>) => {
        console.log(data)
    }
    return (<Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
                <FormFields items={leave_type_fields}/>
            </div>

        </form>
    </Form>)
}


interface SwitchToggle {
    name: string
    description?: string
    label: string
}

const switchToggle = ({name, description, label}: SwitchToggle) => {
    return {
        name: name, type: "switch", label: (<div className="flex flex-col gap-1">
            <p className="text-medium">{label}</p>
            {description ? <p className="text-tiny text-default-400">
                {description}
            </p> : ""}
        </div>),
        config: {
            classNames: {
                base: cn("inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center", "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent", "data-[selected=true]:border-primary", "rounded"),
                wrapper: "p-0 h-4 overflow-visible",
                thumb: cn("w-6 h-6 border-2 shadow-lg", "group-data-[hover=true]:border-primary", //selected
                    "group-data-[selected=true]:ml-6", // pressed
                    "group-data-[pressed=true]:w-7", "group-data-[selected]:group-data-[pressed]:ml-4",),
            }
        }
    } as FormInputProps
}
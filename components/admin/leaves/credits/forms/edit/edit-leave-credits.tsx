import React, {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import {Button, Chip, Divider, User} from "@nextui-org/react";
import Typography from "@/components/common/typography/Typography";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import FormDrawer from "@/components/common/forms/FormDrawer";
import {capitalize} from "@nextui-org/shared-utils";
import {EditCreditProp} from "@/app/(admin)/(core)/leaves/leave-credits/page";
import {z} from "zod";
import {LeaveCreditFormSchema} from "@/helper/zodValidation/leaves/leave-credits-form/leave-credit-form-schema";
import {uniformChipStyle, uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {useToast} from "@/components/ui/use-toast";
import {AxiosError} from "axios";
import {axiosInstance} from "@/services/fetcher";

interface EditLeaveCreditsProps {
    employee: EditCreditProp;
    isOpen: boolean;
    onOpen: (value: boolean) => void;
}


function EditLeaveCredits({employee, isOpen, onOpen}: EditLeaveCreditsProps) {
    console.log("Employee Edit: ", employee)
    const {toast} = useToast()

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const EditLeaveCreditSchema = LeaveCreditFormSchema.omit({
        apply_for: true, employee_id: true,
    }).superRefine((data, ctx) => {
        // Iterate over leave_credits and check if allocated_days < used_days
        data.leave_credits.forEach((item, index) => {
            const employeeLeave = employee.leave_credits?.find(emp => emp.leave_type_id === item.leave_type_id);

            if (employeeLeave) {
                // Compare allocated days with used days and create a custom error if the condition is violated
                if (item.allocated_days < employeeLeave.used_days) {
                    ctx.addIssue({
                        path: ['leave_credits', index, 'allocated_days'], // Specify the exact path of the error
                        message: `For ${employeeLeave.leave_type.name}, allocated days cannot be less than used days.`,
                        code: z.ZodIssueCode.custom,
                    });
                }
            }
        });
    });

    const form = useForm<z.infer<typeof EditLeaveCreditSchema>>({
        defaultValues: {
            leave_credits: []
        },

        resolver: zodResolver(EditLeaveCreditSchema),
    });


    useEffect(() => {
        if(employee){
            form.reset({
                leave_credits: employee.leave_credits?.map((credit) => ({
                    id: credit.id,
                    leave_type_id: credit.leave_type_id,
                    allocated_days: credit.allocated_days,
                    carry_forward_days: credit.carry_forward_days,
                }))
            })
        }
    }, [employee, form]);
    const onSubmit = async (data: z.infer<typeof EditLeaveCreditSchema>) => {
        // Store errors in an array so we can log them
        // Find only the leave credits with updated values
        const updatedValues = employee.leave_credits
            ?.filter(item => {
                const formLeave = data.leave_credits.find(lc => lc.leave_type_id === item.leave_type_id);
                if (!formLeave) return false; // If no matching leave type is found in the form, skip it

                // Check if any value has been updated
                return (
                    formLeave.allocated_days !== item.allocated_days ||
                    formLeave.carry_forward_days !== item.carry_forward_days
                );
            })
            .map(item => {
                const formLeave = data.leave_credits.find(lc => lc.leave_type_id === item.leave_type_id);

                // Return only the updated fields
                return {
                    id: item.id, // ID from employee data
                    leave_type_id: Number(item.leave_type_id), // Convert leave_type_id to a number
                    allocated_days: formLeave!.allocated_days, // Take updated allocated_days
                    carry_forward_days: formLeave!.carry_forward_days, // Take updated carry_forward_days
                    used_days: item.used_days,
                    remaining_days: item.remaining_days,
                };
            });


        setIsLoading(true)

        try{
            const res = await axiosInstance.post("/api/admin/leaves/leave-credit/update", updatedValues);
            if(res.status === 200){
                toast({
                    title: "Success",
                    description: "Leave credit updated successfully",
                    variant: "success",
                })
                onOpen(false)
            }
        } catch (error){
            console.log(error)
            if(error instanceof Error){
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "danger",
                })
            } else if(error instanceof AxiosError){
                toast({
                    title: "Error",
                    description: error.response?.data.message,
                    variant: "danger",
                })
            }
        } finally {
            setIsLoading(false)
        }
    };


    const formFields: FormInputProps[] = [{
        name: "allocated_days",
        label: "Allocated Days",
        type: "number",
        placeholder: "Allocated Days",
        description: "Set the number of days allocated to this employee.",
        isRequired: true,
    }, {
        name: "carry_forward_days",
        label: "Carry Forward Days",
        type: "number",
        placeholder: "Carry Forward Days",
        description: "Set the number of days carried forward to the next year.",
    },];

    return (<FormDrawer
        title="Edit Leave Credit"
        description="Steps to Set Up and Allocate Employee Leave Credits."
        onOpen={onOpen}
        isOpen={isOpen}
        footer={<div className="w-full flex justify-end gap-4">
            <Button
                isLoading={isLoading}
                form="drawer-form"
                type="submit"
                {...uniformStyle()}
            >
                Save
            </Button>
        </div>}
    >
        <Form {...form}>
            <form id="drawer-form" onSubmit={form.handleSubmit(onSubmit)}>
                <User
                    className="mb-4"
                    name={<div className="flex gap-2">
                        <Typography>{employee.name}</Typography>
                        <Chip {...uniformChipStyle(employee.employment_status)} variant="bordered">
                            {capitalize(employee.employment_status)}
                        </Chip>
                    </div>}
                    description={employee.department}
                    classNames={{
                        name: "text-medium font-semibold", description: "text-sm font-semibold text-default-400/80",
                    }}
                    avatarProps={{
                        src: employee.picture!,
                    }}
                />
                <Divider/>
                {employee.leave_credits?.map((leaveCredit, index) => (
                    <div key={leaveCredit.id} className="space-y-2 border-b-2 last:border-none p-4">
                        <div className="flex justify-between items-center">
                            <Typography
                                className="font-semibold text-medium">{leaveCredit.leave_type.name}</Typography>
                        </div>
                        <div className="flex gap-4">
                            <FormFields
                                items={formFields.map((field) => ({
                                    ...field, name: `leave_credits.${index}.${field.name}`,
                                }))}
                            />
                        </div>
                    </div>))}

            </form>
        </Form>
    </FormDrawer>);
}

export default EditLeaveCredits;

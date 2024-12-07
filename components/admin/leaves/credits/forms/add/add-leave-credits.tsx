"use client";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LeaveCreditFormSchema } from "@/helper/zodValidation/leaves/leave-credits-form/leave-credit-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { capitalize } from "@nextui-org/shared-utils";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import { useEmploymentStatusTypes, useLeaveCreditEmployees } from "@/services/queries";
import Typography from "@/components/common/typography/Typography";
import { Button, Chip } from "@nextui-org/react";
import { uniformChipStyle } from "@/lib/custom/styles/SizeRadius";
import {leaves} from "@/sampleData/admin/dashboard/LeaveData";

function AddLeaveCredits() {
    const { data: employee_status } = useEmploymentStatusTypes();
    const { data: leave_credit } = useLeaveCreditEmployees();

    // Initialize the form
    const form = useForm<z.infer<typeof LeaveCreditFormSchema>>({
        defaultValues: {
            apply_for: "all", // Default selection
            leave_credits: [],
        },
        resolver: zodResolver(LeaveCreditFormSchema),
    });

    // Get employment status and leave types
    const employment_status = useMemo(() => employee_status || [], [employee_status]);
    const employee_leave_credit = useMemo(() => {
        if (leave_credit) {
            const sortedLeaveTypes = [...leave_credit.leave_types].sort((a, b) =>
                a.applicable_to_employee_types.localeCompare(b.applicable_to_employee_types)
            );
            return {
                employee: leave_credit.employees,
                leave_types: sortedLeaveTypes,
            };
        }
        return { employee: [], leave_types: [] };
    }, [leave_credit]);

    // Debug: Check form state on each render
    console.log("Form State:", form.getValues());

    // Submit handler
    const onSubmit = (data: z.infer<typeof LeaveCreditFormSchema>) => {
        console.log("Form submitted with data:", data); // This should log the data upon submission
        alert("Submitted Data: " + JSON.stringify(data));
    };

    const formFields: FormInputProps[] = [
        {
            name: "allocated_days",
            label: "Allocated Days",
            type: "number",
            placeholder: "Allocated Days",
            description: "Set the number of days allocated to this employee.",
            isRequired: true,
        },
        {
            name: "carry_forward_days",
            label: "Carry Forward Days",
            type: "number",
            placeholder: "Carry Forward Days",
            description: "Set the number of days carried forward to the next year.",
        },
    ];

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
            >
                {/* Assign to Selection */}
                <FormFields
                    items={[
                        {
                            name: "apply_for",
                            label: "Assign to",
                            description: "Select the type of employee or specify an employee.",
                            type: "select",
                            isRequired: true,
                            config: {
                                options: [
                                    { value: "all", label: "All Employees" },
                                    ...employment_status.map((item) => ({
                                        value: item.name.toLowerCase(),
                                        label: capitalize(item.name),
                                    })),
                                    { value: "specific_employee", label: "Specify..." },
                                ],
                            },
                        },
                    ]}
                />

                {/* Conditional Fields */}
                {employee_leave_credit.leave_types.filter(leave_type => leave_type.applicable_to_employee_types === "all" || leave_type.applicable_to_employee_types === form.watch("apply_for")).map((leaveType, index) => {
                    console.log("Fetching ", leaveType.name, " from ", leaveType)
                    return (<div key={leaveType.id} className="space-y-2 border-b-2 last:border-none p-4">
                        <div className="flex justify-between">
                            <Typography className="font-semibold text-medium">
                                {leaveType.name}
                            </Typography>
                            <Chip>{leaveType.applicable_to_employee_types}</Chip>
                            {/* Register leave_type_id as a hidden field */}
                            <input
                                type="hidden"
                                {...form.register(`leave_credits.${index}.leave_type_id`)}
                                value={leaveType.id} // Ensure this stays hidden and set
                            />
                        </div>
                        <div className="flex gap-4">
                            <FormFields
                                items={formFields.map((field) => ({
                                    ...field, name: `leave_credits.${index}.${field.name}`, // Use numeric index
                                }))}
                            />
                        </div>
                    </div>)
                })}
                {/* Submit Button */}
                <Button type="submit">Add</Button>
            </form>
        </Form>
    );
}

export default AddLeaveCredits;

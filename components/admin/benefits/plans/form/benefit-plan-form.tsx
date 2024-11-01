import React, {useCallback, useEffect, useState} from 'react';
import {useForm} from "react-hook-form";
import {z} from "zod";
import {PlanFormSchema} from "@/helper/zodValidation/benefits/plans/plan-form-schema";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import FormDrawer from "@/components/common/forms/FormDrawer";
import {EditCreditProp} from "@/app/(admin)/(core)/leaves/leave-credits/page";
import {DrawerFormTypes} from "@/types/drawer-form/drawer-form-types";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {FileUpload} from "@/components/ui/file-upload";
import {Tab, Tabs} from "@nextui-org/react";

interface BenefitPlanFormProps extends DrawerFormTypes {
    plan?: EditCreditProp
}

function BenefitPlanForm({title, plan, onOpen, isOpen}: BenefitPlanFormProps) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [has_ref_table, setHas_ref_table] = useState(false)
    const handleModalOpen = useCallback((value: boolean) => {
        setIsModalOpen(value);
        onOpen(value);
    }, [onOpen]);

    useEffect(() => {
        if (isOpen !== isModalOpen) {
            setIsModalOpen(isOpen);
        }
    }, [isModalOpen, isOpen]);

    const form = useForm<z.infer<typeof PlanFormSchema>>({
        resolver: zodResolver(PlanFormSchema),
    })

    const onSubmit = async (values: z.infer<typeof PlanFormSchema>) => {
        console.log(values);
    }

    const plans: FormInputProps[] = [{
        name: 'name',
        label: 'Name',
        placeholder: "Health Plan",
        description: "Enter the name of the benefit plan",
        isRequired: true
    }, {
        name: 'plan_type',
        label: 'Plan Type',
        placeholder: "Select a plan type",
        description: "Select the type of benefit plan.",
        type: "auto-complete",
        isRequired: true,
        config: {
            options: [{value: "health", label: "Health"}, {value: "dental", label: "Dental"}, {
                value: "vision", label: "Vision"
            }, {value: "life", label: "Life"}, {value: "retirement", label: "Retirement"}, {
                value: "disability", label: "Disability"
            },], allowsCustomValue: true,
        }
    }, {
        name: 'description',
        label: 'Description',
        placeholder: "Provide a brief description of the benefit plan",
        type: "text-area",
        isRequired: true
    }, {
        name: 'coverage_details',
        label: 'Coverage Details',
        placeholder: "Describe the coverage provided by this plan",
        type: "text-area",
        isRequired: true
    }, {
        name: 'eligibility _criteria',
        label: 'Eligibility  criteria',
        placeholder: "e.g., Full-time employees with 1 year of service",
        description: "Enter the criteria that must be met in order to be eligible for this plan.",
        isRequired: true
    },

    ]

    const effectiveDates: FormInputProps[] = [{
        name: 'effective_date',
        label: 'Effective Date',
        placeholder: "Select an effective date",
        type: "date-picker",
        isRequired: true
    }, {
        name: 'expiration_date',
        label: 'Expiration Date',
        placeholder: "Select an expiration date",
        type: "date-picker",
        isRequired: true
    },]

    const additional_settings: FormInputProps[] = [{
        name: "is_active",
        type: "switch",
        label: "Is Active",
        description: "Enable this if you want this benefit plan to be active.",
    }, {
        name: "has_reference_table",
        type: "switch",
        label: "Have Reference Table",
        description: "Enable this if you want to have a reference table for this benefit plan.",
    }]

    const plan_rates: FormInputProps[] = [{
        name: "employer_rate",
        label: "Employer Rate",
        description: "Enter the employer rate for this plan",
        isRequired: true
    }, {
        name: "employee_rate",
        label: "Employee Rate",
        description: "Enter the employee rate for this plan",
        isRequired: true
    },]


    useEffect(() => {
        console.log("Have: ", form.watch("has_reference_table"))
        setHas_ref_table(form.watch("has_reference_table"))
    }, [form]);
    return (<FormDrawer isLoading={true} title={"Add New Benefit Plan"}
                        description={"Enter the details for the new employee benefit plan."}
        // footer={<div className="w-full flex justify-end gap-4">
        //     {employee && <Button onClick={() => handleDelete(employee.id)}
        //                          isLoading={isLoadingDelete}
        //                          isDisabled={isLoading || isLoadingDelete} {...uniformStyle({color: "danger"})}>Delete</Button>}
        //     <Button form="drawer-form" type="submit" isDisabled={isLoading || isLoadingDelete}
        //             isLoading={isLoading} {...uniformStyle()}>Save</Button>
        // </div>}
                        onOpen={handleModalOpen} isOpen={isModalOpen}>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormFields items={plans}/>
                <div className="flex gap-4">
                    <FormFields items={effectiveDates} size="md"/>
                </div>
                <FormFields items={additional_settings}/>
                {form.watch("has_reference_table") ? <ReferenceTableForm/> : <div className="flex gap-4"><FormFields items={plan_rates}/></div>}
            </form>
        </Form>
    </FormDrawer>);
}

export default BenefitPlanForm;


const ReferenceTableForm = () => {
    return (
        <Tabs>
            <Tab title="Upload CSV"><FileUpload dropzoneOptions={{
                accept: {'text/*': []}, maxSize: 1024 * 1024
            }}/></Tab>
            <Tab title="Paste a CSV"></Tab>
        </Tabs>)
}
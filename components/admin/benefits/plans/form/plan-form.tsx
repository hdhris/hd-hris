"use client"
import React, {useCallback, useEffect, useState} from 'react';
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {Form} from "@/components/ui/form";
import {useFieldArray, useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    PlanFormFixedAmountSchema, PlanFormOthersSchema, PlanFormPercentageSchema, PlanFormSchema
} from "@/helper/zodValidation/benefits/plans/plan-form-schema";
import {Autocomplete, AutocompleteItem, Button, SharedSelection} from "@nextui-org/react";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import BorderCard from "@/components/common/BorderCard";
import {DrawerFormTypes} from "@/types/drawer-form/drawer-form-types";
import {BenefitPlan} from "@/types/benefits/plans/plansTypes";
import FormDrawer from "@/components/common/forms/FormDrawer";
import {axiosInstance} from "@/services/fetcher";
import toast from "react-hot-toast";
import {capitalize} from "@nextui-org/shared-utils";

interface BenefitPlanFormProps extends DrawerFormTypes {
    plan?: BenefitPlan
}

function PlanForm({title, plan, onOpen, isOpen, ...rest}: BenefitPlanFormProps) {
    const [contributionType, setContributionType] = useState<"fixed" | "percentage" | "others">("fixed")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const handleModalOpen = useCallback((value: boolean) => {
        setIsModalOpen(value);
        onOpen(value);
    }, [onOpen]);

    useEffect(() => {
        if (isOpen !== isModalOpen) {
            setIsModalOpen(isOpen);
        }
    }, [isModalOpen, isOpen]);

    const plan_conditional_schema = contributionType === "fixed" ? PlanFormSchema.merge(PlanFormFixedAmountSchema)
        .refine((data) => data.max_salary > data.min_salary, {
            message: "Maximum salary must be greater than to Minimum salary", path: ["max_salary"],
        }).refine(data => new Date(data.effective_date) < new Date(data.expiration_date), {
            message: "Effective date must be less than to Expiration date", path: ["expiration_date"]
        }) : contributionType === "percentage" ? PlanFormSchema.merge(PlanFormPercentageSchema)
        .refine((data) => data.max_salary > data.min_salary, {
            message: "Maximum salary must be greater than  to Minimum salary", path: ["max_salary"],
        }).refine(data => new Date(data.effective_date) < new Date(data.expiration_date), {
            message: "Effective date must be less than  to Expiration date", path: ["expiration_date"]
        }) : PlanFormSchema.omit({
        min_salary: true, max_salary: true
    }).merge(PlanFormOthersSchema).refine(data => new Date(data.effective_date) < new Date(data.expiration_date), {
        message: "Effective date must be less than to Expiration date", path: ["expiration_date"]
    })
    const form = useForm<z.infer<typeof plan_conditional_schema>>({
        mode: "onChange", resolver: zodResolver(plan_conditional_schema), defaultValues: {
            name: "",
            plan_type: "",
            coverage_details: "",
            description: "",
            effective_date: "",
            expiration_date: "",
            is_active: true,
            contribution_type: "fixed",
            fixed_amount: 0,
            percentage_amount: 0,
            min_salary: 0,
            max_salary: 0,
            tiers: [{
                employer_contribution: 0,
                employee_contribution: 0,
                min_salary: 0,
                max_salary: 0,
                minMSC: 0,
                maxMSC: 0,
                mscStep: 0,
                ecThreshold: 0,
                ecLowRate: 0,
                ecHighRate: 0,
                wispThreshold: 0,
            }],
        },

    });

    useEffect(() => {
        if (title && plan) {
            const benefitDetails = plan.benefitAdditionalDetails || [];

            const contributionType =
                benefitDetails.map(item => item.contributionType)[0] as "fixed" | "percentage" | "others" || "others";

            const actualContributionAmount = benefitDetails.map(item => item.actualContributionAmount)[0] || 0;
            const minSalary = benefitDetails.map(item => item.minSalary)[0] || 0;
            const maxSalary = benefitDetails.map(item => item.maxSalary)[0] || 0;

            const tiers = contributionType === "others"
                ? benefitDetails.map(item => ({
                    employer_contribution: item.employerContribution || 0,
                    employee_contribution: item.employeeContribution || 0,
                    min_salary: item.minSalary || 0,
                    max_salary: item.maxSalary || 0,
                    minMSC: item.minMSC || 0,
                    maxMSC: item.maxMSC || 0,
                    mscStep: item.mscStep || 0,
                    ecThreshold: item.ecThreshold || 0,
                    ecLowRate: item.ecLowRate || 0,
                    ecHighRate: item.ecHighRate || 0,
                    wispThreshold: item.wispThreshold || 0,
                }))
                : null;

            console.log("Reset: ", plan)
            form.setValue("plan_type", plan.type.toLowerCase())
            form.reset({
                name: plan.name || "",
                plan_type: plan.type.toLowerCase() || "",
                coverage_details: plan.coverageDetails || "",
                description: plan.description || "",
                effective_date: plan.effectiveDate,
                expiration_date: plan.expirationDate,
                is_active: plan.isActive,
                contribution_type: contributionType,
                fixed_amount: contributionType === "fixed" ? actualContributionAmount : 0,
                percentage_amount: contributionType === "percentage" ? actualContributionAmount : 0,
                min_salary: contributionType !== "others" ? minSalary : 0,
                max_salary: contributionType !== "others" ? maxSalary : 0,
                tiers: tiers || [],
            });
        }
    }, [title, plan, form]);



    const {fields, append, remove} = useFieldArray({
        control: form.control, name: "tiers", // Matches the `tiers` array in the schema
    });


    const basicInfoFields: FormInputProps[] = [{
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
        Component: (field) => {
            const options = [{value: "health", label: "Health"}, {value: "dental", label: "Dental"}, {
                value: "vision", label: "Vision"
            }, {value: "life", label: "Life"}, {value: "retirement", label: "Retirement"}, {
                value: "disability", label: "Disability"
            }]

            console.log("Forms ", form.getValues())
            return (<Autocomplete
                inputValue={capitalize(form.getValues("plan_type"))}
                selectedKey={form.getValues("plan_type")}
                aria-labelledby="Plan Type"
                className="max-w-full"
                defaultItems={options}
                variant="bordered"
                color="primary"
                radius="sm"
                onSelectionChange={(value) => {
                    field.onChange(value);
                    form.setValue("plan_type", String(value));
                }}
                onInputChange={(value) => {
                    field.onChange(value);
                    form.setValue("plan_type", String(value));
                }}
                allowsCustomValue
                menuTrigger="input"
            >
                {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
            </Autocomplete>)
        }
    }];

    const plan_details: FormInputProps[] = [{
        name: 'description',
        label: 'Description',
        placeholder: "Provide a brief description of the benefit plan",
        type: "text-area",
        config: {
            maxLength: 150, maxRows: 3
        },
        isRequired: true

    }, {
        name: 'coverage_details',
        label: 'Coverage Details',
        placeholder: "Describe the coverage provided by this plan",
        type: "text-area",
        isRequired: true,
        config: {
            maxRows: 3,

        }
    }]

    const effectiveDateFields: FormInputProps[] = [{
        name: 'effective_date',
        label: 'Effective Date',
        placeholder: "Select an effective date",
        type: "date-picker",
        isRequired: true,
        config: {
            showMonthAndYearPickers: true
        }
    }, {
        name: 'expiration_date',
        label: 'Expiration Date',
        placeholder: "Select an expiration date",
        type: "date-picker",
        isRequired: true,
        config: {
            showMonthAndYearPickers: true
        }
    }];

    const additionalSettingsFields: FormInputProps[] = [{
        name: "is_active", type: "switch", label: "Is Active", description: "Is this plan currently active?",
    }, {
        name: "contribution_type",
        type: "select",
        label: "Contribution Type",
        description: "Select the contribution type for this plan.",
        isRequired: true,
        config: {
            options: [{value: "fixed", label: "Fixed"}, {value: "percentage", label: "Percentage"}, {
                value: "others", label: "Others"
            }], disallowEmptySelection: true, onSelectionChange: (value: SharedSelection) => {
                setContributionType(value.currentKey as "fixed" | "percentage" | "others")
            }
        }
    }];

    const salaryFields: FormInputProps[] = [{
        name: 'min_salary',
        label: 'Minimum Salary',
        type: "number",
        description: "Enter the minimum salary",
        isRequired: true
    }, {
        name: 'max_salary',
        label: 'Maximum Salary',
        type: "number",
        description: "Enter the maximum salary",
        isRequired: true
    },]

    const planRatesFields: FormInputProps[] = [{
        name: "employer_contribution",
        label: "Employer Rate (%)",
        type: "number",
        description: "Enter the employer rate for this plan",
        isRequired: true
    }, {
        name: "employee_contribution",
        label: "Employee Rate (%)",
        type: "number",
        description: "Enter the employee rate for this plan",
        isRequired: true
    }, {
        name: 'minMSC', label: 'Minimum MSC', type: "number", description: "Enter the minimum MSC",
    }, {
        name: 'maxMSC', label: 'Maximum MSC', type: "number", description: "Enter the maximum MSC"
    }, {
        name: 'mscStep', label: 'MSC Step', type: "number", description: "Enter the step value for MSC",
    }, {
        name: 'ecThreshold', label: 'EC Threshold', type: "number", description: "Enter the EC threshold",
    }, {
        name: 'ecLowRate', label: 'Minimum EC', type: "number", description: "Enter the low EC rate",
    }, {
        name: 'ecHighRate', label: 'Maximum EC', type: "number", description: "Enter the high EC rate",
    }, {
        name: 'wispThreshold', label: 'WISP Threshold', type: "number", description: "Enter the WISP threshold",
    }];

    const fixPlansFields: FormInputProps[] = [{
        name: "fixed_amount",
        label: "Amount (₱)",
        type: "number",
        description: "Enter the employee amount for this plan",
    }];
    const percentagePlansFields: FormInputProps[] = [{
        name: "percentage_amount",
        label: "Percentage (%)",
        type: "number",
        description: "Enter the employee rate for this plan",
    }];

    const onSubmit = async (values: z.infer<typeof plan_conditional_schema>) => {
        setIsLoading(true)
        try {
            const res = axiosInstance.post("/api/admin/benefits/plans/create", values)
            await toast.promise(res, {
                loading: "Saving...",
                success: `Plan ${plan ? "updated" : "created"} successfully`,
                error: `Error ${plan ? "updating" : "creating"} plan`,
            })
        } catch (error) {
            toast.error(`Error ${plan ? "updating" : "creating"} plan`)
        } finally {
            setIsLoading(false)
        }
        console.log("Data Submitted: ", values)
    }
    return (<FormDrawer
            isLoading={isLoading}
            title={title || "Add New Benefit Plan"}
            size="md"
            description={rest.description || "Enter the details for the new employee benefit plan."}
            onOpen={handleModalOpen}
            isOpen={isModalOpen}
        >

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="drawer-form">
                    <div className="flex gap-4">
                        <FormFields items={basicInfoFields} size="md"/>
                    </div>
                    <div className="flex gap-4">
                        <FormFields items={plan_details} size="md"/>
                    </div>
                    <div className="flex gap-4">
                        <FormFields items={effectiveDateFields} size="md"/>
                    </div>
                    <div className="flex gap-4 items-end">
                        <FormFields items={additionalSettingsFields}/>
                    </div>
                    {form.watch("contribution_type") === "fixed" && <div className="flex gap-4">
                        <FormFields items={[...salaryFields, ...fixPlansFields]}/>
                    </div>}

                    {form.watch("contribution_type") === "percentage" && <div className="flex gap-4">
                        <FormFields items={[...salaryFields, ...percentagePlansFields]}/>
                    </div>}
                    {form.watch("contribution_type") === "others" && <>
                        {fields.map((field, index) => {
                            return (<BorderCard key={index} heading={<div className="flex justify-end">
                                {fields.length > 1 && <Button {...uniformStyle({color: "danger"})} type="button"
                                                              onPress={() => remove(index)}>Remove
                                    Tier</Button>}
                            </div>}>
                                <div key={field.id} className="grid grid-cols-2 gap-4">
                                    <FormFields
                                        items={[...salaryFields, ...planRatesFields].map((rateField) => ({
                                            ...rateField, name: `tiers.${index}.${rateField.name}`, // Matches keys in the schema (e.g., minSalary, maxMSC)
                                        }))}
                                    />
                                </div>
                            </BorderCard>);
                        })}

                        <Button
                            {...uniformStyle()}
                            type="button"
                            onPress={() => append({
                                employer_contribution: 0,
                                employee_contribution: 0,
                                max_salary: 0,
                                min_salary: 0,
                                minMSC: 0,
                                maxMSC: 0,
                                mscStep: 0,
                                ecThreshold: 0,
                                ecLowRate: 0,
                                ecHighRate: 0,
                                wispThreshold: 0
                            })}
                        >
                            Add Tier

                        </Button>
                    </>}
                    {/*{form.watch("contribution_type") !== "others" ? <div className="grid grid-cols-3 gap-4">*/}
                    {/*    <FormFields items={bracketFields}/>*/}
                    {/*</div> : }*/}

                </form>
            </Form>
        </FormDrawer>

    );
}

export default PlanForm;
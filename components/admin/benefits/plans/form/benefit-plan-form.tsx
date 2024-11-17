'use client'
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useForm} from "react-hook-form";
import {z} from "zod";
import {PlanFormSchema} from "@/helper/zodValidation/benefits/plans/plan-form-schema";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import FormDrawer from "@/components/common/forms/FormDrawer";
import {DrawerFormTypes} from "@/types/drawer-form/drawer-form-types";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {useToast} from "@/components/ui/use-toast";
import {BenefitPlan} from "@/types/benefits/plans/plansTypes";

interface BenefitPlanFormProps extends DrawerFormTypes {
    plan?: BenefitPlan
}

function BenefitPlanForm({title, plan, onOpen, isOpen, ...rest}: BenefitPlanFormProps) {
    const {toast} = useToast()
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isAdvanceSetting, setIsAdvanceSetting] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const handleModalOpen = useCallback((value: boolean) => {
        setIsModalOpen(value);
        onOpen(value);
    }, [onOpen]);

    const planDetails = useMemo(() => {
        if (title && plan) {
            return {
                name: plan.name || "",
                plan_type: plan.type || "",
                description: plan.description || "",
                coverage_details: plan.coverageDetails || "",
                effective_date: plan.effectiveDate || "",
                expiration_date: plan.expirationDate || "",
                is_active: plan.isActive ?? false, // Assuming a boolean
                employer_contribution: plan.employerContribution ?? 0,
                employee_contribution: plan.employeeContribution ?? 0,
                advance_setting: !!plan.benefitAdditionalDetails,
                minSalary: plan.benefitAdditionalDetails?.minSalary ?? 0,
                maxSalary: plan.benefitAdditionalDetails?.maxSalary ?? 0,
                minMSC: plan.benefitAdditionalDetails?.minMSC ?? 0,
                maxMSC: plan.benefitAdditionalDetails?.maxMSC ?? 0,
                mscStep: plan.benefitAdditionalDetails?.mscStep ?? 0,
                ecThreshold: plan.benefitAdditionalDetails?.ecThreshold ?? 0,
                ecLowRate: plan.benefitAdditionalDetails?.ecLowRate ?? 0,
                ecHighRate: plan.benefitAdditionalDetails?.ecHighRate ?? 0,
                wispThreshold: plan.benefitAdditionalDetails?.wispThreshold ?? 0
            }
        }
    }, [title, plan])
    const PlanFormValidation = isAdvanceSetting ? PlanFormSchema.extend({
        minSalary: z.number({
            required_error: "Minimum salary is required", invalid_type_error: "Minimum salary must be a number"
        }),
        maxSalary: z.number({
            required_error: "Maximum salary is required", invalid_type_error: "Maximum salary must be a number"
        }),
        minMSC: z.number({
            required_error: "Minimum MSC is required", invalid_type_error: "Minimum MSC must be a number"
        }),
        maxMSC: z.number({
            required_error: "Maximum MSC is required", invalid_type_error: "Maximum MSC must be a number"
        }),
        mscStep: z.number({required_error: "MSC step is required", invalid_type_error: "MSC step must be a number"}),
        ecThreshold: z.number({
            required_error: "EC threshold is required", invalid_type_error: "EC threshold must be a number"
        }),
        ecLowRate: z.number({
            required_error: "EC low rate is required", invalid_type_error: "EC low rate must be a number"
        }),
        ecHighRate: z.number({
            required_error: "EC high rate is required", invalid_type_error: "EC high rate must be a number"
        }),
        wispThreshold: z.number({
            required_error: "WISP threshold is required", invalid_type_error: "WISP threshold must be a number"
        }),
    }).refine(data => data.maxMSC >= data.mscStep, {
        message: "Maximum MSC must be greater than or equal to MSC step", path: ["maxMSC"]
    })
        .refine(data => data.maxSalary >= data.minSalary, {
            message: "Maximum salary must be greater than or equal to Minimum salary", path: ["maxSalary"]
        }) : PlanFormSchema


    const form = useForm<z.infer<typeof PlanFormValidation>>({
        resolver: zodResolver(PlanFormValidation), defaultValues: {
        }
    })

    useEffect(() => {
        if (isOpen !== isModalOpen) {
            setIsModalOpen(isOpen);
        }
    }, [isModalOpen, isOpen]);

    useEffect(() => {
        if (title && plan) {
            form.reset({
                name: plan.name || "",
                plan_type: plan.type || "",
                description: plan.description || "",
                coverage_details: plan.coverageDetails || "",
                effective_date: plan.effectiveDate || "",
                expiration_date: plan.expirationDate || "",
                is_active: plan.isActive ?? false, // Assuming a boolean
                employer_contribution: plan.employerContribution ?? 0,
                employee_contribution: plan.employeeContribution ?? 0,
                advance_setting: !!plan.benefitAdditionalDetails,
                minSalary: plan.benefitAdditionalDetails?.minSalary ?? 0,
                maxSalary: plan.benefitAdditionalDetails?.maxSalary ?? 0,
                minMSC: plan.benefitAdditionalDetails?.minMSC ?? 0,
                maxMSC: plan.benefitAdditionalDetails?.maxMSC ?? 0,
                mscStep: plan.benefitAdditionalDetails?.mscStep ?? 0,
                ecThreshold: plan.benefitAdditionalDetails?.ecThreshold ?? 0,
                ecLowRate: plan.benefitAdditionalDetails?.ecLowRate ?? 0,
                ecHighRate: plan.benefitAdditionalDetails?.ecHighRate ?? 0,
                wispThreshold: plan.benefitAdditionalDetails?.wispThreshold ?? 0
            });
        }
    }, [title, plan, form]);


    const onSubmit = async (values: z.infer<typeof PlanFormValidation>) => {
        // console.log("Plan: ", plan)
        const data = plan && {
            // // benefitAdditionalDetails: {
            // //     id: plan.benefitAdditionalDetails?.id || undefined,
            // //     values.advance_setting ? ...values.
            // // },
            // deduction_id: plan.deduction_id,
            // id: plan.id,
            //
            ...values
        }

        console.log("Values: ", values)
        console.log("Data: ", data)
        // setIsLoading(true)
        // try {
        //
        //     let res
        //     if (plan) {
        //         res = await axiosInstance.post("/api/admin/benefits/plans/update", data)
        //     } else {
        //         res = await axiosInstance.post("/api/admin/benefits/plans/create", values)
        //     }
        //     if (res.status === 200) {
        //         toast({
        //             title: "Success",
        //             description: `Plan ${plan ? "updating" : "creating"} successfully`,
        //             variant: "success"
        //         })
        //     }
        // } catch (error) {
        //     toast({
        //         title: "Error", description: `Error ${plan ? "updating" : "creating"} plan`, variant: "danger"
        //     })
        // } finally {
        //     setIsLoading(false)
        // }
    }

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
        config: {
            options: [{value: "health", label: "Health"}, {value: "dental", label: "Dental"}, {
                value: "vision", label: "Vision"
            }, {value: "life", label: "Life"}, {value: "retirement", label: "Retirement"}, {
                value: "disability", label: "Disability"
            }], allowsCustomValue: true, menuTrigger: "input", maxLength: 10
        }
    }, {
        name: 'description',
        label: 'Description',
        placeholder: "Provide a brief description of the benefit plan",
        type: "text-area",
        config: {
            maxLength: 150
        },
        isRequired: true

    }, {
        name: 'coverage_details',
        label: 'Coverage Details',
        placeholder: "Describe the coverage provided by this plan",
        type: "text-area",
        isRequired: true,
    }
        // , {
        //     name: 'eligibility_criteria',
        //     label: 'Eligibility Criteria',
        //     placeholder: "e.g., Full-time employees with 1 year of service",
        //     description: "Enter the criteria that must be met to be eligible for this plan.",
        //     isRequired: true
        // }
    ];

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
        name: "is_active",
        type: "switch",
        label: "Is Active",
        description: "Enable this if you want this benefit plan to be active."
    }];

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
    }];


    const advancedSettingsFields: FormInputProps[] = [{
        name: 'minSalary',
        label: 'Minimum Salary',
        type: "number",
        description: "Enter the minimum salary",
        isRequired: true
    }, {
        name: 'maxSalary',
        label: 'Maximum Salary',
        type: "number",
        description: "Enter the maximum salary",
        isRequired: true
    }, {
        name: 'minMSC', label: 'Minimum MSC', type: "number", description: "Enter the minimum MSC", isRequired: true
    }, {
        name: 'maxMSC', label: 'Maximum MSC', type: "number", description: "Enter the maximum MSC", isRequired: true
    }, {
        name: 'mscStep',
        label: 'MSC Step',
        type: "number",
        description: "Enter the step value for MSC",
        isRequired: true
    }, {
        name: 'ecThreshold',
        label: 'EC Threshold',
        type: "number",
        description: "Enter the EC threshold",
        isRequired: true
    }, {
        name: 'ecLowRate', label: 'EC Low Rate', type: "number", description: "Enter the low EC rate", isRequired: true
    }, {
        name: 'ecHighRate',
        label: 'EC High Rate',
        type: "number",
        description: "Enter the high EC rate",
        isRequired: true
    }, {
        name: 'wispThreshold',
        label: 'WISP Threshold',
        type: "number",
        description: "Enter the WISP threshold",
        isRequired: true
    }];

    return (<FormDrawer isLoading={isLoading} title={title || "Add New Benefit Plan"}
                        description={rest.description || "Enter the details for the new employee benefit plan."}
                        onOpen={handleModalOpen} isOpen={isModalOpen}>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="drawer-form">
                <FormFields items={basicInfoFields}/>
                <div className="flex gap-4">
                    <FormFields items={effectiveDateFields} size="md"/>
                </div>
                <FormFields items={additionalSettingsFields}/>
                <div className="flex gap-4">
                    <FormFields items={planRatesFields}/>
                </div>
                <FormFields items={[{
                    name: "advance_setting",
                    type: "switch",
                    label: "Advance Settings",
                    description: "Toggle this if you want to enable advanced settings.",
                    config: {
                        onValueChange: (value: boolean) => {
                            setIsAdvanceSetting(value)
                        }
                    }
                }]}/>
                {form.watch("advance_setting") && (<div className="space-y-4">
                    <FormFields items={advancedSettingsFields}/>
                </div>)}

            </form>
        </Form>
    </FormDrawer>);
}

export default BenefitPlanForm;

//
// const standardHeaders = [
//     "Minimum Compensation",
//     "Maximum Compensation",
//     "Regular Employee Compensation",
//     "WISP",
//     "Regular Employer Contribution",
//     "Regular Employee Contribution",
//     "EC Contribution",
//     "WISP Employer Contribution",
//     "WISP Employee Contribution"
// ]
//
// const ReferenceTableForm = () => {
//     const [files, setFiles] = useState<FileState[]>([])
//     const [headers, setHeaders] = useState<string[]>([])
//     const {readString} = usePapaParse();
//     const [mapping, setMapping] = useState<Record<string, string>>({})
//     const [isComplete, setIsComplete] = useState(false)
//
//
//     const handleMapping = (standardHeader: string, uploadedHeader: string) => {
//         setMapping(prev => ({
//             ...prev,
//             [standardHeader]: uploadedHeader
//         }))
//     }
//
//     const checkMapping = () => {
//         const isMappingComplete = standardHeaders.every(header => mapping[header])
//         setIsComplete(isMappingComplete)
//     }
//
//     function updateFileProgress(key: string, progress: FileState['progress']) {
//         setFiles((fileStates) => {
//             const newFileStates = structuredClone(fileStates);
//             const fileState = newFileStates.find((fileState) => fileState.key === key,);
//             console.log("File State: ", fileState)
//             if (fileState) {
//                 fileState.progress = progress;
//             }
//             return newFileStates;
//         });
//     }
//
//     return (
//         <Tabs>
//             <Tab title="Upload CSV">
//                 <FileDropzone
//                     value={files}
//                     onChange={(files) => {
//                         console.log("On Change: ", files)
//                         setFiles(files);
//                     }}
//                     dropzoneOptions={{
//                         accept: {"text/csv": [".csv"]}, maxFiles: 1
//                     }}
//                     onFilesAdded={async (addedFiles) => {
//                         setFiles([...files, ...addedFiles]);
//                         addedFiles.map(async (addedFileState) => {
//                             updateFileProgress(addedFileState.key, 'PENDING');
//                         })
//
//                         const reader = new FileReader();
//
//                         reader.onloadend = ({target}) => {
//                             readString(target?.result as string, {
//                                 worker: true, header: true, skipEmptyLines: true, complete: (results) => {
//                                     setHeaders(results.meta?.fields!)
//                                     console.log('---------------------------');
//                                     console.log(results);
//                                     console.log('---------------------------');
//                                 },
//                             })
//
//                         };
//                         //
//                         reader.readAsText(addedFiles.find(item => item.file)?.file!);
//
//                     }}/>
//
//                 {headers.length > 0 && (
//                     standardHeaders.map((standardHeader) => (
//                         <div key={standardHeader} className="flex items-center justify-between space-y-4">
//                             <Typography className="text-sm">{standardHeader}</Typography>
//                             <Select
//                                 aria-label="selection"
//                                 variant="bordered"
//                                 labelPlacement="outside"
//                                 className="max-w-52 self-center"
//                             >
//                                 {headers.map((header, index) => (
//                                     <SelectItem key={index} value={header}>
//                                         {header}
//                                     </SelectItem>
//                                 ))}
//                             </Select>
//                         </div>
//                     ))
//                 )}
//
//                 {/*<DataTable config={}/>*/}
//
//             </Tab>
//             <Tab title="Paste a CSV"></Tab>
//             <Tab title={
//                 <div className="flex gap-2 items-center">
//                     <LuDownload/>
//                     <Typography className="!text-inherit">Download Template</Typography>
//                 </div>
//             } href="/templates/CONTRIBUTION TABLE TEMPLATE.csv"></Tab>
//         </Tabs>)
// }



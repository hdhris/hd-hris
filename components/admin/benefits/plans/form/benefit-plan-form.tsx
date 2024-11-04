'use client'
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
import {LeaveTypeSchema} from "@/helper/zodValidation/leaves/leave-types-form/LeaveTypesForm";

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
        resolver: zodResolver(PlanFormSchema), defaultValues: {        }
    })


    const onSubmit = async (values: any) => {
        console.log(values);
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
                value: "vision",
                label: "Vision"
            }, {value: "life", label: "Life"}, {value: "retirement", label: "Retirement"}, {
                value: "disability",
                label: "Disability"
            }],
            allowsCustomValue: true,
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
        name: 'eligibility_criteria',
        label: 'Eligibility Criteria',
        placeholder: "e.g., Full-time employees with 1 year of service",
        description: "Enter the criteria that must be met to be eligible for this plan.",
        isRequired: true
    }];

    const effectiveDateFields: FormInputProps[] = [{
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
    }];

    const additionalSettingsFields: FormInputProps[] = [{
        name: "is_active",
        type: "switch",
        label: "Is Active",
        description: "Enable this if you want this benefit plan to be active."
    }];

    const planRatesFields: FormInputProps[] = [{
        name: "employer_rate",
        label: "Employer Rate",
        description: "Enter the employer rate for this plan",
        isRequired: true
    }, {
        name: "employee_rate",
        label: "Employee Rate",
        description: "Enter the employee rate for this plan",
        isRequired: true
    }];

    // const advancedSettingsFields: FormInputProps[] = [{
    //     name: 'minSalary', label: 'Minimum Salary', description: "Enter the minimum salary", isRequired: true
    // }, {
    //     name: 'maxSalary', label: 'Maximum Salary', description: "Enter the maximum salary", isRequired: true
    // }, {
    //     name: 'minMSC', label: 'Minimum MSC', description: "Enter the minimum MSC", isRequired: true
    // }, {
    //     name: 'maxMSC', label: 'Maximum MSC', description: "Enter the maximum MSC", isRequired: true
    // }, {
    //     name: 'mscStep', label: 'MSC Step', description: "Enter the step value for MSC", isRequired: true
    // }, {
    //     name: 'ecThreshold', label: 'EC Threshold', description: "Enter the EC threshold", isRequired: true
    // }, {
    //     name: 'ecLowRate', label: 'EC Low Rate', description: "Enter the low EC rate", isRequired: true
    // }, {
    //     name: 'ecHighRate', label: 'EC High Rate', description: "Enter the high EC rate", isRequired: true
    // }, {
    //     name: 'wispThreshold', label: 'WISP Threshold', description: "Enter the WISP threshold", isRequired: true
    // }];

    return (<FormDrawer isSubmitting={true} isLoading={false} title="Add New Benefit Plan"
                        description="Enter the details for the new employee benefit plan."
                        onOpen={handleModalOpen} isOpen={isModalOpen}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="drawer-form">
                    <FormFields items={basicInfoFields}/>
                    <div className="flex gap-4">
                        <FormFields items={effectiveDateFields} size="md"/>
                    </div>
                    <FormFields items={additionalSettingsFields}/>
                    <div className="flex gap-4">
                        <FormFields items={planRatesFields} />
                    </div>
                    {/*<FormFields items={[{*/}
                    {/*    name: "advance_setting",*/}
                    {/*    type: "switch",*/}
                    {/*    label: "Advance Settings",*/}
                    {/*    description: "Toggle this if you want to enable advanced settings."*/}
                    {/*}]}/>*/}
                    {/*{form.watch("advance_setting") && (<div className="space-y-4">*/}
                    {/*        <FormFields items={advancedSettingsFields}/>*/}
                    {/*    </div>)}*/}

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



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
import {Select, SelectItem, Tab, Tabs} from "@nextui-org/react";
import {FileDropzone, FileState} from "@/components/ui/fileupload/file";
import {usePapaParse} from 'react-papaparse';
import {LuDownload} from "react-icons/lu";
import Typography from "@/components/common/typography/Typography";

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
                        size="md"
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
                {form.watch("has_reference_table") ? <ReferenceTableForm/> :
                    <div className="flex gap-4"><FormFields items={plan_rates}/></div>}
            </form>
        </Form>
    </FormDrawer>);
}

export default BenefitPlanForm;


const standardHeaders = [
    "Minimum Compensation",
    "Maximum Compensation",
    "Regular Employee Compensation",
    "WISP",
    "Regular Employer Contribution",
    "Regular Employee Contribution",
    "EC Contribution",
    "WISP Employer Contribution",
    "WISP Employee Contribution"
]

const ReferenceTableForm = () => {
    const [files, setFiles] = useState<FileState[]>([])
    const [headers, setHeaders] = useState<string[]>([])
    const {readString} = usePapaParse();
    const [mapping, setMapping] = useState<Record<string, string>>({})
    const [isComplete, setIsComplete] = useState(false)


    const handleMapping = (standardHeader: string, uploadedHeader: string) => {
        setMapping(prev => ({
            ...prev,
            [standardHeader]: uploadedHeader
        }))
    }

    const checkMapping = () => {
        const isMappingComplete = standardHeaders.every(header => mapping[header])
        setIsComplete(isMappingComplete)
    }

    function updateFileProgress(key: string, progress: FileState['progress']) {
        setFiles((fileStates) => {
            const newFileStates = structuredClone(fileStates);
            const fileState = newFileStates.find((fileState) => fileState.key === key,);
            console.log("File State: ", fileState)
            if (fileState) {
                fileState.progress = progress;
            }
            return newFileStates;
        });
    }

    return (
        <Tabs>
            <Tab title="Upload CSV">
                <FileDropzone
                    value={files}
                    onChange={(files) => {
                        console.log("On Change: ", files)
                        setFiles(files);
                    }}
                    dropzoneOptions={{
                        accept: {"text/csv": [".csv"]}, maxFiles: 1
                    }}
                    onFilesAdded={async (addedFiles) => {
                        setFiles([...files, ...addedFiles]);
                        addedFiles.map(async (addedFileState) => {
                            updateFileProgress(addedFileState.key, 'PENDING');
                        })

                        const reader = new FileReader();

                        reader.onloadend = ({target}) => {
                            readString(target?.result as string, {
                                worker: true, header: true, skipEmptyLines: true, complete: (results) => {
                                    setHeaders(results.meta?.fields!)
                                    console.log('---------------------------');
                                    console.log(results);
                                    console.log('---------------------------');
                                },
                            })

                        };
                        //
                        reader.readAsText(addedFiles.find(item => item.file)?.file!);

                    }}/>

                {headers.length > 0 ? headers.length === standardHeaders.length ? (
                    standardHeaders.map((standardHeader) => (
                        <div key={standardHeader} className="flex items-center justify-between space-y-4">
                            <Typography className="text-sm">{standardHeader}</Typography>
                            <Select
                                variant="bordered"
                                labelPlacement="outside"
                                className="max-w-52 self-center"
                            >
                                {headers.map((header) => (
                                    <SelectItem key={header} value={header}>
                                        {header}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    ))
                ) : (
                    <p>Error</p>
                ): (
                    <></>
                )}

                {/*{standardHeaders.map(standardHeader => (*/}
                {/*    <div key={standardHeader} className="flex items-center justify-between space-y-4">*/}
                {/*        <Typography className="text-sm">{standardHeader}</Typography>*/}
                {/*        <Select*/}
                {/*            variant="bordered"*/}
                {/*            labelPlacement="outside"*/}
                {/*            className="max-w-52 self-center"*/}
                {/*        >*/}
                {/*            {headers.map((header) => (*/}
                {/*                <SelectItem key={header} value={header}>*/}
                {/*                    {header}*/}
                {/*                </SelectItem>*/}
                {/*            ))}*/}
                {/*        </Select>*/}

                {/*    </div>*/}
                {/*))}*/}

                {/*{headers.map(item => {*/}
                {/*    return(*/}
                {/*        <p key={item}>{item}</p>*/}
                {/*    )*/}
                {/*})}*/}

            </Tab>
            <Tab title="Paste a CSV"></Tab>
            <Tab title={
                <div className="flex gap-2 items-center">
                    <LuDownload/>
                    <Typography className="!text-inherit">Download Template</Typography>
                </div>
            } href="/templates/CONTRIBUTION TABLE TEMPLATE.csv"></Tab>
        </Tabs>)
}



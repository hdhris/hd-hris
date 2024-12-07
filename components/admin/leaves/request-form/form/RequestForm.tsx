"use client"
import React, {useCallback, useEffect, useState} from 'react';
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import EmployeeListForm from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";
import LeaveTypeSelection from "@/components/admin/leaves/request-form/LeaveTypeSelection";
import Typography from "@/components/common/typography/Typography";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {Form} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {LeaveRequestFormValidation} from "@/helper/zodValidation/leaves/request-form/LeaveRequestFormValidation";
import {zodResolver} from "@hookform/resolvers/zod";
import {getLocalTimeZone, today} from "@internationalized/date";
import {useEmployeesLeaveStatus} from "@/services/queries";
import {EmployeeLeavesStatus} from "@/types/leaves/LeaveRequestTypes";
import {EditCreditProp} from "@/app/(admin)/(core)/leaves/leave-credits/page";
import FormDrawer from '@/components/common/forms/FormDrawer';
import {axiosInstance} from "@/services/fetcher";
import {AxiosError} from "axios";
import {useToast} from "@/components/ui/use-toast";
import {useHolidays} from "@/helper/holidays/unavailableDates";
import {FileDropzone, FileState} from "@/components/ui/fileupload/file";
import {useEdgeStore} from "@/lib/edgestore/edgestore";
import {UploadTypes} from "@/types/upload/upload-types";


interface LeaveRequestFormProps {
    title?: string
    description?: string
    onOpen: (value: boolean) => void
    isOpen: boolean,
    employee?: EditCreditProp
}

function RequestForm({title, description, onOpen, isOpen, employee}: LeaveRequestFormProps) {
    const {data, isLoading} = useEmployeesLeaveStatus()
    const [user, setUser] = useState<EmployeeLeavesStatus | null>(null)
    const [employeeIdSelected, setEmployeeIdSelected] = useState<number>(0)
    const [minLeave, setMinLeave] = useState<number>(0)
    const [maxLeave, setMaxLeave] = useState<number>(0)
    const {isDateUnavailable} = useHolidays()
    const [isAttachmentRequired, setIsAttachmentRequired] = useState<boolean>(false)
    const [documentAttachments, setDocumentAttachments] = useState<FileState[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [url, setUrl] = useState<UploadTypes | null>(null)
    const {toast} = useToast()
    const { edgestore } = useEdgeStore();
    // Handle modal open/close state changes
    const handleModalOpen = useCallback((value: boolean) => {
        setIsModalOpen(value);
        onOpen(value);
    }, [onOpen]);

    const form = useForm<z.infer<typeof LeaveRequestFormValidation>>({
        resolver: zodResolver(LeaveRequestFormValidation), defaultValues: {
            employee_id: 0, reason: "", leave_type_id: 0, // Ensure the leave_type_id has a default value,
            days_of_leave: "", leave_date: "", comment: ""
        }
    });
    useEffect(() => {
        if (isOpen !== isModalOpen) {
            setIsModalOpen(isOpen);
        }
    }, [isModalOpen, isOpen]);


    useEffect(() => {
        if (data) {
            setUser(() => ({
                availableLeaves: data.availableLeaves,  // Retain previous data
                employees: data.employees.sort((a, b) => a.name.localeCompare(b.name)),
            }));
        }

    }, [data]);

    const minMax = React.useMemo(() => {
        const remainingLeaves = user?.employees.find(emp => emp.id === employeeIdSelected)?.leave_balances.find(leave => leave.leave_type_id === Number(form.watch("leave_type_id")))?.remaining_days || 0

        if (remainingLeaves > maxLeave) {
            return Array.from({length: maxLeave - minLeave + 1}).map((_, i) => ({
                label: String(`${minLeave + i} ${minLeave + i === 1 ? "Day" : "Days"}`),
                value: String(`${minLeave + i} ${minLeave + i === 1 ? "Day" : "Days"}`)
            }))
        } else {
            return Array.from({length: remainingLeaves - minLeave + 1}).map((_, i) => ({
                label: String(`${minLeave + i} ${minLeave + i === 1 ? "Day" : "Days"}`),
                value: String(`${minLeave + i} ${minLeave + i === 1 ? "Day" : "Days"}`)
            }))
        }
        // return Array.from({length: maxLeave - minLeave + 1}).map((_, i) => ({
        //     label: String(`${minLeave + i} ${minLeave + i === 1 ? "Day" : "Days"}`), value: String(minLeave + i)
        // }));
    }, [employeeIdSelected, form, maxLeave, minLeave, user?.employees])

    const LeaveRequestForm: FormInputProps[] = [{
        isRequired: true,
        name: "days_of_leave",
        type: "select",
        label: "Days of Leave",
        inputDisabled: !form.watch("leave_type_id") || minMax.length === 0,
        config: {
            options: minMax, isClearable: true, isDisabled: !form.watch("leave_type_id") || minMax.length === 0
        }

    }, {
        inputDisabled: !form.watch("leave_type_id") || minMax.length === 0 || !form.watch("days_of_leave"),
        isRequired: true,
        name: "leave_date",
        type: "date-picker",
        label: "Start Date",
        config: {
            granularity: "minute",
            hideTimeZone: true,
            minValue: today(getLocalTimeZone()),
            isDateUnavailable: isDateUnavailable
        }

    }, {
        name: "reason", label: "Reason for Leave", type: "text-area", isRequired: true, // Component: (field) => {
    },
    //     {
    //     name: "comment", label: "Comment", type: "text-area", // Component: (field) => {
    // }
    ]

    const employee_leave_type = React.useMemo(() => {
        const employee = user?.employees.find(item => item.id === employeeIdSelected);

        if (!employee) {
            return []; // Return an empty array if the employee is not found
        }

        // console.log("User: ", user)
        // console.log("Employee: ", employee)
        return user?.availableLeaves.filter(leaveType => employee.leave_balances.some(balance => balance.leave_type_id === leaveType.id))
    }, [user, employeeIdSelected])

    function updateFileProgress(key: string, progress: FileState['progress']) {
        setDocumentAttachments((fileStates) => {
            const newFileStates = structuredClone(fileStates);
            const fileState = newFileStates.find(
                (fileState) => fileState.key === key,
            );
            if (fileState) {
                fileState.progress = progress;
            }
            return newFileStates;
        });
    }

    async function onSubmit(values: z.infer<typeof LeaveRequestFormValidation>) {
        try {
            // Ensure validation for document attachments if required
            // if (employee_leave_type?.some((lt) => lt.is_attachment_required) && !documentAttachments) {
            //     toast({
            //         title: "Error",
            //         description: "Please upload a document for this leave type.",
            //         variant: "danger",
            //     });
            //     return; // Stop execution if validation fails
            // }

            // Prepare the payload

            const items = {
                id: employee?.id, ...values,
                leave_type_id: values.leave_type_id,
                days_of_leave: values.days_of_leave.split(" ")[0],
                leave_date: values.leave_date,
                comment: values.comment,
                reason: values.reason,
                url: url,
            }

            // Set loading state
            setIsSubmitting(true);

            // Decide between creating or updating the leave request
            const endpoint = employee?.id
                ? "/api/admin/leaves/requests/update"
                : "/api/admin/leaves/requests/create";

            const res = await axiosInstance.post(endpoint, items);

            if (res.status === 200) {
                toast({
                    title: "Success",
                    description: `Leave credit ${
                        employee?.id ? "updated" : "created"
                    } successfully.`,
                    variant: "success",
                });

                // Reset the form and close the modal if necessary
                form.reset({
                    employee_id: 0,
                    reason: "",
                    leave_type_id: 0, // Ensure the leave_type_id has a default value
                    days_of_leave: "",
                    leave_date: "",
                    comment: "",
                });

                setDocumentAttachments([])

                if (employee?.id) {
                    setIsModalOpen(false);
                }
            } else {
                toast({
                    title: "Error",
                    description: res.data.message || "An error occurred while processing the request.",
                    variant: "danger",
                });
            }
        } catch (e) {
            console.error("Error:", e);

            if (e instanceof AxiosError) {
                toast({
                    title: "Error",
                    description: e.response?.data?.message || "An unexpected error occurred.",
                    variant: "danger",
                });
            } else {
                toast({
                    title: "Error",
                    description: "An unexpected error occurred. Please try again.",
                    variant: "danger",
                });
            }
        } finally {
            setIsSubmitting(false); // Ensure the loading state is cleared
        }
    }




    return (<FormDrawer title={title || "File A leave Request"}
                        description={description || "Fill out the form to request a leave."}
                        onOpen={handleModalOpen} isOpen={isModalOpen} isLoading={isSubmitting}>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="drawer-form">
                <ScrollShadow>
                    <div className="space-y-4">
                        <div className="flex flex-col space-y-4">
                            <EmployeeListForm employees={user?.employees!} isLoading={isLoading}
                                              onSelected={setEmployeeIdSelected}/>
                            <LeaveTypeSelection min={setMinLeave} max={setMaxLeave}
                                                isAttachmentRequired={setIsAttachmentRequired}
                                                leaveTypes={employee_leave_type!} isLoading={isLoading}
                                                isDisabled={!form.watch("employee_id")}/>
                            {form.watch("leave_type_id") && minMax.length === 0 ?
                                <Typography className="!text-danger text-sm">Cannot apply this leave to this employee. Low leave credit balance</Typography> : ""}
                        </div>
                        <FormFields items={LeaveRequestForm}/>
                        {/*{isAttachmentRequired && <div className="flex flex-col gap-2">*/}
                        {/*    <div className="flex">*/}
                        {/*        <Typography className="text-sm font-medium mt-2">Upload Documents</Typography>*/}
                        {/*        <span className="ml-2 inline-flex text-destructive text-medium"> *</span>*/}
                        {/*    </div>*/}
                        {/*    <FileDropzone*/}
                        {/*        onChange={(files) => {*/}
                        {/*            setDocumentAttachments(files)*/}
                        {/*        }}*/}
                        {/*        dropzoneOptions={{*/}
                        {/*            accept: {*/}
                        {/*                'application/pdf': ['.pdf'],*/}
                        {/*                'application/msword': ['.doc'],*/}
                        {/*                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],*/}
                        {/*            },*/}
                        {/*        }}*/}
                        {/*        value={documentAttachments}*/}
                        {/*        onFilesAdded={async (addedFiles) => {*/}
                        {/*            setDocumentAttachments([...documentAttachments, ...addedFiles]);*/}
                        {/*            await Promise.all(*/}
                        {/*                addedFiles.map(async (addedFileState) => {*/}
                        {/*                    try {*/}
                        {/*                        const res = await edgestore.publicFiles.upload({*/}
                        {/*                            file: addedFileState.file,*/}
                        {/*                            onProgressChange: async (progress) => {*/}
                        {/*                                updateFileProgress(addedFileState.key, progress);*/}
                        {/*                                if (progress === 100) {*/}
                        {/*                                    // wait 1 second to set it to complete*/}
                        {/*                                    // so that the user can see the progress bar at 100%*/}
                        {/*                                    await new Promise((resolve) => setTimeout(resolve, 1000));*/}
                        {/*                                    updateFileProgress(addedFileState.key, 'COMPLETE');*/}
                        {/*                                }*/}
                        {/*                            },*/}
                        {/*                        });*/}
                        {/*                        setUrl(res)*/}
                        {/*                    } catch (err) {*/}
                        {/*                        updateFileProgress(addedFileState.key, 'ERROR');*/}
                        {/*                    }*/}
                        {/*                }),*/}
                        {/*            );*/}
                        {/*        }}*/}
                        {/*    />*/}
                        {/*</div>}*/}
                        {/*<div className="w-full flex justify-end gap-2">*/}
                        {/*    <Button variant="light" radius="sm" size="sm" onClick={handleClear}>Clear</Button>*/}
                        {/*    <Switch expression={isAdd}>*/}
                        {/*        <Case of={true}>*/}
                        {/*            <Button color="primary"*/}
                        {/*                // isDisabled={!isDirty || !isValid || isDatePickerError}*/}
                        {/*                    radius="sm" size="sm" type="submit">Add</Button>*/}
                        {/*        </Case>*/}
                        {/*        <Default>*/}
                        {/*            <Button color="primary" isDisabled={isDatePickerError} radius="sm" size="sm"*/}
                        {/*                    onClick={handleOnEdit}>Update</Button>*/}
                        {/*        </Default>*/}
                        {/*    </Switch>*/}

                        {/*</div>*/}


                    </div>
                </ScrollShadow>
            </form>
        </Form>
    </FormDrawer>);
}

export default RequestForm;
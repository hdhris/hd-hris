import Drawer from "@/components/common/Drawer";
import EmployeeListForm from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";
import FormFields from "@/components/common/forms/FormFields";
import { BorderedCard, EmployeeHeader } from "@/components/common/minor-items/components";
import QuickFileUpload from "@/components/common/QuickFileUpload";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { MajorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { useEmployeeId } from "@/hooks/employeeIdHook";
import { getEmpFullName, getFullAddress } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { useQuery } from "@/services/queries";
import { ActionsTakenArray } from "@/types/incident-reports/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseAbsolute, parseAbsoluteToLocal } from "@internationalized/date";
import axios from "axios";
import React, { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaStreetView } from "react-icons/fa";
import { mutate } from "swr";
import { z } from "zod";

const formSchema = z.object({
    employee_id: z.number().min(1, "Select an employee"),
    occurance_date: z.string(),
    severity: z.enum(["minor", "major", "critical"]),
    actions_taken: z.enum([...ActionsTakenArray, ""]),
    type: z.string().min(1, "Enter the type of the incident"),
    location: z.string().min(1, "Enter the site where the incident occured"),
    description: z.string().min(1, "Describe the incident"),
    files: z.array(z.string()).min(1, "Attachment is required"),
}).refine(
    data => data.actions_taken != "", { path: ["actions_taken"], message: "Action is required" }
)

interface FileReportProp {
    isOpen: boolean;
    onClose: () => void;
}
function FileReport({ isOpen, onClose }: FileReportProp) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data, isLoading } = useQuery<MajorEmployee[]>("/api/admin/utils/get-employee-search");
    const userID = useEmployeeId();

    const employees = useMemo(() => {
        if (data) {
            return data.map((emp) => ({
                id: emp.id,
                name: getEmpFullName(emp),
                picture: emp.picture,
                department: emp.ref_departments?.name,
            }));
        }

        return [];
    }, [data]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
            location: "",
            occurance_date: toGMT8().toISOString(),
            severity: "minor",
            actions_taken: "Send Warning",
            type: "",
            employee_id: undefined,
            files: [],
        },
    });

    const { watch, setValue } = form;

    const employee = useMemo(() => {
        if (data) {
            return data.find((employee) => employee.id === watch("employee_id"));
        }
    }, [data, watch("employee_id")]);

    const formReset = useCallback(() => {
        if (form) {
            form.reset({
                description: "",
                location: "",
                occurance_date: toGMT8().toISOString(),
                severity: "minor",
                actions_taken: "Send Warning",
                type: "",
                employee_id: undefined,
                files: [],
            });
        }
    }, [form, userID]);

    const onSubmit = useCallback(async (value: z.infer<typeof formSchema>)=> {
        setIsSubmitting(true);
        try {
            await axios.post("/api/admin/incident/create", {
                ...value,
                reported_by: userID
            });
            toast({
                title: "Incident reported successfully!",
                variant: "success",
            });
            onClose();
            formReset();
            mutate("/api/admin/incident/reports");
        } catch (error) {
            toast({
                title: "An error has occured",
                description: String(error),
                variant: "danger",
            });
        }
        setIsSubmitting(false);
    },[userID, watch])

    return (
        <Drawer
            isOpen={isOpen}
            onClose={() => {
                onClose();
                formReset();
            }}
            title="Report Incident"
            isSubmitting={isSubmitting}
            unSubmittable={!form.watch("employee_id")}
        >
            <Form {...form}>
                <form className="space-y-4" id="drawer-form" onSubmit={form.handleSubmit(onSubmit)}>
                    {employee ? (
                        <>
                            <EmployeeHeader employee={employee} onClose={formReset} />
                            <BorderedCard
                                icon={<div />}
                                title={employee.ref_branches.name}
                                description={getFullAddress(employee.ref_branches)}
                            />
                        </>
                    ) : (
                        <EmployeeListForm isLoading={isLoading} employees={employees} />
                    )}
                    <FormFields<z.infer<typeof formSchema>>
                        items={[
                            {
                                name: "type",
                                type: "auto-complete",
                                label: "Type",
                                placeholder: "e.g: Equipment Failure, Harrassment, or specify...",
                                isRequired: true,
                                inputDisabled: !watch("employee_id"),
                                config: {
                                    allowsCustomValue: true,
                                    options: [
                                        "Complaint Incident",
                                        "Equipment Failure",
                                        "Property Damage",
                                        "Service Failure",
                                        "Theft",
                                        "Unauthorized Access",
                                        "Vandalism",
                                        "Cybersecurity Incident",
                                        "Traffic Accident",
                                        "Discrimination",
                                        "Harassment",
                                        "Workplace Violence",
                                        "Injury",
                                        "Illness",
                                    ]
                                        .sort((a, b) => a.localeCompare(b))
                                        .map((item) => ({
                                            label: item,
                                            value: item,
                                        })),
                                },
                            },
                            {
                                name: "occurance_date",
                                type: "date-picker",
                                label: "Occurance Date",
                                isRequired: true,
                                inputDisabled: !watch("employee_id"),
                                config: {
                                    maxValue: parseAbsoluteToLocal(toGMT8().toISOString()),
                                },
                            },
                            {
                                name: "location",
                                label: "Scene of the Incident",
                                type: "auto-complete",
                                isRequired: true,
                                placeholder: "e.g: On-site, Off-site or specify...",
                                inputDisabled: !watch("employee_id"),
                                config: {
                                    allowsCustomValue: true,
                                    options: ["On-site", "Off-site"]
                                        .sort((a, b) => a.localeCompare(b))
                                        .map((item) => ({
                                            label: item,
                                            value: item,
                                        })),
                                },
                            },
                            {
                                name: "description",
                                type: "text-area",
                                label: "Description",
                                inputDisabled: !watch("employee_id"),
                            },
                            {
                                name: "severity",
                                label: "Severity",
                                type: "radio-group",
                                isRequired: true,
                                inputDisabled: !watch("employee_id"),
                                config: {
                                    options: [
                                        {
                                            label: "Minor",
                                            value: "minor",
                                        },
                                        {
                                            label: "Major",
                                            value: "major",
                                        },
                                        {
                                            label: "Critical",
                                            value: "critical",
                                        },
                                    ],
                                    orientation: "horizontal",
                                    onValueChange: ()=> setValue('actions_taken', ""),
                                },
                            },
                            {
                                name: "actions_taken",
                                label: "Action to Take",
                                type: "radio-group",
                                isRequired: true,
                                inputDisabled: !watch("employee_id"),
                                config: {
                                    orientation: "vertical",
                                    options: (watch("severity") === "minor"
                                        ? ["Send Warning"]
                                        : watch("severity") === "major"
                                        ? ["Payroll Deduction"]
                                        : ["Suspension", "Termination"]
                                    )
                                        .sort((a, b) => a.localeCompare(b))
                                        .map((item) => ({
                                            label: item,
                                            value: item,
                                        })),
                                },
                            },
                        ]}
                    />
                    <QuickFileUpload/>
                </form>
            </Form>
        </Drawer>
    );
}

export default FileReport;

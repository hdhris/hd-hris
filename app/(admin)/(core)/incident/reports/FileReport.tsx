import Drawer from "@/components/common/Drawer";
import EmployeeListForm from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";
import FormFields from "@/components/common/forms/FormFields";
import { BorderedCard, EmployeeHeader } from "@/components/common/minor-items/components";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { MajorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { useEmployeeId } from "@/hooks/employeeIdHook";
import { getEmpFullName, getFullAddress } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { useQuery } from "@/services/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import React, { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaStreetView } from "react-icons/fa";
import { z } from "zod";

const formSchema = z.object({
    employee_id: z.number().optional(),
    occurance_date: z.string(),
    severity: z.enum(["minor", "major", "critical"]),
    type: z.string().min(1, "Enter the type of the incident"),
    location: z.string().min(1, "Enter the location where the incident occured"),
    description: z.string().optional(),
    comments: z.string().optional(),
    reported_by: z.number(),
});

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
        defaultValues: {},
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
                comments: "",
                description: "",
                location: "",
                occurance_date: toGMT8().toISOString(),
                severity: "minor",
                type: "",
                employee_id: undefined,
                reported_by: userID,
            });
        }
    }, [form, userID]);

    async function onsubmit(value: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            await axios.post("/api/admin/incident/create", value);
            toast({
                title: "Incident reported successfully!",
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "An error has occured",
                description: String(error),
                variant: "danger",
            });
        }
        setIsSubmitting(false);
    }

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
                <form className="space-y-4" id="drawer-form" onSubmit={form.handleSubmit(onsubmit)}>
                    {employee ? (
                        <EmployeeHeader employee={employee} onClose={formReset} />
                    ) : (
                        <EmployeeListForm isLoading={isLoading} employees={employees} />
                    )}
                    <FormFields
                        items={[
                            {
                                name: "",
                                Component: () => {
                                    return employee ? (
                                        <BorderedCard
                                            icon={<div />}
                                            title={employee.ref_branches.name}
                                            description={getFullAddress(employee.ref_branches)}
                                        />
                                    ) : (
                                        <div />
                                    );
                                },
                            },
                            {
                                name: "occurance_date",
                                type: "date-picker",
                                label: "Occurance Date",
                                isRequired: true,
                                inputDisabled: !watch("employee_id"),
                            },
                            {
                                name: "location",
                                label: "Location",
                                isRequired: true,
                                placeholder: "e.g: On-site, Off-site",
                                inputDisabled: !watch("employee_id"),
                            },
                            {
                                name: "type",
                                type: "auto-complete",
                                label: "Type",
                                placeholder: "e.g: Equipment Failure, Harrassment, Safety",
                                isRequired: true,
                                inputDisabled: !watch("employee_id"),
                                config: {
                                    options: [
                                        "Customer Injury",
                                        "Complaint Incident",
                                        "Equipment Failure",
                                        "Service Failure",
                                        "Theft",
                                        "Unauthorized Access",
                                        "Vandalism",
                                        "Cybersecurity Incident",
                                        "Traffic Accident",
                                        "Discrimination",
                                        "Whistleblower",
                                        "Harassment",
                                        "Workplace Violence",
                                        "Injury",
                                        "Illness",
                                    ]
                                    .sort((a,b) => a.localeCompare(b))
                                    .map((item) => ({
                                        label: item,
                                        value: item,
                                    })),
                                },
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
                                },
                            },
                            {
                                name: "description",
                                type: "text-area",
                                label: "Description",
                                inputDisabled: !watch("employee_id"),
                            },
                            {
                                name: "actions_taken",
                                label: "Action to Take",
                                type: "radio-group",
                                isRequired: true,
                                inputDisabled: !watch("employee_id"),
                                config: {
                                    orientation: "vertical",
                                    options: [
                                        "Suspension",
                                        "Probation",
                                        "Verbal Warning",
                                        "Written Warning",
                                        "Demotion",
                                        "Termination",
                                        "Relocation",
                                        "Re-Education",
                                        "Revocation of Privilege",
                                    ]
                                    .sort((a,b) => a.localeCompare(b))
                                    .map((item) => ({
                                        label: item,
                                        value: item,
                                    })),
                                },
                            },
                        ]}
                    />
                </form>
            </Form>
        </Drawer>
    );
}

export default FileReport;

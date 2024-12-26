import UserMail from "@/components/common/avatar/user-info-mail";
import Drawer from "@/components/common/Drawer";
import EmployeeListForm from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";
import FormFields from "@/components/common/forms/FormFields";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { MajorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { useEmployeeId } from "@/hooks/employeeIdHook";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { useQuery } from "@/services/queries";
import { IncidentReport } from "@/types/incident-reports/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, Tooltip } from "@nextui-org/react";
import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface IncidentDrawerProps {
    selected: IncidentReport | null;
    isOpen: boolean;
    onClose: (val: boolean) => void;
    // isSubmitting: boolean;
}
function IncidentDrawer({
    selected,
    isOpen,
    onClose,
}: // isSubmitting,
IncidentDrawerProps) {
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

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {},
        values: selected || undefined,
    });

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

    useEffect(() => {
        if (!selected && userID) {
          formReset();
        }
    }, [selected, formReset, userID]);

    async function onsubmit(value: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            await axios.post("/api/admin/incident/create", value);
            toast({
                title: "Incident filed successfully!",
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
            onClose={()=>{ onClose(false); formReset(); }}
            title={selected ? "Incident Report" : "File Incident"}
            isSubmitting={isSubmitting}
            unSubmittable={!form.watch('employee_id')}
            footer={selected && <div/>}
        >
            <Form {...form}>
                <form className="space-y-2" id="drawer-form" onSubmit={form.handleSubmit(onsubmit)}>
                    {!selected ? (
                        <EmployeeListForm isLoading={isLoading} employees={employees} />
                    ) : (
                        <UserMail
                            name={getEmpFullName(
                                selected.trans_employees_dim_incident_reports_employee_idTotrans_employees
                            )}
                            picture={
                                selected.trans_employees_dim_incident_reports_employee_idTotrans_employees.picture || ""
                            }
                        />
                    )}
                    <FormFields
                        items={[
                            {
                                name: "occurance_date",
                                type: "date-input",
                                label: "Occurance Date",
                                isRequired: true,
                                inputDisabled: !!selected,
                            },
                            {
                                name: "location",
                                label: "Location",
                                isRequired: true,
                                placeholder: "e.g: On-site, Off-site",
                                inputDisabled: !!selected,

                            },
                            {
                                name: "type",
                                label: "Type",
                                placeholder: "e.g: Equipment Failure, Harrassment, Safety",
                                isRequired: true,
                                inputDisabled: !!selected,

                            },
                            {
                                name: "severity",
                                label: "Severity",
                                type: "radio-group",
                                isRequired: true,
                                inputDisabled: !!selected,
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
                                inputDisabled: !!selected,
                            },
                            {
                                name: "comments",
                                type: "text-area",
                                label: "Comments",
                                inputDisabled: !!selected,
                            },
                            ...(selected
                                ? [
                                      {
                                          name: "approver",
                                          label: "Reporter",
                                          Component: () => (
                                              <Tooltip
                                                  className="pointer-events-auto"
                                                  content={getEmpFullName(
                                                      selected.trans_employees_dim_incident_reports_reported_byTotrans_employees
                                                  )}
                                              >
                                                  <Avatar
                                                      isBordered
                                                      radius="full"
                                                      size="sm"
                                                      src={
                                                          selected
                                                              ?.trans_employees_dim_incident_reports_reported_byTotrans_employees
                                                              ?.picture ?? ""
                                                      }
                                                  />
                                              </Tooltip>
                                          ),
                                      },
                                  ]
                                : []),
                        ]}
                    />
                </form>
            </Form>
        </Drawer>
    );
}

export default IncidentDrawer;

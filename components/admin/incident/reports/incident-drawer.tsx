import UserMail from "@/components/common/avatar/user-info-mail";
import Drawer from "@/components/common/Drawer";
import EmployeeListForm from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";
import FormFields from "@/components/common/forms/FormFields";
import { Form } from "@/components/ui/form";
import Search from "@/components/util/search";
import { UserEmployee } from "@/helper/include-emp-and-reviewr/include";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { useQuery } from "@/services/queries";
import { IncidentReport } from "@/types/incident-reports/type";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface IncidentDrawerProps {
  selected: IncidentReport | null;
  isOpen: boolean;
  onClose: (val: boolean) => void;
  isSubmitting: boolean;
}
function IncidentDrawer({
  selected,
  isOpen,
  onClose,
  isSubmitting,
}: IncidentDrawerProps) {
  const { data, isLoading } = useQuery<UserEmployee[]>(
    "/api/admin/utils/get-employee-search",
    { refreshInterval: 5000 }
  );
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
    employee_id: z.number(),
    occurance_date: z.date(),
    severity: z.enum(["minor", "major", "critical"]),
    type: z.string(),
    location: z.string(),
    description: z.string().optional(),
    comments: z.string().optional(),
    reported_by: z.number(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (selected) {
      form.reset({
        comments: selected?.comments,
        description: selected?.description,
        location: selected?.location,
        occurance_date: toGMT8(selected?.occurance_date).toDate(),
        severity: selected?.severity,
        type: selected?.type,
        employee_id: selected?.employee_id,
      });
    } else {
      form.reset({
        comments: "",
        description: "",
        location: "",
        occurance_date: toGMT8().toDate(),
        severity: "minor",
        type: "",
        employee_id: -1,
      });
    }
  }, [selected, form]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={selected ? "Incident Report" : "File Incident"}
      isSubmitting={isSubmitting}
    >
      <Form {...form}>
        <form className="space-y-2" id="drawer-form">
          {!selected ? (
            <EmployeeListForm isLoading={isLoading} employees={employees} />
          ) : (
            <UserMail
              name={getEmpFullName(data?.find((emp) => emp.id === selected.employee_id)!)}
              picture={data?.find((emp) => emp.id === selected.employee_id)?.picture!}
            />
          )}
          <FormFields
            items={[
              {
                name: "occurance_date",
                type: "date-input",
                label: "Occurance Date",
              },
              {
                name: "location",
                label: "Location",
              },
              {
                name: "type",
                label: "Type",
              },
              {
                name: "severity",
                label: "Severity",
                type: "radio-group",
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
              },
              {
                name: "comments",
                type: "text-area",
                label: "Comments",
              },
            ]}
          />
        </form>
      </Form>
    </Drawer>
  );
}

export default IncidentDrawer;

"use client";
import UserMail from "@/components/common/avatar/user-info-mail";
import CardForm from "@/components/common/forms/CardForm";
import FormFields from "@/components/common/forms/FormFields";
import Loading from "@/components/spinner/Loading";
import TableData from "@/components/tabledata/TableData";
import { toast } from "@/components/ui/use-toast";
import { useIsClient } from "@/hooks/ClientRendering";
import { useEmployeeId } from "@/hooks/employeeIdHook";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { useQuery } from "@/services/queries";
import { OvertimeResponse } from "@/types/attendance-time/OvertimeType";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, Link, Selection, Textarea, User } from "@nextui-org/react";
import axios from "axios";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  clock_in: z.string(),
  clock_out: z.string(),
  date: z.string(),
  rate_per_hour: z.string(),
  comment: z.string(),
  reason: z.string(),
});

function Page() {
  const router = useRouter();
  const [selectedEmployee, setSelectedEmployees] = useState(-1);
  const { data, isLoading } = useQuery<OvertimeResponse>(
    "/api/admin/attendance-time/overtime/read"
  );
  const [isFocused, setIsFocused] = useState(false);
  const userID = useEmployeeId();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clock_in: "",
      clock_out: "",
      date: "",
      rate_per_hour: "",
      comment: "",
      reason: "",
    },
  });

  async function handleSubmit(value: any) {
    setIsFocused(true);
    try {
      await axios.post("/api/admin/attendance-time/overtime/create", {
        data: value,
        empId: selectedEmployee,
        approverId: userID,
      });
      toast({
        title: "Filed",
        description: "Overtime filed successfully!",
        variant: "success",
      });
      setTimeout(() => {
        router.push(`/attendance-time/overtime`);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error creating: " + error,
        variant: "danger",
      });
    }
    setIsFocused(false);
  }

  const fetchedEmployee: OvertimeResponse["employees"][0] | null =
    useMemo(() => {
      const employee = data?.employees?.find((e) => e.id === selectedEmployee);
      form.reset({
        rate_per_hour: String(employee?.ref_job_classes.pay_rate),
      });
      return employee || null; // Return null if no employee is found
    }, [selectedEmployee, data, form]);

  if (!useIsClient()) {
    return <Loading />;
  }

  return (
    <div className="flex gap-4 h-full">
      <CardForm
        label="File Leave"
        form={form}
        onSubmit={handleSubmit}
        className="w-fit"
        classNames={{
          body: {
            form: "grid grid-col-2 gap-2",
          }
        }}
      >
        <div className="col-span-2">
          {fetchedEmployee ? (
            <UserMail
              name={getEmpFullName(fetchedEmployee)}
              email={fetchedEmployee.email}
              picture={fetchedEmployee.picture}
            />
          ) : (
            <h1 className="font-semibold h-11">No employee selected</h1>
          )}
        </div>

        <FormFields
          items={[
            {
              name: "clock_in",
              label: "Clock In",
              type: "time",
              isRequired: true,
            },
            {
              name: "clock_out",
              label: "Clock Out",
              type: "time",
              isRequired: true,
            },
            {
              name: "date",
              label: "Date",
              type: "date",
              isRequired: true,
            },
            {
              name: "rate_per_hour",
              label: "Rate Per Hour",
              type: "number",
              isRequired: true,
              config: {
                isDisabled: true,
              }
            },
            {
              name: "reason",
              label: "Reason",
              type: "text-area",
            },
            {
              name: "comment",
              label: "Comment",
              type: "text-area",
            },
          ]}
        />
      </CardForm>
      <TableData
        isHeaderSticky
        isLoading={isLoading}
        disabledKeys={
          isFocused
            ? new Set(
                Array.from(data?.employees.map((emp) => String(emp.id)) || [])
              )
            : new Set([])
        }
        config={{
          columns: [
            { uid: "name", name: "Name", sortable: true },
            { uid: "role", name: "Role", sortable: true },
          ],
          rowCell: (item, columnKey) => {
            switch (columnKey) {
              case "name":
                return (
                  <div className="flex items-center space-x-2">
                    <Avatar src={item.picture} />
                    <p className="capitalize">{`${item.first_name} ${item.middle_name} ${item.last_name}`}</p>
                  </div>
                );
              case "role":
                return (
                  <div>
                    <p>
                      {item.ref_job_classes
                        ? item.ref_job_classes.name
                        : "None"}
                    </p>
                    <p className=" text-gray-500">
                      {item.ref_departments
                        ? item.ref_departments.name
                        : "None"}
                    </p>
                  </div>
                );
              default:
                return <></>;
            }
          },
        }}
        items={data?.employees || []}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={new Set([String(selectedEmployee)])}
        onSelectionChange={(keys) =>
          setSelectedEmployees(Number(Array.from(keys)[0]))
        }
        aria-label="Employees"
      />
    </div>
  );
}

export default Page;

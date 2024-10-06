"use client";
import CardForm from "@/components/common/forms/CardForm";
import FormFields from "@/components/common/forms/FormFields";
import TableData from "@/components/tabledata/TableData";
import { toast } from "@/components/ui/use-toast";
import { useNewOvertimes } from "@/services/queries";
import { OvertimeResponse } from "@/types/attendance-time/OvertimeType";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, Link, Selection, Textarea, User } from "@nextui-org/react";
import axios from "axios";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  clock_in: z.string(),
  clock_out: z.string(),
  date: z.string(),
  comment: z.string(),
});

function Page() {
  const router = useRouter();
  const [selectedEmployee,setSelectedEmployees] = useState(-1)
  const {data, isLoading} = useNewOvertimes();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clock_in: "",
      clock_out: "",
      date: "",
      comment: "",
    },
  });

  async function handleSubmit(value: any) {
    console.log(value, selectedEmployee);
      try {
        await axios.post("/api/admin/attendance-time/overtime/create", {
          data: value,
          empId: selectedEmployee,
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
  }
  return (
    <div className="flex gap-4 h-full">
      <CardForm label="File Leave" form={form} onSubmit={handleSubmit}>
        <User
          name={data?.employees.find(e=> e.id === selectedEmployee)?.last_name || "No selected"}
          description={
            <Link size="sm" isExternal>
              {data?.employees.find(e=> e.id === selectedEmployee)?.email || "No selected"}
            </Link>
          }
          avatarProps={{
            src: data?.employees.find(e=> e.id === selectedEmployee)?.picture || "No selected",
          }}
        />
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
              name: "comment",
              label: "Comment",
              Component: (field) => {
                return (
                  <Textarea
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                );
              },
            },
          ]}
        />
      </CardForm>
      <TableData
      className="h-full"
      isHeaderSticky
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
        selectedKeys={new Set([String(selectedEmployee)])}
        onSelectionChange={(keys)=>setSelectedEmployees(Number(Array.from(keys)[0]))}
        aria-label="Employees"
      />
    </div>
  );
}

export default Page;

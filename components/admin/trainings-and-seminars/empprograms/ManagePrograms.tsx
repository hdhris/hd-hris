"use client";
import CardForm from "@/components/common/forms/CardForm";
import FormFields from "@/components/common/forms/FormFields";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery } from "@/services/queries";
import UserMail from "@/components/common/avatar/user-info-mail";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import SearchFilter from "@/components/common/filter/SearchFilter";
import { useRouter } from "next/navigation";
import { Spinner, cn } from "@nextui-org/react";
import EmployeeListForm from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";

type EmployeeInclude = {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  email?: string;
  picture?: string;
  ref_departments?: {
    id: number;
    name: string;
  };
  ref_job_classes?: {
    id: number;
    name: string;
  };
};

type ProgramData = {
  id?: number;
  name: string;
  description: string;
  location: string;
  hour_duration: number;
  start_date: string;
  end_date: string;
  // employee_instructor_id: number;
  instructor_name: string;
  is_active: boolean;
  type: string;
  max_participants: number;
  dim_training_participants?: {
    employee_id: number;
    status: string;
  }[];
};

interface ProgramResponse {
  program?: ProgramData;
  employees: EmployeeInclude[];
}

const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." }),
  hour_duration: z
    .number()
    .min(1, { message: "Duration must be at least 1 hour." }),
  location: z
    .string()
    .min(3, { message: "Location must be at least 3 characters." }),
  start_date: z.string(),
  end_date: z.string(),
  // employee_instructor_id: z.number().min(1, { message: "Please select an instructor" }),
  instructor_name: z
    .string()
    .regex(/^[a-zA-Z\s]*$/, "The trainer name should be in proper name")
    .optional(),
  max_participants: z
    .number()
    .min(1, { message: "Maximum participants must be at least 1." }),
  is_active: z.boolean(),
  type: z.string().default("training"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ManagePrograms({
  program_id,
}: {
  program_id?: string;
}) {
  const router = useRouter();
  const { data: programData, isLoading } = useQuery<ProgramResponse>(
    `/api/admin/trainings-and-seminars/empprograms/read?id=${program_id}`
  );

  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(
    []
  );
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeInclude[]>(
    []
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: undefined,
      name: "",
      description: "",
      hour_duration: 1,
      location: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
      instructor_name: "",
      max_participants: 10,
      is_active: true,
      type: "training",
    },
  });

  useEffect(() => {
    if (programData?.program) {
      const { dim_training_participants, ...programValues } =
        programData.program;
      form.reset(programValues as FormValues);
      console.log("Resetting form with values:", programValues);
    }
  }, [programData?.program, form]);

  useEffect(() => {
    if (programData?.employees) {
      setFilteredEmployees(programData.employees);
    }
  }, [programData?.employees]);

  useEffect(() => {
    if (programData?.program?.dim_training_participants) {
      const participants = programData.program.dim_training_participants;
      if (participants.length > 0) {
        setSelectedParticipants(participants.map((p) => p.employee_id));
      }
    }
  }, [programData?.program]);

  function selectParticipant(id: number) {
    setSelectedParticipants((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        if (updated.size < form.watch("max_participants")) {
          updated.add(id);
        } else {
          toast({
            title: "Maximum participants reached",
            variant: "warning",
          });
        }
      }
      return [...updated];
    });
  }

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      try {
        const startDate = new Date(values.start_date);
        const endDate = new Date(values.end_date);

        if (endDate < startDate) {
          toast({
            title: "End date cannot be before start date",
            variant: "warning",
          });
          return;
        }

        if (selectedParticipants.length === 0) {
          toast({
            title: "Please select at least one participant",
            variant: "warning",
          });
          return;
        }

        const response = await axios.post(
          "/api/admin/trainings-and-seminars/empprograms/upsert",
          {
            data: values,
            participants: selectedParticipants,
          }
        );

        const id = response.data?.id;
        if (id) {
          toast({
            title: `Program ${
              programData?.program ? "updated" : "created"
            } successfully`,
            variant: "success",
          });
          router.push("/trainings-and-seminars/empprograms");
        } else {
          throw new Error("Invalid returned ID");
        }
      } catch (error) {
        toast({ title: `${error}`, variant: "danger" });
      }
    },
    [selectedParticipants, programData, router]
  );

  if (isLoading) {
    return <Spinner label="Loading..." className="flex-1" />;
  }

  // const instructorId = form.watch('employee_instructor_id');

  return (
    <div className="h-full w-full flex gap-2">
      <CardForm
        label={`${programData?.program ? "Update" : "Create"} Program`}
        form={form}
        onSubmit={handleSubmit}
        className="w-fit"
        classNames={{ body: { form: "space-y-4" } }}
      >
        <FormFields
          items={[
            {
              name: "name",
              label: "Program Name",
              isRequired: true,
              placeholder: "Add a program name (e.g., technical training)",
            },
            {
              name: "description",
              label: "Description",
              type: "text-area",
              placeholder:
                "Enter a program description (e.g., A comprehensive training program to enhance technical skills and efficiency).",
              isRequired: true,
            },
            {
              name: "location",
              label: "Location",
              placeholder: "e.g., Koronadal City",
              isRequired: true,
            },
            // {
            //     name: "employee_instructor_id",
            //     label: "Program Instructor",
            //     type: "text", // Use "text" instead of "custom"
            //     Component: (field) => (
            //       <EmployeeListForm
            //         employees={filteredEmployees.map(emp => ({
            //           id: emp.id,
            //           name: getEmpFullName(emp),
            //           picture: emp.picture || "",
            //           department: emp.ref_departments?.name || "",
            //         //   is_regular: true // or any appropriate value
            //         }))}
            //         isLoading={isLoading}
            //         onSelected={(employeeId) => {
            //           field.onChange(employeeId);
            //         }}
            //       />
            //     ),
            //     isRequired: true,
            //   },
            {
              name: "instructor_name",
              label: "Trainer",
              placeholder:"Enter Trainer name",
              type: "text",
              isRequired: true,
              description:"The trainer name should be valid"
            },
            {
              name: "hour_duration",
              label: "Duration (hours)",
              type: "number",
              isRequired: true,
            },
            {
              name: "start_date",
              label: "Start Date",
              type: "date-picker",
              isRequired: true,
            },
            {
              name: "end_date",
              label: "End Date",
              type: "date-picker",
              isRequired: true,
            },
            {
              name: "max_participants",
              label: "Maximum Participants",
              type: "number",
              isRequired: true,
            },
            {
              name: "is_active",
              type: "switch",
              label: "Active",
            },
          ]}
        />
      </CardForm>
      <div className="w-full h-full overflow-auto">
        <div className="sticky top-0 left-0 bg-gray-50 z-10 pb-4 shadow-md flex justify-between">
          <SearchFilter
            items={programData?.employees || []}
            setResults={setFilteredEmployees}
            className="w-80"
            searchConfig={[
              {
                key: "first_name",
                label: "",
              },
              {
                key: "middle_name",
                label: "",
              },
              {
                key: "last_name",
                label: "Name",
              },
              {
                key: "email",
                label: "Email",
              },
            ]}
          />
          <p className="text-gray-500 font-semibold text-small">
            {selectedParticipants.length} participants selected
          </p>
        </div>
        {filteredEmployees.length === 0 && (
          <p className="text-gray-500 text-center p-4">No employees found</p>
        )}
        <div className="min-w-[750px] space-y-1 h-fit">
          {filteredEmployees
            // .filter(emp => emp.id !== instructorId)
            .map((item: EmployeeInclude) => (
              <div
                key={item.id}
                className={cn(
                  "p-4 border-2 cursor-pointer",
                  selectedParticipants.includes(item.id)
                    ? "border-blue-500"
                    : "border-gray-50"
                )}
                onClick={() => selectParticipant(item.id)}
              >
                <div className="flex flex-row gap-4">
                  <div className="flex-1">
                    <UserMail
                      name={getEmpFullName(item)}
                      picture={item.picture || ""}
                      email={item.email || ""}
                    />
                  </div>
                  <div className="w-48 text-small">
                    <p>
                      {item.ref_job_classes
                        ? item.ref_job_classes.name
                        : "None"}
                    </p>
                    <p className="text-gray-500">
                      {item.ref_departments
                        ? item.ref_departments.name
                        : "None"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

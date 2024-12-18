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
import { DateStyle } from "@/lib/custom/styles/InputStyle";
import { parseAbsoluteToLocal } from "@internationalized/date";
import { toGMT8 } from "@/lib/utils/toGMT8";
import dayjs from "dayjs";
import { FormInputProps } from "@/components/common/forms/FormFields";

// Interfaces
interface Employee {
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
}

interface Participant {
  employee_id: number;
  enrollement_date: string; // Matches the database field name
  status: string;
  feedback?: string;
}

// Schema
const formSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().min(3, { message: "Name must be at least 3 characters." }),
    description: z
      .string()
      .min(10, { message: "Description must be at least 10 characters." }),
    hour_duration: z.number(),
    location: z
      .string()
      .min(3, { message: "Location must be at least 3 characters." }),
    start_date: z
      .string()
      .refine((val) => dayjs(val).isValid(), { message: "Invalid start date" }),
    end_date: z.string(),
    enrollement_date: z.string().refine(
      (val) => {
        const enrollement_dateDate = dayjs(val);
        return enrollement_dateDate.isValid();
      },
      { message: "Invalid enrollement_date date" }
    ),
    instructor_name: z
      .string()
      .regex(/^[a-zA-Z\s]*$/, "The trainer name should be in proper name"),
    max_participants: z
      .number()
      .min(1, { message: "Maximum participants must be at least 1." }),
    is_active: z.boolean(),
    type: z.string().default("training"),
  })
  .refine(
    (data) => {
      const startDate = dayjs(data.start_date);
      const endDate = dayjs(data.end_date);
      return endDate.isValid() && endDate.isAfter(startDate);
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

// Utility function for date parsing
const parseAndFormatDate = (dateString: string | undefined | null) => {
  if (!dateString) return undefined;
  const parsed = dayjs(dateString);
  return parsed.isValid() && parsed.year() > 1971
    ? parsed.format("YYYY-MM-DDTHH:mm")
    : undefined;
};

// Main Component
export default function ManagePrograms({
  program_id,
}: {
  program_id?: string;
}) {
  const router = useRouter();
  const [selectedParticipants, setSelectedParticipants] = useState<
    Participant[]
  >([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  const defaultFormValues: FormValues = {
    id: undefined,
    name: "",
    description: "",
    hour_duration: 0,
    location: "",
    start_date: toGMT8().format("YYYY-MM-DDTHH:mm"),
    end_date: toGMT8().add(1, "day").format("YYYY-MM-DDTHH:mm"),
    enrollement_date: toGMT8().format("YYYY-MM-DDTHH:mm"),
    instructor_name: "",
    max_participants: 10,
    is_active: true,
    type: "training",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
    mode: "onChange",
  });

  const { data: programData, isLoading } = useQuery<{
    program?: FormValues & { dim_training_participants?: Participant[] };
    employees: Employee[];
  }>(
    `/api/admin/trainings-and-seminars/empprograms/read?id=${program_id}&type=training`
  );

  useEffect(() => {
    if (!programData?.program) return;

    const { dim_training_participants, ...programValues } = programData.program;

    const formValues: Partial<FormValues> = {
      ...programValues,
      start_date:
        parseAndFormatDate(programValues.start_date) ||
        defaultFormValues.start_date,
      end_date:
        parseAndFormatDate(programValues.end_date) ||
        defaultFormValues.end_date,
      enrollement_date:
        parseAndFormatDate(programValues.enrollement_date) ||
        defaultFormValues.enrollement_date,
    };

    form.reset(formValues);

    if (dim_training_participants?.length) {
      setSelectedParticipants(
        dim_training_participants.map((participant) => ({
          ...participant,
          status: participant.status || "pending",
        }))
      );
    }
  }, [programData?.program, form]);

  useEffect(() => {
    if (programData?.employees) {
      setFilteredEmployees(programData.employees);
    }
  }, [programData?.employees]);

  useEffect(() => {
    const start = dayjs(form.watch("start_date"));
    const end = dayjs(form.watch("end_date"));

    if (start.isValid() && end.isValid()) {
      if (end.isBefore(start)) {
        form.setValue(
          "end_date",
          start.add(1, "hour").format("YYYY-MM-DDTHH:mm")
        );
      }
      form.setValue(
        "hour_duration",
        Math.round(end.diff(start, "hour", true) * 100) / 100
      );
    }
  }, [form.watch("start_date"), form.watch("end_date")]);

  useEffect(() => {
    const enrollmentDate = form.watch("enrollement_date");
    if (enrollmentDate && selectedParticipants.length > 0) {
      setSelectedParticipants((prevParticipants) =>
        prevParticipants.map((participant) => ({
          ...participant,
          enrollement_date: enrollmentDate,
        }))
      );
    }
  }, [form.watch("enrollement_date")]);

  const selectParticipant = useCallback(
    (id: number) => {
      const currentEnrollmentDate = form.getValues("enrollement_date");

      setSelectedParticipants((prev) => {
        const existingParticipant = prev.find((p) => p.employee_id === id);

        if (existingParticipant) {
          return prev.filter((p) => p.employee_id !== id);
        }

        if (prev.length >= form.watch("max_participants")) {
          toast({
            title: "Maximum participants reached",
            variant: "warning",
          });
          return prev;
        }

        return [
          ...prev,
          {
            employee_id: id,
            enrollement_date: currentEnrollmentDate,
            status: "pending",
            feedback: "",
          },
        ];
      });
    },
    [form]
  );

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      try {
        if (selectedParticipants.length === 0) {
          toast({
            title: "Please select at least one participant",
            variant: "warning",
          });
          return;
        }

        const enrollement_date = values.enrollement_date;

        const response = await axios.post(
          "/api/admin/trainings-and-seminars/empprograms/upsert",
          {
            data: {
              ...values,
              type: "training",
              dim_training_participants: selectedParticipants.map(
                (participant) => ({
                  ...participant,
                  enrollement_date: enrollement_date,
                  status: "enrolled",
                })
              ),
            },
          }
        );

        if (response.data?.id) {
          toast({
            title: `Program ${program_id ? "updated" : "created"} successfully`,
            variant: "success",
          });
          router.push("/trainings-and-seminars/empprograms");
        }
      } catch (error) {
        toast({ title: `${error}`, variant: "danger" });
      }
    },
    [selectedParticipants, program_id, router]
  );

  if (isLoading) {
    return <Spinner label="Loading..." className="flex-1" />;
  }

  const formFields: FormInputProps[] = [
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
      placeholder: "Enter a program description",
      isRequired: true,
    },
    {
      name: "location",
      label: "Location",
      placeholder: "e.g., Koronadal City",
      isRequired: true,
    },
    {
      name: "instructor_name",
      label: "Trainer",
      placeholder: "Enter Trainer name",
      type: "text",
      isRequired: true,
      description: "The trainer name should be valid",
    },
    {
      name: "start_date",
      label: "Start Date & Time",
      type: "datetime-local",
      isRequired: true,
      config: {
        placeholder: "Select start date and time",
        classNames: DateStyle,
        validationState: "valid",
      },
    },
    {
      name: "end_date",
      label: "End Date & Time",
      type: "datetime-local",
      isRequired: true,
      config: {
        placeholder: "Select end date and time",
        minValue: form.watch("start_date")
          ? parseAbsoluteToLocal(dayjs(form.watch("start_date")).toISOString())
          : parseAbsoluteToLocal(dayjs().startOf("day").toISOString()),
        classNames: DateStyle,
        validationState: "valid",
      },
    },
    {
      name: "hour_duration",
      label: "Duration (hours)",
      type: "number",
      isRequired: true,
      inputDisabled: true,
      description: "Automatically calculated",
    },
    {
      name: "enrollement_date",
      label: "Enrollment Date & Time",
      type: "datetime-local",
      isRequired: true,
      config: {
        placeholder: "Select enrollement_date date and time",
        classNames: DateStyle,
        validationState: "valid",
      },
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
      config: {
        color: "success",
      },
    },
  ];

  return (
    <div className="h-full w-full flex gap-2">
      <div className="w-fit">
        <CardForm
          label={`${program_id ? "Update" : "Create"} Program`}
          form={form}
          onSubmit={handleSubmit}
          className="w-[400px]"
          classNames={{ body: { form: "space-y-4" } }}
        >
          <FormFields items={formFields} />
        </CardForm>
      </div>
      <div className="w-full h-full overflow-auto">
        <div className="sticky top-0 left-0 bg-gray-50 z-10 pb-4 shadow-md">
          <div className="flex justify-between items-center p-4">
            <SearchFilter
              items={programData?.employees || []}
              setResults={setFilteredEmployees}
              className="w-80"
              searchConfig={[
                { key: "first_name", label: "" },
                { key: "middle_name", label: "" },
                { key: "last_name", label: "Name" },
                { key: "email", label: "Email" },
              ]}
            />
            <p className="text-gray-500 font-semibold text-small">
              {selectedParticipants.length} participants selected
            </p>
          </div>
        </div>

        <div className="min-w-[750px] space-y-1 h-fit">
          {filteredEmployees.map((item) => {
            const participant = selectedParticipants.find(
              (p) => p.employee_id === item.id
            );
            return (
              <div
                key={item.id}
                className={cn(
                  "p-4 border-2 cursor-pointer hover:bg-gray-50",
                  participant ? "border-blue-500" : "border-gray-50"
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
                    <p>{item.ref_job_classes?.name || "None"}</p>
                    <p className="text-gray-500">
                      {item.ref_departments?.name || "None"}
                    </p>
                    {participant && (
                      <>
                        <p className="text-blue-500 mt-1">
                          Enroll Date:{" "}
                          {dayjs(participant.enrollement_date).isValid()
                            ? dayjs(participant.enrollement_date).format(
                                "MMM DD, YYYY hh:mm A"
                              )
                            : "Invalid Date"}
                        </p>
                        <p className="text-blue-500">
                          Status: {participant.status}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

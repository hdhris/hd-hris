"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@/services/queries";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { Form } from "@/components/ui/form";
import FormFields from "@/components/common/forms/FormFields";
import { FormInputProps } from "@/components/common/forms/FormFields";
import { DateStyle } from "@/lib/custom/styles/InputStyle";
import Drawer from "@/components/common/Drawer";
import { toGMT8 } from "@/lib/utils/toGMT8";
import dayjs from "dayjs";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scheduleId?: number;
  onUpdated: () => void;
}

const schema = z.object({
  program_id: z.string().transform((val) => Number(val)),
  location: z.string().min(3),
  session_timestamp: z.string(),
  hour_duration: z.number().min(1),
});

export default function ManageSchedule({
  isOpen,
  onClose,
  scheduleId,
  onUpdated,
}: Props) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      program_id: "0", // Change to string since auto-complete expects string
      location: "",
      session_timestamp: toGMT8().format("YYYY-MM-DDTHH:mm"),
      hour_duration: 1,
    },
  });

  interface QueryResponse {
    schedule?: {
      program_id: number;
      location: string;
      session_timestamp: string;
      hour_duration: number;
    };
    programs?: { id: number; name: string; type: string }[];
  }

  const { data } = useQuery<QueryResponse>(
    `/api/admin/trainings-and-seminars/schedules/read?id=${scheduleId || ""}`
  );

  React.useEffect(() => {
    if (data?.schedule) {
      form.reset({
        ...data.schedule,
        program_id: data.schedule.program_id.toString(), // Convert to string for the form
      });
    }
  }, [data, form]);

const programOptions = data?.programs?.map((p) => ({
    value: p.id.toString(), // Convert to string to match GroupInputOptions type
    label: `${p.name} (${p.type})`,
})) || [];

const formFields: FormInputProps[] = [
    {
        name: "program_id",
        label: "Program",
        type: "auto-complete",
        isRequired: true,
        config: {
            placeholder: "Select Program",
            options: programOptions,
        },
    },
    {
        name: "location",
        label: "Location",
        isRequired: true,
        placeholder: "Enter location",
    },
    {
        name: "session_timestamp",
        label: "Session Date & Time",
        type: "date-picker",
        isRequired: true,
        config: {
            placeholder: "Select date and time",
            classNames: DateStyle,
            validationState: "valid",
        },
    },
    {
        name: "hour_duration",
        label: "Duration (hours)",
        type: "number",
        isRequired: true,
    },
];

  const onSubmit = async (values: any) => {
    try {
      const formData = {
        ...values,
        program_id: Number(values.program_id)
      };
      
      await axios.post("/api/admin/trainings-and-seminars/schedules/upsert", {
        data: scheduleId ? { ...formData, id: scheduleId } : formData,
      });

      toast({
        title: `Schedule ${scheduleId ? "updated" : "created"}`,
        variant: "success",
      });

      onUpdated();
      onClose();
    } catch (error) {
      toast({
        title: "Error saving schedule",
        variant: "danger",
      });
    }
  };

  return (
    <Drawer
      title={`${scheduleId ? "Edit" : "Create"} Schedule`}
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}  id="drawer-form" className="space-y-4">
          <FormFields items={formFields} size="sm" />
        </form>
      </Form>
    </Drawer>
  );
}

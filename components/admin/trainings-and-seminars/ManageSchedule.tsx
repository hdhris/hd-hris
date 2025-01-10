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
import AddressInput from "@/components/common/forms/address/AddressInput";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scheduleId?: number;
  onUpdated: () => void;
}

// Update schema to include address fields
const schema = z.object({
  program_id: z.string().transform((val) => Number(val)),
  addr_region: z.string().min(1, "Region is required"),
  addr_province: z.string().min(1, "Province is required"),
  addr_municipal: z.string().min(1, "Municipal is required"),
  addr_baranggay: z.string().min(1, "Barangay is required"),
  session_timestamp: z.string(),
  hour_duration: z.number().min(1),
});

interface Schedule {
  program_id: number;
  location: string;
  session_timestamp: string;
  hour_duration: number;
  locationDetails?: {
    addr_region?: { address_code: number };
    addr_province?: { address_code: number };
    addr_municipal?: { address_code: number };
    addr_baranggay?: { address_code: number };
  };
}

export default function ManageSchedule({
  isOpen,
  onClose,
  scheduleId,
  onUpdated,
}: Props) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      program_id: "",
      addr_region: "",
      addr_province: "",
      addr_municipal: "",
      addr_baranggay: "",
      session_timestamp: toGMT8().format("YYYY-MM-DDTHH:mm"),
      hour_duration: 1,
    },
  });

  interface QueryResponse {
    schedule?: Schedule;
    programs?: { id: number; name: string; type: string }[];
  }

  const { data } = useQuery<QueryResponse>(
    `/api/admin/trainings-and-seminars/schedules/read?id=${scheduleId || ""}`
  );

  // Reset form when editing
  React.useEffect(() => {
    if (data?.schedule) {
      const locationDetails = data.schedule.locationDetails;
      form.reset({
        program_id: data.schedule.program_id.toString(),
        addr_region: locationDetails?.addr_region?.address_code.toString() || "",
        addr_province: locationDetails?.addr_province?.address_code.toString() || "",
        addr_municipal: locationDetails?.addr_municipal?.address_code.toString() || "",
        addr_baranggay: locationDetails?.addr_baranggay?.address_code.toString() || "",
        session_timestamp: toGMT8(data.schedule.session_timestamp).format("YYYY-MM-DDTHH:mm"),
        hour_duration: data.schedule.hour_duration,
      });
    }
  }, [data?.schedule, form]);

  const programOptions = React.useMemo(() => {
    return data?.programs?.map((program) => ({
      value: program.id.toString(),
      label: `${program.name} (${program.type})`,
    })) || [];
  }, [data?.programs]);

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
      Component: () => (
        <div>
          <AddressInput />
        </div>
      ),
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
        program_id: Number(values.program_id),
        location: JSON.stringify({
          addr_region: parseInt(values.addr_region, 10),
          addr_province: parseInt(values.addr_province, 10),
          addr_municipal: parseInt(values.addr_municipal, 10),
          addr_baranggay: parseInt(values.addr_baranggay, 10),
        }),
      };

      await axios.post("/api/admin/trainings-and-seminars/schedules/upsert", {
        data: scheduleId ? { ...formData, id: scheduleId } : formData,
      });

      toast({
        title: `Schedule ${scheduleId ? "updated" : "created"} successfully`,
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
        <form onSubmit={form.handleSubmit(onSubmit)} id="drawer-form" className="space-y-4">
          <FormFields items={formFields} size="sm" />
        </form>
      </Form>
    </Drawer>
  );
}
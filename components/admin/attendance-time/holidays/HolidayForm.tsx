import Drawer from "@/components/common/Drawer";
import FormFields from "@/components/common/forms/FormFields";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { objectExcludes, objectIncludes } from "@/helper/objects/filterObject";
import { toGMT8 } from "@/lib/utils/toGMT8";
import {
  HolidayEvent,
  TransHoliday,
} from "@/types/attendance-time/HolidayTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

function HolidayForm({
  isOpen,
  onClose,
  selectedItem,
  transItem,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: HolidayEvent | null;
  transItem: TransHoliday | null;
}) {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);
  const formSchema = z.object({
    id: z.union([z.string(), z.number(), z.null()]).optional(),
    name: z.string().min(1, { message: "Holiday name is required." }),
    type: z.string(),
    date: z.object({
      start: z.string(),
      end: z.string(),
    }),
    pay_rate_percentage: z.number(),
    no_work: z.boolean(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (selectedItem) {
      form.reset({
        id: selectedItem.id,
        name: selectedItem.name,
        type: selectedItem.type,
        date: {
          start: selectedItem.start_date,
          end: selectedItem.end_date,
        },
        pay_rate_percentage: Number(transItem?.pay_rate_percentage || "100"),
        no_work: transItem?.no_work || false,
      });
    } else {
      form.reset({
        id: null,
        name: "New Holiday",
        type: "Private Holiday",
        date: {
          start: toGMT8().format("YYYY-MM-DD"),
          end: toGMT8().add(1, "day").format("YYYY-MM-DD"),
        },
        pay_rate_percentage: 0,
        no_work: false,
      });
    }
  }, [selectedItem, form]);

  async function handleSubmit(value: z.infer<typeof formSchema>) {
    // console.log(value);
    setSubmitting(true);
    try {
      await axios.post("/api/admin/attendance-time/holidays/create", {
        holidayInfo: {
          ...objectIncludes(value, ["name", "id", "type"]),
          start_date: toGMT8(value.date.start).toISOString(),
          end_date: toGMT8(value.date.end).toISOString(),
        },
        transHoliday: {
          ...objectIncludes(value, ["pay_rate_percentage", "no_work","name"]),
          date: toGMT8(value.date.start).toISOString(),
        },
      });
      const isNew = value.id === null;
      toast({
        title: isNew? "Created" : "Updated",
        description: `Holiday ${isNew? "created" : "updated"} successfully!`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error creating: " + error,
        variant: "danger",
      });
    }
    setSubmitting(false);
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={selectedItem ? "Manage Holiday" : "Create Holiday"}
      isSubmitting={isSubmitting}
    >
      <Form {...form}>
        <form
          className="space-y-4"
          id="drawer-form"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FormFields
            items={[
              {
                name: "name",
                label: "Holiday Name",
                isRequired: true,
                inputDisabled: typeof selectedItem?.id === "string",
              },
              {
                name: "date",
                label: "Date",
                isRequired: true,
                type: "date-range-picker",
                inputDisabled: typeof selectedItem?.id === "string",
              },
              {
                name: "type",
                label: "Type",
                type: "radio-group",
                inputDisabled: typeof selectedItem?.id === "string",
                config: {
                  options: [
                    { label: "Public", value: "Public Holiday" },
                    { label: "Private", value: "Private Holiday" },
                    { label: "Observance", value: "Observance" },
                  ],
                },
              },
              {
                name: "pay_rate_percentage",
                label: "Pay Rate %",
                type: "number",
                placeholder: "0.00",
                isRequired: true,
              },
              {
                name: "no_work",
                label: "No work",
                type: "switch",
              },
            ]}
          />
        </form>
      </Form>
    </Drawer>
  );
}

export default HolidayForm;

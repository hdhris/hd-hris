import React, { useEffect, useCallback } from "react";
import {
  Button,
} from "@nextui-org/react";
import { BatchSchedule } from "@/types/attendance-time/AttendanceTypes";
import { Form } from "@/components/ui/form";
import FormFields from "@/components/common/forms/FormFields";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toGMT8 } from "@/lib/utils/toGMT8";
import Drawer from "@/components/common/Drawer";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";

interface ScheduleModalProps {
  visible: boolean;
  pending: boolean;
  onClose: () => void;
  onSave: (schedule: BatchSchedule) => void;
  onDelete: (id: Number | undefined) => void;
  selectedSchedule?: BatchSchedule | null;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  visible,
  pending,
  onClose,
  onSave,
  onDelete,
  selectedSchedule,
}) => {
  const formSchema = z.object({
    id: z.number().optional(),
    name: z
      .string()
      .min(1, { message: "Schedule name is required." })
      .max(20, { message: "Character limit reached." }),
    clock_in: z.string(),
    clock_out: z.string(),
    break_min: z.number(),
    is_active: z.boolean(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: -1,
      name: "",
      clock_in: "",
      clock_out: "",
      break_min: 60,
      is_active: true,
    },
  });

  // Effect to populate modal fields if editing
  const load = useCallback(() => {
    if (selectedSchedule) {
      form.reset({
        id: selectedSchedule.id,
        name: selectedSchedule.name,
        clock_in: toGMT8(selectedSchedule.clock_in).format("HH:mm"),
        clock_out: toGMT8(selectedSchedule.clock_out).format("HH:mm"),
        break_min: selectedSchedule.break_min,
        is_active: selectedSchedule.is_active,
      });
    } else {
      // Reset form if adding a new schedule
      form.reset({
        id: -1,
        name: "",
        clock_in: "",
        clock_out: "",
        break_min: 60,
        is_active: true,
      });
    }
  }, [selectedSchedule, form]);
  useEffect(() => {
    load();
  }, [selectedSchedule, load]);

  const handleSave = (value: any) => {
    const newSchedule: BatchSchedule = {
      created_at: selectedSchedule
        ? selectedSchedule.created_at
        : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      ...value,
    };

    onSave(newSchedule);
  };

  return (
    <Drawer
      footer={
        <>
          {selectedSchedule && (
            <Button
              {...uniformStyle({color:"warning"})}
              onClick={() => {
                onDelete(selectedSchedule?.id);
              }}
            >
              Delete
            </Button>
          )}
          <Button
            isLoading={pending}
            {...uniformStyle()}
            type="submit"
            form="schedule-form"
            className="ms-auto"
          >
            {selectedSchedule ? "Update" : "Add"}
          </Button>
        </>
      }
      title={selectedSchedule ? "Edit Schedule" : "Add Schedule"}
      isOpen={visible}
      onClose={onClose}
    >
      <Form {...form}>
        <form id="schedule-form" onSubmit={form.handleSubmit(handleSave)}>
          <FormFields
            items={[
              {
                name: "name",
                label: "Schedule Name",
                isRequired: true,
              },
              {
                name: "clock_in",
                label: "Clock In",
                isRequired: true,
                type: "time",
              },
              {
                name: "clock_out",
                label: "Clock Out",
                isRequired: true,
                type: "time",
              },
              {
                name: "break_min",
                label: "Break Minutes",
                isRequired: true,
              },
              {
                name: "is_active",
                type: "switch",
                label: "Active",
                config: {
                  defaultSelected: true,
                  description: "test",
                },
              },
            ]}
          />
        </form>
      </Form>
    </Drawer>
  );
};

export default ScheduleModal;

import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Button,
  Input,
  Switch,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TimeInput,
} from "@nextui-org/react";
import { BatchSchedule } from "@/types/attendance-time/AttendanceTypes";
import { Time } from "@internationalized/date";
import { dateToTime } from "@/lib/utils/dateToTime";
import { Form } from "@/components/ui/form";
import FormFields from "@/components/common/forms/FormFields";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import BorderedSwitch from "@/components/common/BorderedSwitch";
import dayjs from "dayjs";
import { toGMT8 } from "@/lib/utils/toGMT8";

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
  }, [selectedSchedule]);

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
    <Modal isOpen={visible} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>
          {selectedSchedule ? "Edit Schedule" : "Add Schedule"}
        </ModalHeader>
        <ModalBody>
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
                      type: "checkbox",
                      label: "Active",
                      description:
                        "Available for employees during registration and updates.",
                    },
                  ]}
                />
            </form>
          </Form>
        </ModalBody>
        <ModalFooter>
          {selectedSchedule && (
            <Button
              color="warning"
              className="me-auto"
              onClick={() => {
                onDelete(selectedSchedule?.id);
              }}
            >
              Delete
            </Button>
          )}
          <Button color="danger" variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button
            isLoading={pending}
            color="primary"
            type="submit"
            form="schedule-form"
          >
            {selectedSchedule ? "Update" : "Add"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ScheduleModal;

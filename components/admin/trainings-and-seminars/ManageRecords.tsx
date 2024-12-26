import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@/services/queries";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { Form } from "@/components/ui/form";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import Drawer from "@/components/common/Drawer";
import { Button } from "@nextui-org/react";
import { toGMT8 } from "@/lib/utils/toGMT8";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const schema = z.object({
  schedule_id: z.coerce.number().min(1, "Schedule is required"),
  participant_id: z.coerce.number().min(1, "Participant is required"),
  rating: z.coerce.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
  suggestion: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export default function ManageRecord({ isOpen, onClose, onUpdated }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      schedule_id: 0,
      participant_id: 0,
      rating: undefined,
      feedback: "",
      suggestion: ""
    }
  });

  const selectedScheduleId = form.watch("schedule_id");

  const { data: response, mutate: refreshData } = useQuery<{
    schedules: Array<{
      id: number;
      session_timestamp: string;
      ref_training_programs: {
        id: number;
        name: string;
      };
    }>;
    participants: Array<{
      id: number;
      trans_employees: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        picture: string | null;
        ref_departments: {
          name: string | null;
        } | null;
      };
    }>;
  }>(
    `/api/admin/trainings-and-seminars/records/read?scheduleId=${selectedScheduleId || ""}`,
    { 
      revalidateIfStale: true,
      revalidateOnFocus: false 
    }
  );

  // Reset participant selection and other fields when schedule changes
  useEffect(() => {
    form.setValue("participant_id", 0);
    form.setValue("rating", undefined);
    form.setValue("feedback", "");
    form.setValue("suggestion", "");
  }, [selectedScheduleId, form]);

  // Refresh data when schedule changes
  useEffect(() => {
    if (selectedScheduleId) {
      refreshData();
    }
  }, [selectedScheduleId, refreshData]);

  const schedules = response?.schedules || [];
  const participants = response?.participants || [];

  const getFormFields = (): FormInputProps[] => {
    // Always show schedule selection
    const baseFields: FormInputProps[] = [
      {
        name: "schedule_id",
        label: "Select Schedule",
        type: "auto-complete",
        isRequired: true,
        config: {
          placeholder: "Select a training schedule",
          options: schedules.map((schedule) => ({
            value: schedule.id.toString(),
            label: `${schedule.ref_training_programs.name} - ${toGMT8(schedule.session_timestamp).format("MMM DD, YYYY hh:mm A")}`,
          })),
        },
      }
    ];

    // Only add additional fields if a schedule is selected
    if (selectedScheduleId) {
      return [
        ...baseFields,
        {
          name: "participant_id",
          label: "Select Participant",
          type: "auto-complete",
          isRequired: true,
          config: {
            placeholder: participants.length === 0 
              ? "No participants available" 
              : "Select participant",
            options: participants.map((p) => ({
              value: p.id.toString(),
              label: `${p.trans_employees.first_name} ${p.trans_employees.last_name}`,
              description: p.trans_employees.ref_departments?.name || "No Department"
            })),
          },
        },
        {
          name: "rating",
          label: "Rating",
          type: "number",
          config: {
            min: 1,
            max: 5,
            description: "Rate between 1-5",
            placeholder: "Enter rating"
          }
        },
        {
          name: "feedback",
          label: "Feedback",
          type: "text-area",
          config: {
            placeholder: "Enter feedback",
            description: "Provide feedback about the participant's performance"
          }
        },
        {
          name: "suggestion",
          label: "Suggestion",
          type: "text-area",
          config: {
            placeholder: "Enter suggestions",
            description: "Provide suggestions for improvement"
          }
        }
      ];
    }

    return baseFields;
  };

  const handleClose = () => {
    form.reset({
      schedule_id: 0,
      participant_id: 0,
      rating: undefined,
      feedback: "",
      suggestion: ""
    });
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (!selectedScheduleId) {
        toast({
          title: "Please select a schedule",
          variant: "danger"
        });
        return;
      }

      await axios.post("/api/admin/trainings-and-seminars/records/upsert", {
        data: values
      });

      toast({
        title: "Record created successfully",
        variant: "success"
      });
      
      handleClose();
      onUpdated();
    } catch (error) {
      console.error('Error creating record:', error);
      toast({
        title: "Error creating record",
        description: "Please try again",
        variant: "danger"
      });
    }
  };
  
  return (
    <Drawer
      title="Create Training Record"
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormFields items={getFormFields()} size="sm" />
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              color="danger" 
              variant="light" 
              onPress={handleClose}
              isDisabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              color="primary" 
              type="submit"
              isLoading={form.formState.isSubmitting}
              isDisabled={form.formState.isSubmitting || !selectedScheduleId || !form.watch("participant_id")}
            >
              Create Record
            </Button>
          </div>
        </form>
      </Form>
    </Drawer>
  );
}
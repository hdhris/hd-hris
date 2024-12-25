import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Button,
  Input,
  Textarea,
} from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import CardView from "@/components/common/card-view/card-view";
import CardTable from "@/components/common/card-view/card-table";
import Typography from "@/components/common/typography/Typography";
import UserMail from "@/components/common/avatar/user-info-mail";
import dayjs from "dayjs";

const formSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
  suggestion: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface ViewTrainingRecordProps {
  record: any; // Replace with your TrainingRecord type
  onClose: () => void;
  onRecordUpdated: () => Promise<void>;
}

export default function ViewTrainingRecord({
  record,
  onClose,
  onRecordUpdated,
}: ViewTrainingRecordProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: record.rating || undefined,
      feedback: record.feedback || "",
      suggestion: record.suggestion || ""
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await axios.post("/api/admin/trainings-and-seminars/records/upsert", {
        data: {
          id: record.id,
          ...values,
        },
      });

      toast({
        title: "Record updated successfully",
        variant: "success",
      });

      await onRecordUpdated();
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Failed to update record",
        variant: "danger",
      });
    }
  };

  return (
    <CardView
      onClose={onClose}
      header={
        <div className="flex flex-row items-center justify-between space-x-4 pb-2">
          <UserMail
            name={
              <Typography className="font-semibold">
                {record.dim_training_participants?.trans_employees?.first_name}{" "}
                {record.dim_training_participants?.trans_employees?.last_name}
              </Typography>
            }
            picture={record.dim_training_participants?.trans_employees?.picture || ""}
            email={record.dim_training_participants?.trans_employees?.email || "No Email"}
          />
          {record.rating && (
            <Chip size="md" color="primary" variant="flat">
              Rating: {record.rating}/5
            </Chip>
          )}
        </div>
      }
      body={
        <div className="max-w-[400px] overflow-y-auto">
          {!isEditing ? (
            <div className="space-y-6">
              {/* Program Information */}
              <div>
                <Typography className="text-sm font-medium text-gray-500 mb-2">
                  TRAINING DETAILS
                </Typography>
                <CardTable
                  data={[
                    {
                      label: "Program Name",
                      value: record.dim_training_schedules?.ref_training_programs?.name || "Unnamed Program",
                    },
                    {
                      label: "Type",
                      value: record.dim_training_schedules?.ref_training_programs?.type || "Not Specified",
                    },
                    {
                      label: "Schedule",
                      value: record.dim_training_schedules?.session_timestamp
                        ? dayjs(record.dim_training_schedules.session_timestamp).format("MMM DD, YYYY hh:mm A")
                        : "Not Scheduled",
                    },
                  ]}
                />
              </div>

              {/* Employee Information */}
              <div>
                <Typography className="text-sm font-medium text-gray-500 mb-2">
                  EMPLOYEE DETAILS
                </Typography>
                <CardTable
                  data={[
                    {
                      label: "Department",
                      value: record.dim_training_participants?.trans_employees?.ref_departments?.name || "Not Specified",
                    },
                    {
                      label: "Email",
                      value: record.dim_training_participants?.trans_employees?.email || "No Email",
                    },
                  ]}
                />
              </div>

              {/* Rating & Feedback */}
              <div>
                <Typography className="text-sm font-medium text-gray-500 mb-2">
                  RATING & FEEDBACK
                </Typography>
                <CardTable
                  data={[
                    {
                      label: "Rating",
                      value: record.rating ? `${record.rating}/5` : "Not Rated",
                    },
                  ]}
                />
                {record.feedback && (
                  <div className="mt-2">
                    <Typography className="text-sm font-medium text-gray-500">
                      Feedback
                    </Typography>
                    <div className="bg-gray-50 p-3 rounded-lg mt-1">
                      <Typography className="text-sm text-gray-600">
                        {record.feedback}
                      </Typography>
                    </div>
                  </div>
                )}
                {record.suggestion && (
                  <div className="mt-2">
                    <Typography className="text-sm font-medium text-gray-500">
                      Suggestions
                    </Typography>
                    <div className="bg-gray-50 p-3 rounded-lg mt-1">
                      <Typography className="text-sm text-gray-600">
                        {record.suggestion}
                      </Typography>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Input
                type="number"
                label="Rating"
                placeholder="Enter rating (1-5)"
                min={1}
                max={5}
                defaultValue={record.rating?.toString()}
                onChange={(e) => form.setValue("rating", Number(e.target.value))}
              />

              <Textarea
                label="Feedback"
                placeholder="Enter feedback"
                defaultValue={record.feedback}
                onChange={(e) => form.setValue("feedback", e.target.value)}
              />

              <Textarea
                label="Suggestions"
                placeholder="Enter suggestions for improvement"
                defaultValue={record.suggestion}
                onChange={(e) => form.setValue("suggestion", e.target.value)}
              />

              <div className="flex justify-end gap-2">
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button 
                isLoading 
                color="primary" 
                type="submit">
                  Update Record
                </Button>
              </div>
            </form>
          )}
        </div>
      }
      onDanger={
        !isEditing ? (
          <Button
            color="primary"
            variant="flat"
            onPress={() => setIsEditing(true)}
          >
            {record.rating ? "Update" : "Add"} Rating & Feedback
          </Button>
        ) : null
      }
    />
  );
}
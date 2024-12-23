"use client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Button,
  Select,
  SelectItem,
  Input,
} from "@nextui-org/react";
import { TrainingRecord } from "../types";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import CardView from "@/components/common/card-view/card-view";
import CardTable from "@/components/common/card-view/card-table";
import Typography from "@/components/common/typography/Typography";
import UserMail from "@/components/common/avatar/user-info-mail";

const formSchema = z.object({
  status: z.enum(["enrolled", "ongoing", "completed"]),
  feedback: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ViewRecordProps {
  record: TrainingRecord;
  onClose: () => void;
  onRecordUpdated: () => Promise<void>;
  sortedRecords: TrainingRecord[];
}

export default function ViewRecord({
  record,
  onClose,
  onRecordUpdated,
  sortedRecords,
}: ViewRecordProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: record.status as "enrolled" | "ongoing" | "completed",
      feedback: record.feedback || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await axios.post("/api/admin/trainings-and-seminars/empenrolled/update", {
        id: record.id,
        ...values,
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "ongoing":
        return "primary";
      case "enrolled":
        return "warning";
      default:
        return "default";
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
                {record.trans_employees?.first_name}
                {record.trans_employees?.last_name}
              </Typography>
            }
            picture={record.trans_employees?.picture || ""}
            email={record.trans_employees?.email || "No Email"} // Use the email from trans_employees
          />
          <Chip
            size="md"
            color={getStatusColor(record.status || "unknown")}
            variant="flat"
          >
            {record.status || "Unknown"}
          </Chip>
        </div>
      }
      body={
        <div className="max-w-[400px] overflow-y-auto">
          {!isEditing ? (
            <div className="space-y-6">
              {/* Program Information */}
              <div>
                <Typography className="text-sm font-medium text-gray-500 mb-2">
                  PROGRAM DETAILS
                </Typography>
                <CardTable
                  data={[
                    {
                      label: "Program Name",
                      value:
                        record.ref_training_programs?.name || "Unnamed Program",
                    },
                    {
                      label: "Type",
                      value:
                        record.ref_training_programs?.type || "Not Specified",
                    },
                    {
                      label: "Location",
                      value:
                        record.ref_training_programs?.location ||
                        "Not Specified",
                    },
                    {
                      label: "Instructor",
                      value:
                        record.ref_training_programs?.instructor_name || "N/A",
                    },
                  ]}
                />
              </div>

              {/* Schedule Information */}
              <div>
                <Typography className="text-sm font-medium text-gray-500 mb-2">
                  SCHEDULE
                </Typography>
                <CardTable
                  data={[
                    {
                      label: "Start Date",
                      value: record.ref_training_programs?.start_date
                        ? dayjs(record.ref_training_programs.start_date).format(
                            "MMM DD, YYYY"
                          )
                        : "Not Scheduled",
                    },
                    {
                      label: "End Date",
                      value: record.ref_training_programs?.end_date
                        ? dayjs(record.ref_training_programs.end_date).format(
                            "MMM DD, YYYY"
                          )
                        : "Not Scheduled",
                    },
                    {
                      label: "Duration",
                      value: `${
                        record.ref_training_programs?.hour_duration || 0
                      } hours`,
                    },
                  ]}
                />
              </div>

              {/* Status Information */}
              <div>
                <Typography className="text-sm font-medium text-gray-500 mb-2">
                  STATUS
                </Typography>
                <CardTable
                  data={[
                    {
                      label: "Current Status",
                      value: record.status || "N/A",
                    },
                    {
                      label: "Program Status",
                      value: record.ref_training_programs?.is_active
                        ? "Active"
                        : "Inactive",
                    },
                    {
                      label: "Enrollment Date",
                      value: record.enrollement_date
                        ? dayjs(record.enrollement_date).format("MMM DD, YYYY")
                        : "N/A",
                    },
                  ]}
                />
              </div>

              {/* Feedback Section */}
              {record.feedback && (
                <div>
                  <Typography className="text-sm font-medium text-gray-500 mb-2">
                    FEEDBACK
                  </Typography>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Typography className="text-sm text-gray-600">
                      {record.feedback}
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Select
                label="Status"
                placeholder="Select status"
                defaultSelectedKeys={[record.status]}
                onChange={(e) =>
                  form.setValue(
                    "status",
                    e.target.value as "enrolled" | "ongoing" | "completed"
                  )
                }
                isRequired
              >
                <SelectItem key="enrolled">Enrolled</SelectItem>
                <SelectItem key="ongoing">Ongoing</SelectItem>
                <SelectItem key="completed">Completed</SelectItem>
              </Select>

              <Input
                label="Feedback"
                placeholder="Enter feedback (optional)"
                defaultValue={record.feedback || ""}
                onChange={(e) => form.setValue("feedback", e.target.value)}
              />

              <div className="flex justify-end gap-2">
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button color="primary" type="submit">
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
            Edit Record
          </Button>
        ) : null
      }
    />
  );
}

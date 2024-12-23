// components/admin/trainings-and-seminars/TrainingRecordsTable.tsx
"use client";
import React from "react";
import { useQuery } from "@/services/queries";
import { EnrolledRecord } from "./types";
import DataDisplay from "@/components/common/data-display/data-display";
import { Chip } from "@nextui-org/react";
import { toGMT8 } from "@/lib/utils/toGMT8";
import UserMail from "@/components/common/avatar/user-info-mail";
import { getEmpFullName } from "@/lib/utils/nameFormatter";

export default function TrainingRecordsTable() {
  const { data: records = [], isLoading } = useQuery<EnrolledRecord[]>(
    "/api/admin/trainings-and-seminars/records/list"
  );

  const config = {
    columns: [
      { uid: "employee", name: "Employee", sortable: true },
      { uid: "program", name: "Program", sortable: true },
      { uid: "date", name: "Date", sortable: true },
      { uid: "instructor", name: "Instructor", sortable: true },
      { uid: "status", name: "Status", sortable: true },
      { uid: "feedback", name: "Feedback", sortable: false },
    ],
    rowCell: (record: EnrolledRecord, columnKey: React.Key) => {
      const key = columnKey as string;
      const defaultElement = <div>-</div>;

      switch (key) {
        case "employee":
          return (
            <UserMail
              name={getEmpFullName(record.trans_employees)}
              email={record.trans_employees.email}
              picture={record.trans_employees.picture || ""} // Add default empty string
              description={record.trans_employees.ref_departments?.name || "No Department"}
            />
          );

        case "program":
          return (
            <div>
              <p className="font-medium">{record.ref_training_programs.name}</p>
              <p className="text-small text-gray-500">
                {record.ref_training_programs.location}
              </p>
              <Chip
                color={record.ref_training_programs.type === "programs" ? "primary" : "secondary"}
                variant="flat"
                size="sm"
              >
                {record.ref_training_programs.type}
              </Chip>
            </div>
          );

        case "date":
          return (
            <div className="text-small">
              <p>Start: {toGMT8(record.ref_training_programs.start_date).format("MMM DD, YYYY")}</p>
              <p>End: {toGMT8(record.ref_training_programs.end_date).format("MMM DD, YYYY")}</p>
              <p className="text-gray-500">Duration: {record.ref_training_programs.hour_duration} hours</p>
            </div>
          );

        case "instructor":
          return <p>{record.instructor_name}</p>;

        case "status":
          return (
            <div className="flex flex-col gap-1">
              <Chip
                color={getStatusColor(record.status)}
                variant="flat"
              >
                {record.status}
              </Chip>
              <Chip
                color={record.ref_training_programs.is_active ? "success" : "danger"}
                size="sm"
                variant="flat"
              >
                {record.ref_training_programs.is_active ? "Active" : "Inactive"}
              </Chip>
            </div>
          );

        case "feedback":
          return (
            <div className="max-w-xs truncate" title={record.feedback || ""}>
              <p>{record.feedback || "No feedback"}</p>
            </div>
          );

        default:
          return defaultElement;
      }
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

  const filterItems = [
    {
      category: "Status",
      filtered: ["enrolled", "ongoing", "completed"].map(status => ({
        key: "status",
        value: status,
        name: status.charAt(0).toUpperCase() + status.slice(1),
        uid: status,
      })),
    },
    {
      category: "Type",
      filtered: ["programs", "seminars"].map(type => ({
        key: "ref_training_programs.type",
        value: type,
        name: type.charAt(0).toUpperCase() + type.slice(1),
        uid: type,
      })),
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <DataDisplay
        defaultDisplay="table"
        title="Training Records"
        data={records}
        isLoading={isLoading}
        filterProps={{
          filterItems,
        }}
        onTableDisplay={{
          config,
          layout: "auto"
        }}
        searchProps={{
          searchingItemKey: [
            ["trans_employees", "first_name"],
            ["trans_employees", "last_name"],
            ["ref_training_programs", "name"]
          ]
        }}
      />
    </div>
  );
}
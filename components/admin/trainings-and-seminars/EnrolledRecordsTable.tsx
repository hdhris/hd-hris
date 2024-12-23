"use client";
import React, { useState } from "react";
import { useQuery } from "@/services/queries";
import { Avatar, Chip } from "@nextui-org/react";
import DataDisplay from "@/components/common/data-display/data-display";
import Text from "@/components/Text";
import dayjs from "dayjs";
import { EnrolledRecord } from "./types";
import ViewRecord from "./empenrolled/ViewRecord";
import { toGMT8 } from "@/lib/utils/toGMT8";

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)]">
      <div className="text-center space-y-3">
        <Text className="text-xl font-bold text-gray-700">
          No Enrolled Records Found
        </Text>
        <Text className="text-gray-500">
          There are no Enrolled records at the moment.
        </Text>
        <Text className="text-sm text-gray-400">
          Enrolled employee records will appear here when they are created.
        </Text>
      </div>
    </div>
  );
};

export default function EnrolledRecordsTable() {
  const {
    data: records = [],
    isLoading,
    mutate,
  } = useQuery<EnrolledRecord[]>(
    `/api/admin/trainings-and-seminars/empenrolled/list`
  );
  const [selectedRecord, setSelectedRecord] = useState<EnrolledRecord | null>(
    null
  );

  const handleRecordUpdated = async () => {
    try {
      await mutate();
    } catch (error) {
      console.error("Error updating record data:", error);
    }
  };

  const handleOnSelected = (key: React.Key) => {
    const selected = records?.find((item) => item.id === Number(key));
    setSelectedRecord(selected ?? null);
  };

  const TableConfigurations = {
    columns: [
      { uid: "employee", name: "Employee", sortable: true },
      { uid: "program", name: "Program Name", sortable: true },
      { uid: "type", name: "Type", sortable: true },
      { uid: "instructor", name: "Instructor", sortable: true },
      { uid: "duration", name: "Duration", sortable: true },
      { uid: "dates", name: "Schedule", sortable: true },
      { uid: "status", name: "Status", sortable: true },
    ],
    rowCell: (
      record: EnrolledRecord,
      columnKey: React.Key
    ): React.ReactElement => {
      const key = columnKey as string;

      switch (key) {
        case "employee":
          return (
            <div className="flex items-center gap-4">
              <Avatar
                src={record.trans_employees?.picture || ""}
                alt={`${record.trans_employees?.first_name || "N/A"} ${
                  record.trans_employees?.last_name || "N/A"
                }`}
              />
              <div>
                <p className="font-medium">
                  {`${record.trans_employees?.first_name || "N/A"} ${
                    record.trans_employees?.last_name || "N/A"
                  }`}
                </p>
                <p className="text-small text-gray-500">
                  {record.trans_employees?.ref_departments?.name || "N/A"}
                </p>
              </div>
            </div>
          );
        case "program":
          return (
            <div>
              <p className="font-medium">
                {record.ref_training_programs?.name || "N/A"}
              </p>
              <p className="text-small text-gray-500">
                {record.ref_training_programs?.location || "N/A"}
              </p>
            </div>
          );
        case "type":
          return (
            <Chip
              color={
                record.ref_training_programs?.type === "training"
                  ? "primary"
                  : "secondary"
              }
              variant="flat"
            >
              {record.ref_training_programs?.type || "N/A"}
            </Chip>
          );
        case "instructor":
          return (
            <p>{record.ref_training_programs?.instructor_name || "N/A"}</p>
          );
        case "duration":
          return (
            <p>{record.ref_training_programs?.hour_duration || "N/A"} hours</p>
          );
        case "dates":
          return (
            <div className="text-small">
              <p>
                Start:{" "}
                {record.ref_training_programs?.start_date
                  ? toGMT8(record.ref_training_programs.start_date).format(
                      "MMM DD, YYYY"
                    )
                  : "N/A"}
              </p>
              <p>
                End:{" "}
                {record.ref_training_programs?.end_date
                  ? toGMT8(record.ref_training_programs.end_date).format(
                      "MMM DD, YYYY"
                    )
                  : "N/A"}
              </p>
            </div>
          );
        case "status":
          return (
            <div className="flex flex-col gap-1">
              <Chip
                color={getStatusColor(record.status || "unknown")}
                variant="dot"
              >
                {record.status || "N/A"}
              </Chip>
              <Chip
                color={
                  record.ref_training_programs?.is_active ? "success" : "danger"
                }
                size="sm"
                variant="flat"
              >
                {record.ref_training_programs?.is_active
                  ? "Active"
                  : "Inactive"}
              </Chip>
            </div>
          );
        default:
          return <div>-</div>;
      }
    },
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

  const FilterItems = [
    {
      category: "Type",
      filtered: Array.from(
        new Set(records.map((r) => r.ref_training_programs?.type))
      )
        .filter(Boolean)
        .map((type) => ({
          key: "ref_training_programs.type",  // Changed from just ref_training_programs
          value: type || "",
          name: type || "",
          uid: type || "",
        })),
    },
    {
      category: "Status",
      filtered: Array.from(
        new Set(records.map((r) => r.status))
      )
        .filter(Boolean)
        .map((status) => ({
          key: "status",
          value: status || "",
          name: status || "",
          uid: status || "",
        })),
    }
  ];

  const sortProps = {
    sortItems: [
      { name: "Program", key: "ref_training_programs" as keyof EnrolledRecord },
      { name: "Status", key: "status" as keyof EnrolledRecord },
      {
        name: "Enrollment Date",
        key: "enrollement_date" as keyof EnrolledRecord,
      },
    ],
  };

  if (isLoading) {
    return (
      <section className="w-full h-full flex gap-4 overflow-hidden">
        <DataDisplay
          defaultDisplay="table"
          title="Training Records"
          data={[]}
          isLoading={true}
          onTableDisplay={{
            config: TableConfigurations,
            layout: "auto",
          }}
        />
      </section>
    );
  }

  if (!records || records.length === 0) {
    return <EmptyState />;
  }

  return (
    <section className="w-full h-full flex gap-4 overflow-hidden">
      <DataDisplay
        defaultDisplay="table"
        title="Training Records"
        data={records}
        filterProps={{
          filterItems: FilterItems,
        }}
        isLoading={false}
        onTableDisplay={{
          config: TableConfigurations,
          layout: "auto",
          onRowAction: handleOnSelected,
        }}
        paginationProps={{
          data_length: records.length,
        }}
        searchProps={{
          searchingItemKey: [
            "trans_employees",
            "ref_training_programs",
            "status",
          ],
        }}
        sortProps={sortProps}
        // In your TrainingRecordsTable component
        onView={
          selectedRecord && (
            <ViewRecord
              record={selectedRecord}
              onClose={() => setSelectedRecord(null)}
              onRecordUpdated={handleRecordUpdated}
              sortedRecords={records}
            />
          )
        }
      />
    </section>
  );
}

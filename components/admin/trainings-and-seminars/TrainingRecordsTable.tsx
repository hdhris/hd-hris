"use client";
import React, { useState } from "react";
import { useQuery } from "@/services/queries";
import { TrainingRecord } from "./types";
import { Avatar, Button, Chip } from "@nextui-org/react";
import DataDisplay from "@/components/common/data-display/data-display";
import { toGMT8 } from "@/lib/utils/toGMT8";
import ViewTrainingRecord from "./ViewTrainingRecord";
import ManageRecord from "./ManageRecords";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";

const TrainingRecordsTable: React.FC = () => {
  const {
    data: records = [],
    isLoading,
    mutate,
  } = useQuery<TrainingRecord[]>(
    "/api/admin/trainings-and-seminars/records/list"
  );
  const [selectedRecord, setSelectedRecord] = useState<TrainingRecord | null>(
    null
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleRecordUpdated = async () => {
    try {
      await mutate();
    } catch (error) {
      console.error("Error updating record data:", error);
    }
  };

  // Set the create button in the navigation
  SetNavEndContent(() => (
    <div className="flex items-center gap-4">
      <Button color="primary" onPress={() => setIsCreateOpen(true)}>
        Create Record
      </Button>
    </div>
  ));

  const handleOnSelected = (key: React.Key) => {
    const selected = records?.find((item) => item.id === Number(key));
    setSelectedRecord(selected ?? null);
  };

  const searchKeys: Array<keyof TrainingRecord> = [
    "dim_training_participants",
    "dim_training_schedules",
  ];

  const TableConfigurations = {
    columns: [
      { uid: "participant", name: "Participant", sortable: true },
      { uid: "program", name: "Program", sortable: true },
      { uid: "schedule", name: "Schedule", sortable: true },
      { uid: "rating", name: "Rating", sortable: true },
    ],
    rowCell: (record: TrainingRecord, columnKey: React.Key) => {
      switch (columnKey) {
        case "participant":
          return (
            <div className="flex items-center gap-4">
              <Avatar
                src={
                  record.dim_training_participants?.trans_employees?.picture ||
                  ""
                }
                alt={`${
                  record.dim_training_participants?.trans_employees
                    ?.first_name || "N/A"
                } ${
                  record.dim_training_participants?.trans_employees
                    ?.last_name || "N/A"
                }`}
              />
              <div>
                <p className="font-medium">
                  {`${
                    record.dim_training_participants?.trans_employees
                      ?.first_name || "N/A"
                  } ${
                    record.dim_training_participants?.trans_employees
                      ?.last_name || "N/A"
                  }`}
                </p>
                <p className="text-small text-gray-500">
                  {record.dim_training_participants?.trans_employees
                    ?.ref_departments?.name || "N/A"}
                </p>
              </div>
            </div>
          );
        case "program":
          return (
            <div>
              <p className="font-medium">
                {record.dim_training_schedules?.ref_training_programs?.name ||
                  "N/A"}
              </p>
              <Chip color="primary" variant="flat" size="sm">
                {record.dim_training_schedules?.ref_training_programs?.type ||
                  "N/A"}
              </Chip>
            </div>
          );
        case "schedule":
          return (
            <p>
              {record.dim_training_schedules?.session_timestamp
                ? toGMT8(
                    record.dim_training_schedules.session_timestamp
                  ).format("MMM DD, YYYY hh:mm A")
                : "N/A"}
            </p>
          );
        case "rating":
          return record.rating ? (
            <Chip color="primary" variant="flat">
              {record.rating}/5
            </Chip>
          ) : (
            <Chip color="warning" variant="flat">
              Not Rated
            </Chip>
          );
        default:
          return <div>-</div>;
      }
    },
  };

  const FilterItems = [
    {
      category: "Type",
      filtered: Array.from(
        new Set(
          records.map(
            (r) => r.dim_training_schedules?.ref_training_programs?.type
          )
        )
      )
        .filter(Boolean)
        .map((type) => ({
          key: "dim_training_schedules.ref_training_programs.type",
          value: type || "",
          name: type || "",
          uid: type || "",
        })),
    },
  ];

  return (
    <div className="h-[calc(100vh-150px)] overflow-hidden">
      <DataDisplay
        defaultDisplay="table"
        title="Training Records"
        data={records}
        filterProps={{
          filterItems: FilterItems,
        }}
        isLoading={isLoading}
        onTableDisplay={{
          config: TableConfigurations,
          className: "h-full overflow-auto",
          layout: "auto",
          onRowAction: handleOnSelected,
        }}
        paginationProps={{
          data_length: records.length,
        }}
        searchProps={{
          searchingItemKey: searchKeys,
        }}
        onView={
          selectedRecord && (
            <ViewTrainingRecord
              record={selectedRecord}
              onClose={() => setSelectedRecord(null)}
              onRecordUpdated={handleRecordUpdated}
            />
          )
        }
      />

      <ManageRecord
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onUpdated={handleRecordUpdated}
      />
    </div>
  );
};

export default TrainingRecordsTable;

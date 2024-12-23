// components/admin/trainings-and-seminars/ScheduleTable.tsx
"use client";
import React, { useState } from "react";
import { useQuery } from "@/services/queries";
import { Schedule } from "./types";
import { Button, Chip } from "@nextui-org/react";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import SearchFilter from "@/components/common/filter/SearchFilter";
import TableData from "@/components/tabledata/TableData";
import showDialog from "@/lib/utils/confirmDialog";
import { toGMT8 } from "@/lib/utils/toGMT8";
import ManageSchedule from "./ManageSchedule";
import axios from "axios";
import { TableConfigProps } from "@/types/table/TableDataTypes";

export default function ScheduleTable() {
  const {
    data: schedules = [],
    isLoading,
    mutate,
  } = useQuery<Schedule[]>("/api/admin/trainings-and-seminars/schedules/list");
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number>();

  const config: TableConfigProps<Schedule> = {
    columns: [
      { uid: "program", name: "Program", sortable: true },
      { uid: "session", name: "Session", sortable: true },
      { uid: "location", name: "Location", sortable: true },
      { uid: "duration", name: "Duration", sortable: true },
      { uid: "action", name: "Action", sortable: false },
    ],
    rowCell: (item: Schedule, columnKey: React.Key) => {
      switch (columnKey) {
        case "program":
          return (
            <div>
              <p className="font-medium">{item.ref_training_programs?.name}</p>
              <Chip size="sm" color="primary">
                {item.ref_training_programs?.type}
              </Chip>
            </div>
          );
        case "session":
          return (
            <div className="text-small">
              <p>
                Date:{" "}
                {toGMT8(item.session_timestamp || "").format("MMM DD, YYYY")}
              </p>
              <p>
                Time: {toGMT8(item.session_timestamp || "").format("hh:mm A")}
              </p>
            </div>
          );
        case "location":
          return <div>{item.location}</div>;
        case "duration":
          return <div>{item.hour_duration} hours</div>;
        case "action":
          return (
            <TableActionButton
              name={item.ref_training_programs?.name || ""}
              onEdit={() => handleEdit(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          );
        default:
          return <div>-</div>;
      }
    },
  };

  const handleEdit = (id: number) => {
    setSelectedId(id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const result = await showDialog({
        title: "Delete Schedule",
        message: "Are you sure you want to delete this schedule?",
        preferredAnswer: "no",
      });

      if (result === "yes") {
        await axios.post("/api/admin/trainings-and-seminars/schedules/delete", {
          id,
        });
        toast({
          description: "Schedule deleted successfully!",
          variant: "success",
        });
        mutate();
      }
    } catch (error) {
      toast({
        title: "Error deleting schedule",
        variant: "danger",
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between mb-4">
        <SearchFilter
          searchConfig={[
            { key: "location" as keyof Schedule, label: "Location" },
            { key: "program_id" as keyof Schedule, label: "Program" },
          ]}
          items={schedules}
          setResults={setFilteredSchedules}
        />
        <Button
          color="primary"
          onPress={() => {
            setSelectedId(undefined);
            setIsOpen(true);
          }}
        >
          Create Schedule
        </Button>
      </div>

      <TableData
        config={config}
        items={filteredSchedules}
        isLoading={isLoading}
        title="Training Schedules"
      />

      <ManageSchedule
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSelectedId(undefined);
        }}
        scheduleId={selectedId}
        onUpdated={mutate}
      />
    </div>
  );
}

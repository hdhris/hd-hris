"use client";

import { useQuery } from "@/services/queries";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Button, Chip, Select, SelectItem } from "@nextui-org/react";
import { Key, useState, useMemo, useCallback } from "react";
import SearchFilter from "@/components/common/filter/SearchFilter";
import TableData from "@/components/tabledata/TableData";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { TrainingRecord } from "./types";

export default function TrainingRecordsTable() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { data: records = [], isLoading } = useQuery<TrainingRecord[]>(
    `/api/admin/trainings-and-seminars/emprecords/list`
  );

  const filterRecords = useCallback((
    records: TrainingRecord[], 
    type: string = "all", 
    status: string = "all"
  ) => {
    return records.filter((record) => {
      const typeMatch =
        type === "all" ||
        record.ref_training_programs.type === type;
      const statusMatch =
        status === "all" ||
        (status === "active" &&
          record.ref_training_programs.is_active) ||
        (status === "inactive" &&
          !record.ref_training_programs.is_active);
      return typeMatch && statusMatch;
    });
  }, []);

  const filteredRecords = useMemo(() => 
    filterRecords(records, selectedType, selectedStatus), 
    [records, selectedType, selectedStatus, filterRecords]
  );

  const config: TableConfigProps<TrainingRecord> = {
    columns: [
      { uid: "employee", name: "Employee", sortable: true },
      { uid: "program", name: "Program Name", sortable: true },
      { uid: "type", name: "Type", sortable: true },
      { uid: "instructor", name: "Instructor", sortable: true },
      { uid: "duration", name: "Duration", sortable: true },
      { uid: "dates", name: "Schedule", sortable: true },
      { uid: "status", name: "Status", sortable: true },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "employee":
          return (
            <div>
              <p className="font-medium">
                {`${item.trans_employees?.first_name || "N/A"} ${
                  item.trans_employees?.last_name || "N/A"
                }`}
              </p>
              <p className="text-small text-gray-500">
                {item.trans_employees?.ref_departments?.name || "N/A"}
              </p>
            </div>
          );
        case "program":
          return (
            <div>
              <p className="font-medium">
                {item.ref_training_programs?.name || "N/A"}
              </p>
              <p className="text-small text-gray-500">
                {item.ref_training_programs?.location || "N/A"}
              </p>
            </div>
          );
        case "type":
          return (
            <Chip
              color={
                item.ref_training_programs?.type === "training"
                  ? "primary"
                  : "secondary"
              }
              variant="flat"
            >
              {item.ref_training_programs?.type || "N/A"}
            </Chip>
          );
        case "instructor":
          return (
            <p>
              {`${item.ref_training_programs?.instructor_name || "N/A"}`}
            </p>
          );
        case "duration":
          return (
            <p>{item.ref_training_programs?.hour_duration || "N/A"} hours</p>
          );
        case "dates":
          return (
            <div className="text-small">
              <p>
                Start:{" "}
                {item.ref_training_programs?.start_date
                  ? dayjs(item.ref_training_programs.start_date).format(
                      "MMM DD, YYYY"
                    )
                  : "N/A"}
              </p>
              <p>
                End:{" "}
                {item.ref_training_programs?.end_date
                  ? dayjs(item.ref_training_programs.end_date).format(
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
                color={getStatusColor(item.status || "unknown")}
                variant="dot"
              >
                {item.status || "N/A"}
              </Chip>
              <Chip
                color={
                  item.ref_training_programs?.is_active ? "success" : "danger"
                }
                size="sm"
                variant="flat"
              >
                {item.ref_training_programs?.is_active ? "Active" : "Inactive"}
              </Chip>
            </div>
          );
        default:
          return <></>;
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

  const handleRowAction = (key: Key) => {
    router.push(`/trainings-and-seminars/emprecords/view/${key}`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <Select
            label="Type"
            selectedKeys={[selectedType]}
            onChange={(e) => {
              setSelectedType(e.target.value);
            }}
            className="w-32"
          >
            <SelectItem key="all" value="all">
              All
            </SelectItem>
            <SelectItem key="training" value="training">
              Training
            </SelectItem>
            <SelectItem key="seminars" value="seminars">
              Seminars
            </SelectItem>
          </Select>
          <Select
            label="Status"
            selectedKeys={[selectedStatus]}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
            }}
            className="w-32"
          >
            <SelectItem key="all" value="all">
              All
            </SelectItem>
            <SelectItem key="active" value="active">
              Active
            </SelectItem>
            <SelectItem key="inactive" value="inactive">
              Inactive
            </SelectItem>
          </Select>
        </div>
        <SearchFilter
          searchConfig={[
            { key: ["trans_employees", "first_name"], label: "Employee Name" },
            { key: ["ref_training_programs", "name"], label: "Program Name" },
          ]}
          items={records}
          setResults={() => {}} // Placeholder, as filtering is now handled internally
        />
      </div>
      <TableData
        config={config}
        items={filteredRecords}
        isLoading={isLoading}
        title="Training & Seminar Records"
        onRowAction={handleRowAction}
      />
    </div>
  );
}
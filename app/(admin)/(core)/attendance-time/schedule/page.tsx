"use client";
import { BatchCard } from "@/components/admin/attendance-time/schedule/batchCard";
import ScheduleModal from "@/components/admin/attendance-time/schedule/create-edit-modal";
import { cardGetRandomColor } from "@/components/admin/attendance-time/schedule/scripts";
import { scheduleTable } from "@/components/admin/attendance-time/schedule/table";
import { FilterItemsProps } from "@/components/common/filter/FilterItems";
import SearchFilter from "@/components/common/filter/SearchFilter";
import { SearchItemsProps } from "@/components/common/filter/SearchItems";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import { toast } from "@/components/ui/use-toast";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import showDialog from "@/lib/utils/confirmDialog";
import { useQuery } from "@/services/queries";
import {
  BatchSchedule,
  EmployeeSchedule,
  Schedules,
} from "@/types/attendance-time/AttendanceTypes";
import { Button, Spinner } from "@nextui-org/react";
import axios from "axios";
import { capitalize } from "lodash";
import React, { useMemo, useState } from "react";

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const searchConfig: SearchItemsProps<EmployeeSchedule>[] = [
  {
    key: ["trans_employees", "last_name"],
    label: "Last Name",
  },
  {
    key: ["trans_employees", "first_name"],
    label: "First Name",
  },
  {
    key: ["trans_employees", "middle_name"],
    label: "Middle Name",
  },
];
const filterConfig: FilterItemsProps<EmployeeSchedule>[] = [
  {
    filter: days.map((day) => ({
      label: capitalize(day),
      value: (item: EmployeeSchedule) => item.days_json.includes(day),
    })),
    key: "days_json",
    sectionName: "Day of week",
    selectionMode: "multipleAND",
  },
];

function Page() {
  const [hoveredBatchId, setHoveredBatchId] = useState<number | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const { data, isLoading } = useQuery<Schedules>(
    "/api/admin/attendance-time/schedule",
    { refreshInterval: 3000 }
  );
  const [tableData, setTableData] = useState<EmployeeSchedule[]>();
  const [isVisible, setVisible] = useState(false);
  const [isPending, setPending] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchSchedule | null>(
    null
  );
  SetNavEndContent(() => {
    return (
      <>
        <SearchFilter
          items={data?.emp_sched || []}
          filterConfig={filterConfig}
          searchConfig={searchConfig}
          setResults={setTableData}
          isLoading={isLoading}
        />
      </>
    );
  });

  const handleDelete = async (id: Number | undefined) => {
    try {
      const result = await showDialog({
        title: "Confirm Delete",
        message: `Are you sure you want to delete schedule?`,
        preferredAnswer: "no",
      });
      if (result === "yes") {
        await axios.post(
          "/api/admin/attendance-time/schedule/delete-schedule",
          {
            id: id,
          }
        );
        toast({
          title: "Deleted",
          description: "Schedule deleted successfully!",
          variant: "default",
        });

        setSelectedBatch(null);
        setVisible(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error: " + error,
        variant: "danger",
      });
    }
  };
  const handleSubmit = async (batch: BatchSchedule) => {
    setPending(true);
    try {
      if (batch.id > 0) {
        // Edit
        await axios.post("/api/admin/attendance-time/schedule/edit-schedule", {
          id: batch.id,
          name: batch.name,
          clock_in: batch.clock_in,
          clock_out: batch.clock_out,
          is_active: batch.is_active,
          break_min: batch.break_min,
        });
        toast({
          title: "Updated",
          description: "Schedule updated successfully!",
          variant: "success",
        });
      } else {
        // Create
        await axios.post("/api/admin/attendance-time/schedule/add-schedule", {
          name: batch.name,
          clock_in: batch.clock_in,
          clock_out: batch.clock_out,
          is_active: batch.is_active,
          break_min: batch.break_min,
        });
        toast({
          title: "Created",
          description: "Schedule created successfully!",
          variant: "success",
        });
      }
      setVisible(false);
    } catch (error) {
      toast({
        title: "Error " + (batch.id > 0 ? "updating" : "creating"),
        description: "Error: " + error,
        variant: "danger",
      });
    }
    setPending(false);
  };

  const table = useMemo(() => {
    if (data && data.batch) {
      return scheduleTable(
        days,
        tableData || [],
        data.batch || [],
        hoveredRowId,
        hoveredBatchId,
        setHoveredRowId
      );
    }
    return (
      <Spinner className="w-full h-full" label="Loading..." color="primary" />
    );
  }, [tableData, data, hoveredRowId, hoveredBatchId]);

  if (isLoading || !data) {
    return (
      <Spinner
        className="w-full h-full"
        label="Please wait..."
        color="primary"
      />
    );
  }
  return (
    <>
      <div className="flex min-w-[1230px] h-full">
        {/* left side */}
        <div className="flex flex-col w-fit h-full">
          <div className="flex flex-col gap-2 overflow-auto flex-1 space-y-2 p-2">
            {data.batch?.map((item, index) => (
              <BatchCard
                key={item.id}
                item={item}
                color={cardGetRandomColor(index)}
                isHovered={hoveredBatchId === item.id}
                isSelected={
                  data.emp_sched.find((emp) => emp.id === hoveredRowId)
                    ?.batch_id === item.id
                }
                setHoveredBatchId={setHoveredBatchId}
                setSelectedBatch={setSelectedBatch}
                setVisible={setVisible}
              />
            ))}
          </div>
          <Button
            onPress={() => {
              setSelectedBatch(null);
              setVisible(true);
            }}
            {...uniformStyle()}
          >
            Add Schedule
          </Button>
        </div>
        {/* right side */}
        {table}
      </div>

      <ScheduleModal
        onSave={handleSubmit}
        selectedSchedule={selectedBatch}
        visible={isVisible}
        pending={isPending}
        onClose={() => setVisible(false)}
        onDelete={handleDelete}
      />
    </>
  );
}

export default Page;

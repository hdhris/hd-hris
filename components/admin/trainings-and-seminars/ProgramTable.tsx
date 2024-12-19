// components/admin/trainings-and-seminars/ProgramTable.tsx
"use client";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import { useQuery } from "@/services/queries";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Button, Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { FilterItemsProps } from "@/components/common/filter/FilterItems";
import axios from "axios";
import TableData from "@/components/tabledata/TableData";
import showDialog from "@/lib/utils/confirmDialog";
import React, { useState } from "react";
import SearchFilter from "@/components/common/filter/SearchFilter";
import { mutate } from "swr";
import { toGMT8 } from "@/lib/utils/toGMT8";

interface Program {
  id: number;
  name: string;
  description: string;
  hour_duration: number;
  location: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  is_active: boolean;
  type: string;
  dim_training_participants: any[];
  instructor_name: string;
}

export default function ProgramTable() {
  const router = useRouter();
  const { data, isLoading, mutate } = useQuery<Program[]>(
    "/api/admin/trainings-and-seminars/empprograms/list"
  );
  const [programs, setPrograms] = useState<Program[]>([]);

  const config: TableConfigProps<Program> = {
    columns: [
      { uid: "name", name: "Program Name", sortable: true },
      { uid: "trainer", name: "Trainer", sortable: true },
      { uid: "participants", name: "Participants", sortable: true },
      { uid: "duration", name: "Duration", sortable: true },
      { uid: "dates", name: "Schedule", sortable: true },
      { uid: "status", name: "Status", sortable: true },
      { uid: "action", name: "Action", sortable: false },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return (
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-small text-gray-500">{item.location}</p>
            </div>
          );
        case "trainer":
          return (
            <p className="text-small text-gray-500">
              {item.instructor_name || "No Trainer Assigned"}
            </p>
          );
        case "participants":
          return (
            <Chip color="primary" variant="bordered">
              {item.dim_training_participants.length} / {item.max_participants}
            </Chip>
          );
        case "duration":
          return <p>{item.hour_duration} hours</p>;
        case "dates":
          return (
            <div className="text-small">
              <p>Start: {toGMT8(item.start_date).format("MMM DD, YYYY")}</p>
              <p>End: {toGMT8(item.end_date).format("MMM DD, YYYY")}</p>
            </div>
          );
        case "status":
          return item.is_active ? (
            <Chip color="success" variant="dot">
              Active
            </Chip>
          ) : (
            <Chip color="danger" variant="dot">
              Inactive
            </Chip>
          );
        case "action":
          return (
            <TableActionButton
              name={item.name}
              onEdit={() =>
                router.push(
                  `/trainings-and-seminars/empprograms/manage/${item.id}`
                )
              }
              onDelete={() => handleDelete(item.id, item.name)}
            />
          );
        default:
          return <></>;
      }
    },
  };

  const filterItems: FilterItemsProps<Program>[] = [
    {
      filter: [
        { label: "Active", value: true },
        { label: "Inactive", value: false },
      ],
      key: "is_active",
      sectionName: "Status",
    },
  ];

  const handleDelete = async (id: number, name: string) => {
    try {
      const result = await showDialog({
        title: "Delete Program",
        message: `Are you sure you want to delete '${name}'?`,
        preferredAnswer: "no",
      });
      if (result === "yes") {
        await axios.post(
          "/api/admin/trainings-and-seminars/empprograms/delete",
          { id }
        );

        toast({
          description: "Program deleted successfully!",
          variant: "success",
        });
        mutate();
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: String(error),
        variant: "danger",
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <SearchFilter
          searchConfig={[
            { key: "name", label: "Name" },
            { key: "location", label: "Location" },
          ]}
          filterConfig={filterItems}
          items={data || []}
          setResults={setPrograms}
        />
        <Button
          {...uniformStyle()}
          className="w-fit"
          onClick={() =>
            router.push("/trainings-and-seminars/empprograms/manage")
          }
        >
          Create Program
        </Button>
      </div>
      <TableData
        config={config}
        items={programs || []}
        isLoading={isLoading}
        title="Training Programs"
        selectionMode="single"
      />
    </div>
  );
}

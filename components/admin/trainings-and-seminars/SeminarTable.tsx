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

interface Seminar {
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

export default function SeminarTable() {
  const router = useRouter();
  const { data, isLoading, mutate } = useQuery<Seminar[]>(
    "/api/admin/trainings-and-seminars/allseminars/list"
  );
  const [programs, setSeminars] = useState<Seminar[]>([]);

  const config: TableConfigProps<Seminar> = {
    columns: [
      { uid: "name", name: "Seminar Name", sortable: true },
      { uid: "presenter", name: "Presenter", sortable: true },
      { uid: "attendees", name: "Attendees", sortable: true },
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
        case "presenter":
          return (
            <p className="text-small text-gray-500">
              {item.instructor_name || "Unknown Presenter"}
            </p>
          );
        case "attendees":
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
              <p>Start: {new Date(item.start_date).toLocaleDateString()}</p>
              <p>End: {new Date(item.end_date).toLocaleDateString()}</p>
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
                  `/trainings-and-seminars/allseminars/manage/${item.id}`
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

  const filterItems: FilterItemsProps<Seminar>[] = [
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
        title: "Delete Seminar",
        message: `Are you sure you want to delete '${name}'?`,
        preferredAnswer: "no",
      });
      if (result === "yes") {
        await axios.post(
          "/api/admin/trainings-and-seminars/allseminars/delete",
          { id }
        );
        toast({
          description: "Seminar deleted successfully!",
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
          setResults={setSeminars}
        />
        <Button
          {...uniformStyle()}
          className="w-fit"
          onClick={() =>
            router.push("/trainings-and-seminars/allseminars/manage")
          }
        >
          Create Seminar
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

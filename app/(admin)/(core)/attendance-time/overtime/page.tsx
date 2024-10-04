"use client";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import { useOvertimes } from "@/services/queries";
import { FilterProps } from "@/types/table/default_config";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Button, Chip, Selection, User } from "@nextui-org/react";
import { useRouter } from "next/dist/client/components/navigation";
import axios from "axios";
import TableData from "@/components/tabledata/TableData";
import showDialog from "@/lib/utils/confirmDialog";
import React, { useEffect, useState } from "react";
import { parseBoolean } from "@/lib/utils/parser/parseClass";
import {
  OvertimeEntry,
} from "@/types/attendance-time/OvertimeType";
import dayjs from "dayjs";

const handleDelete = async (id: Number, name: string) => {
  try {
    const result = await showDialog(
      "Confirm Delete",
      `Are you sure you want to delete '${name}' ?`,
      false
    );
    if (result === "yes") {
      await axios.post("/api/admin/payroll/payhead/delete", {
        id: id,
      });
      toast({
        title: "Deleted",
        description: "Earning deleted successfully!",
        variant: "warning",
      });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Error: " + error,
      variant: "danger",
    });
  }
};

const statusColorMap: Record<string, "danger" | "success" | "warning"> = {
  pending: "danger",
  approved: "success",
  denied: "danger",
};

function Page() {
  const { data, isLoading } = useOvertimes();
  const router = useRouter();

  const config: TableConfigProps<OvertimeEntry> = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "date", name: "Date", sortable: true },
      { uid: "time_in", name: "Time In", sortable: true },
      { uid: "time_out", name: "Time Out", sortable: true },
      { uid: "minutes", name: "Minutes", sortable: true },
      { uid: "status", name: "Status", sortable: true },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return (
            <User
              avatarProps={{
                radius: "full",
                size: "sm",
                src: item.trans_employees_overtimes.picture,
              }}
              classNames={{
                description: "text-default-500",
              }}
              description={item.trans_employees_overtimes.email}
              name={item.full_name}
            >
              {item.trans_employees_overtimes.email}
            </User>
          );
        case "date":
          return (<div>{dayjs(item.date).format('YYYY-MM-DD')}</div>) //'yyyy-MM-dd'
        case "time_in":
          return (<div>{dayjs(item.clock_in).format('h:mm a')}</div>) //'h:mm a'
        case "time_out":
          return (<div>{dayjs(item.clock_out).format('h:mm a')}</div>) //'h:mm a'
        case "minutes":
          return (<div>{item.requested_mins} min</div>) //'h:mm a'
        case "status":
          return(<Chip className="capitalize" color={statusColorMap[item.status]} variant="dot">
            {item.status}
          </Chip>)
        default:
          return <></>;
      }
    },
  };
  const filterItems: FilterProps[] = [
    {
      filtered: [
        { name: "Active", uid: "active_true" },
        { name: "Inactive", uid: "active_false" },
      ],
      category: "Status",
    },
    {
      filtered: [
        { name: "Probationary", uid: "mandatory_prob" },
        { name: "Regular", uid: "mandatory_reg" },
        { name: "Non-mandatory", uid: "mandatory_false" },
      ],
      category: "Mandatory",
    },
  ];
  // const filterConfig = (keys: Selection) => {
  //   let filteredItems: OvertimeEntry[] = [...overtime!];

  //   if (keys !== "all" && keys.size > 0) {
  //     Array.from(keys).forEach((key) => {
  //       const [uid, value] = (key as string).split("_");
  //       filteredItems = filteredItems.filter((items) => {
  //         if (uid.includes("active")) {
  //           return items.is_active === parseBoolean(value);
  //         } else if (uid.includes("mandatory")) {
  //           if (value === "prob") {
  //             return items.affected_json?.mandatory.probationary === true;
  //           } else if (value === "reg") {
  //             return items.affected_json?.mandatory.regular === true;
  //           } else if (value === "false") {
  //             return (
  //               items.affected_json?.mandatory.regular === false &&
  //               items.affected_json?.mandatory.probationary === false
  //             );
  //           }
  //         }
  //       });
  //     });
  //   }

  //   return filteredItems;
  // };
  return (
    <div className="h-fit-navlayout">
      <TableData
        config={config}
        items={data || []}
        isLoading={isLoading}
        searchingItemKey={["full_name"]}
        // filterItems={filterItems}
        // filterConfig={filterConfig}
        counterName="Overtime Requests"
        className="flex-1 h-full"
        removeWrapper
        isStriped
        isHeaderSticky
        endContent={() => (
          <Button
            color="primary"
            className=" w-fit"
            // onClick={() => router.push("/payroll/earnings/create")}
          >
            File Overtime
          </Button>
        )}
      />
    </div>
  );
}

export default Page;

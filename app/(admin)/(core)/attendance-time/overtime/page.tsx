"use client";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import { useOvertimes } from "@/services/queries";
import { FilterProps } from "@/types/table/default_config";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import {
  Button,
  Chip,
  cn,
  DropdownProps,
  Selection,
  User,
} from "@nextui-org/react";
import { useRouter } from "next/dist/client/components/navigation";
import axios from "axios";
import TableData from "@/components/tabledata/TableData";
import showDialog from "@/lib/utils/confirmDialog";
import React, { useEffect, useState } from "react";
import { parseBoolean } from "@/lib/utils/parser/parseClass";
import { OvertimeEntry } from "@/types/attendance-time/OvertimeType";
import dayjs from "dayjs";
import GridList from "@/components/common/grid/GridList";
import GridCard from "@/components/common/grid/GridCard";

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

// const statusColorMap: Record<string, "danger" | "success" | "warning"> = {
//   pending: "danger",
//   approved: "success",
//   denied: "danger",
// };
const statusColorMap = {
  pending: "text-danger-500",
  approved: "text-success-500",
  denied: "text-danger-500",
};

function Page() {
  const { data, isLoading } = useOvertimes();
  return (
    <GridList items={data || []}>
      {(item: OvertimeEntry) => (
        <GridCard
          name={item.full_name}
          titleSize="md"
          items={[
            {
              column: 'date',
              label: "Date",
              value: dayjs(item.date).format('YYYY-MM-DD'),
            },
            {
              column: 'clock_in',
              label: "Time In",
              value: dayjs(item.clock_in).format("h:mm a"),
            },
            {
              column: 'clock_in',
              label: "Time Out",
              value: dayjs(item.clock_out).format("h:mm a"),
            },
            {
              column: 'minutes',
              label: "Requested",
              value: dayjs(item.requested_mins).format("h:mm a"),
            },
            {
              column: 'status',
              label: 'Status',
              value: <span className={cn('capitalize',statusColorMap[item.status])}>{item.status}</span>,
            }
          ]}
          pulseVariant={
            item.status === "pending" ? "gray" :
            item.status === "approved" ? "success" : "danger"
           }
        />
      )}
    </GridList>
  );
}

export default Page;

"use client";
import { toast } from "@/components/ui/use-toast";
import { useOvertimes } from "@/services/queries";
import axios from "axios";
import showDialog from "@/lib/utils/confirmDialog";
import React, { useContext, useEffect, useState } from "react";
import { parseBoolean } from "@/lib/utils/parser/parseClass";
import { OvertimeEntry } from "@/types/attendance-time/OvertimeType";
import dayjs from "dayjs";
import GridList from "@/components/common/grid/GridList";
import GridCard, { GridItemProps } from "@/components/common/grid/GridCard";
import { Button, Link } from "@nextui-org/react";
import { Time } from "@/helper/timeParse/datetimeParse";
import { setNavEndContent } from "@/components/common/tabs/NavigationTabs";

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

const statusColorMap: Record<string, "danger" | "success" | "gray"> = {
  pending: "gray",
  approved: "success",
  denied: "danger",
};

// const statusColorMap = {
//   pending: "text-danger-500",
//   approved: "text-success-500",
//   denied: "text-danger-500",
// };

function items(item: OvertimeEntry): GridItemProps[] {
  return [
    {
      column: "date",
      label: "Date",
      value: new Date(item.date),
    },
    {
      column: "clock_in",
      label: "Time In",
      value: new Time(item.clock_in),
    },
    {
      column: "clock_in",
      label: "Time Out",
      value: new Time(item.clock_out),
    },
    {
      column: "minutes",
      label: "Requested",
      value: item.rendered_mins,
    },
    {
      column: "checkbox",
      label: "Greater than 40 mins",
      value: item.rendered_mins > 30,
    },
  ];
}

function Page() {
  setNavEndContent(
    <Link href="/attendance-time/overtime/create">
      <Button color="primary">
        File Overtime
      </Button>
    </Link>
  );

  const { data, isLoading } = useOvertimes();
  return (
    <div className="h-full overflow-auto flex flex-col">
      <GridList items={data || []}>
        {(item: OvertimeEntry) => (
          <GridCard
            name={item.full_name}
            size="sm"
            wide
            items={items(item)}
            avatarProps={{ src: item.trans_employees_overtimes.picture }}
            status={{ label: item.status, color: statusColorMap[item.status] }}
            deadPulse={["denied", "pending"].includes(item.status)}
            bottomShadow={false}
          />
        )}
      </GridList>
    </div>
  );
}

export default Page;

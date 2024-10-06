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
import { Button, Chip, Link, User } from "@nextui-org/react";
import { Time } from "@/helper/timeParse/datetimeParse";
import { setNavEndContent } from "@/components/common/tabs/NavigationTabs";
import TableData from "@/components/tabledata/TableData";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { calculateShiftLength } from "@/lib/utils/timeFormatter";
import { LuCheck, LuX } from "react-icons/lu";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { IoMdCloseCircle } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";

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

const statusColorMap: Record<string, "danger" | "success" | "default"> = {
  pending: "default",
  approved: "success",
  denied: "danger",
};

// const statusColorMap = {
//   pending: "text-danger-500",
//   approved: "text-success-500",
//   denied: "text-danger-500",
// };

// function items(item: OvertimeEntry): GridItemProps[] {
//   return [
//     {
//       column: "date",
//       label: "Date",
//       value: new Date(item.date),
//     },
//     {
//       column: "clock_in",
//       label: "Time In",
//       value: new Time(item.clock_in),
//     },
//     {
//       column: "clock_in",
//       label: "Time Out",
//       value: new Time(item.clock_out),
//     },
//     {
//       column: "minutes",
//       label: "Requested",
//       value: item.rendered_mins,
//     },
//     {
//       column: "checkbox",
//       label: "Greater than 40 mins",
//       value: item.rendered_mins > 30,
//     },
//   ];
// }

function Page() {
  setNavEndContent(
    <Link href="/attendance-time/overtime/create">
      <Button {...uniformStyle()}>File Overtime</Button>
    </Link>
  );

  const { data, isLoading } = useOvertimes();
  const config: TableConfigProps<OvertimeEntry> = {
    columns: [
      { uid: "request_date", name: "Request Date", sortable: true },
      { uid: "overtime_date", name: "Overtime Date", sortable: true },
      { uid: "name", name: "Name", sortable: true },
      { uid: "overtime", name: "Overtime", sortable: true },
      { uid: "duration", name: "Duration", sortable: true },
      { uid: "action", name: "Action", sortable: true },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return (
            <User
              name={item.full_name}
              description={
                <Link
                  href="#"
                  size="sm"
                  className="text-blue-500"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent default link behavior
                    window.open(
                      `https://mail.google.com/mail/u/0/?fs=1&to=${item.trans_employees_overtimes.email}&su=Leave%20Request&body=Shrek+wants+to+have+a+time+with+you+alone+&tf=cm`,
                      "emailWindow",
                      "width=600,height=400,top=100,left=100"
                    );
                  }}
                  isExternal
                >
                  {item.trans_employees_overtimes.email}
                </Link>
              }
              avatarProps={{
                src: item.trans_employees_overtimes.picture,
              }}
            />
          );
        case "request_date":
          return <span>{toGMT8(item.created_at).format("DD MMMM YYYY")}</span>;
        case "overtime_date":
          return <span>{toGMT8(item.date).format("DD MMMM YYYY")}</span>;
        case "overtime":
          return (
            <span>
              <strong>{toGMT8(item.clock_in).format("hh:mm a")}</strong> -{" "}
              <strong>{toGMT8(item.clock_out).format("hh:mm a")}</strong>
            </span>
          );
        case "duration":
          return (
            <span>
              {calculateShiftLength(item.clock_in, item.clock_out, 0)}
            </span>
          );
        case "action":
          return item.status === "pending" ? (
            <div className="flex gap-1 items-center">
              <Button
                isIconOnly
                variant="bordered"
                {...uniformStyle({ color: "default" })}
              >
                <IoCloseSharp className="size-5 text-danger-500" />
              </Button>
              <Button
                {...uniformStyle({ color: "success" })}
                startContent={
                  <IoCheckmarkSharp className="size-5 text-white" />
                }
                className="text-white font-semibold"
              >
                Approve
              </Button>
            </div>
          ) : (
            <Chip
              startContent={
                item.status === "approved" ? (
                  <FaCheckCircle size={18} />
                ) : (
                  <IoMdCloseCircle size={18} />
                )
              }
              variant="flat"
              color={statusColorMap[item.status]}
              className="capitalize"
            >
              {item.status}
            </Chip>
          );
        default:
          return <></>;
      }
    },
  };

  return (
    <div className="h-full overflow-auto flex flex-col">
      {/* <GridList items={data || []}>
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
      </GridList> */}
      <TableData
        config={config}
        items={data || []}
        isLoading={isLoading}
        isHeaderSticky
        isStriped
        aria-label="Overtime entries"
        className="h-full"
        onRowAction={(key) => alert(`Opening item ${key}...`)}
      />
    </div>
  );
}

export default Page;

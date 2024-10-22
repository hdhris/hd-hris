"use client";
import React, { useState } from "react";
import {
  Avatar,
  Calendar,
  Card,
  CardBody,
  CardHeader,
  Chip,
} from "@nextui-org/react";
import { parseDate } from "@internationalized/date";
import {
  AttendanceLog,
  EmployeeSchedule,
  BatchSchedule,
} from "@/types/attendance-time/AttendanceTypes";
import TableData from "@/components/tabledata/TableData";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { useQuery } from "@/services/queries";

const modeType = ["Password", "Fingerprint", "Card", "Face ID", "Other"];
const punchType = ["IN", "OUT"];

const calculateStatus = (
  timestamp: string,
  clock_in: string,
  clock_out: string,
  punchType: "IN" | "OUT"
): string => {
  const punchTime = new Date(timestamp);
  const datePart = punchTime.toISOString().split("T")[0];

  const scheduledIn = new Date(`${datePart}T${clock_in.split("T")[1]}`);
  const scheduledOut = new Date(`${datePart}T${clock_out.split("T")[1]}`);

  const gracePeriod = 5 * 60 * 1000;

  if (punchType === "IN") {
    if (punchTime < scheduledIn) return "EARLY-IN";
    if (punchTime.getTime() - scheduledIn.getTime() <= gracePeriod)
      return "ON-TIME";
    return "LATE";
  }

  if (punchType === "OUT") {
    if (punchTime < scheduledOut) return "EARLY-OUT";
    if (punchTime.getTime() - scheduledOut.getTime() <= gracePeriod)
      return "ON-TIME";
    return "OVERTIME";
  }

  return "UNKNOWN";
};

export default function Page() {
  const [date, setDate] = useState(parseDate(toGMT8().format("YYYY-MM-DD")));
  const [api, setApi] = useState(
    `/api/admin/attendance-time/records/${toGMT8().format("YYYY-MM-DD")}`
  );
  const [schedApi, setInfoApi] = useState(
    "/api/admin/attendance-time/schedule"
  );
  const { data: attendanceLog, isLoading } = useQuery<AttendanceLog[]>(api);
  const { data } = useQuery<{
    batch: BatchSchedule[];
    emp_sched: EmployeeSchedule[];
  }>(schedApi);

  const [selectedKey, setSelectedKey] = useState<any>("");

  const config: TableConfigProps<AttendanceLog> = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "mode", name: "Mode", sortable: true },
      { uid: "punch", name: "Punch", sortable: true },
      { uid: "status", name: "Status", sortable: true },
      { uid: "timestamp", name: "Timestamp", sortable: true },
    ],
    rowCell: (item, columnKey) => {
      const employeeSchedule = data?.emp_sched.find(
        (sched) => sched.employee_id === item.employee_id
      );
      const batchSchedule = data?.batch.find(
        (batch) => batch.id === employeeSchedule?.batch_id
      );
      const status =
        item.punch === 0
          ? calculateStatus(
              item.timestamp,
              batchSchedule?.clock_in || "",
              batchSchedule?.clock_out || "",
              "IN"
            )
          : calculateStatus(
              item.timestamp,
              batchSchedule?.clock_in || "",
              batchSchedule?.clock_out || "",
              "OUT"
            );

      switch (columnKey) {
        case "name":
          return (
            <div className="flex items-center space-x-2">
              <Avatar src={item.trans_employees.picture} />
              <p>{getEmpFullName(item.trans_employees)}</p>
            </div>
          );
        case "mode":
          return (
            <Chip
              className="capitalize"
              color="primary"
              size="sm"
              variant="faded"
            >
              {modeType[item.status]}
            </Chip>
          );
        case "punch":
          return (
            <Chip
              color={item.punch === 0 ? "success" : "danger"}
              size="sm"
              variant="flat"
            >
              {punchType[item.punch]}
            </Chip>
          );
        case "status":
          return <span>{status}</span>;
        case "timestamp":
          return <span>{toGMT8(item.timestamp).format("hh:mm a")}</span>;
        default:
          return <></>;
      }
    },
  };

  return (
    <div className="flex flex-row gap-1 h-full">
      <TableData
        config={config}
        items={attendanceLog || []}
        isLoading={isLoading}
        classNames={{
          wrapper: "h-fit-navlayout",
        }}
        isHeaderSticky
        selectionMode="single"
        aria-label="Attendance Records"
        onRowAction={(key) => {
          setSelectedKey(key as any);
        }}
      />
      <div className="flex flex-col gap-1">
        <Calendar
          classNames={{ cell: "text-sm", gridBodyRow: "first:mt-0 -mt-1" }}
          className="h-fit shadow-none border overflow-hidden"
          aria-label="Date (Controlled)"
          showMonthAndYearPickers
          value={date}
          onChange={(value) => {
            setDate(value);
            setApi(
              `/api/admin/attendance-time/records/${toGMT8(
                value.toString()
              ).format("YYYY-MM-DD")}`
            );
            setInfoApi("/api/admin/attendance-time/schedule");
          }}
        />
        <Card shadow="none" className="border">
          <CardHeader className="flex gap-1">
            <div className="flex flex-col">
              <p className="text-md">Selected Employee</p>
            </div>
          </CardHeader>
          <CardBody className="-mt-6">{/* ... */}</CardBody>
        </Card>
      </div>
    </div>
  );
}

"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Calendar,
  Card,
  CardBody,
  CardHeader,
  Chip,
} from "@nextui-org/react";
import { parseDate } from "@internationalized/date";
import { AxiosResponse } from "axios";
import { axiosInstance } from "@/services/fetcher";
import { CalendarDate } from "@nextui-org/react";
import {
  AttendanceLog,
  EmployeeSchedule,
  BatchSchedule,
} from "@/types/attendance-time/AttendanceTypes";
import TableData from "@/components/tabledata/TableData";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { toGMT8 } from "@/lib/utils/toGMT8";

const convertTo12HourFormat = (isoString: string): string => {
  const isoFormattedString = isoString.replace(" ", "T");
  const date = new Date(isoFormattedString);

  if (isNaN(date.getTime())) {
    console.error("Invalid date string:", isoFormattedString);
    return isoString;
  }

  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  const formattedHours = hours % 12 || 12;
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

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
  const today = new Date();
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceLog, setAttendanceLog] = useState<AttendanceLog[]>([]);
  const [scheduleData, setScheduleData] = useState<EmployeeSchedule[]>([]);
  const [batchSchedules, setBatchSchedules] = useState<BatchSchedule[]>([]);
  const [date, setDate] = useState(
    parseDate((toGMT8(new Date().toString()) as Date).toISOString().split("T")[0])
  );

  const fetchAttendance = useCallback(
    async () => {
      console.log("FLAG");
      setIsLoading(true);
      try {
        const formattedDate = `${date?.year}-${String(date?.month).padStart(
          2,
          "0"
        )}-${String(date?.day).padStart(2, "0")}`;
        const response: AxiosResponse<AttendanceLog[]> =
          await axiosInstance.get(
            `/api/admin/attendance-time/records/${formattedDate}`,
            {
              params: { date },
            }
          );
        setAttendanceLog(response.data);

        const response2: AxiosResponse<{
          batch: BatchSchedule[];
          emp_sched: EmployeeSchedule[];
        }> = await axiosInstance.get("/api/admin/attendance-time/schedule");
        setBatchSchedules(response2.data.batch);
        setScheduleData(response2.data.emp_sched);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [date] // Depend on 'date' as it's used in the function
  );

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

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
      const employeeSchedule = scheduleData.find(
        (sched) => sched.employee_id === item.employee_id
      );
      const batchSchedule = batchSchedules.find(
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
              <p>{`${item.trans_employees.last_name}, ${item.trans_employees.first_name} ${item.trans_employees.middle_name[0]}`}</p>
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
          return <span>{convertTo12HourFormat(item.timestamp)}</span>;
        default:
          return <></>;
      }
    },
  };

  return (
    <div className="flex flex-row p-1 gap-1">
      <TableData
        config={config}
        items={attendanceLog}
        isLoading={isLoading}
        className="flex-1 h-[calc(100vh-9.5rem)] overflow-y-auto"
        removeWrapper
        isHeaderSticky
        color={"primary"}
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
          onChange={setDate}
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

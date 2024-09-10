"use client";
import React, { useEffect, useState } from "react";
import {
  Avatar,
  Calendar,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
} from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/react";
import { parseDate } from "@internationalized/date";
import { AxiosResponse } from "axios";
import { axiosInstance } from "@/services/fetcher";
import { CalendarDate } from "@nextui-org/react";
import { AttendanceLog } from "@/types/attendance-time/AttendanceTypes";
import TableData from "@/components/tabledata/TableData";
import { TableConfigProps } from "@/types/table/TableDataTypes";
const convertTo12HourFormat = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
const statusType = ["Password", "Fingerprint", "Card", "Face ID", "Other"];
const punchType = ["IN", "OUT"];

export default function Page() {
  const today = new Date();
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceLog, setAttendanceLog] = useState<AttendanceLog[]>([]);
  let [date, setDate] = React.useState(
    parseDate(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(today.getDate()).padStart(2, "0")}`
    )
  );

  useEffect(() => {
    fetchAttandance(date.day, date.month, date.year);
  }, []);
  const handleDateChange = (newDate: CalendarDate) => {
    setDate(newDate);
    fetchAttandance(newDate.day, newDate.month, newDate.year);
  };
  const fetchAttandance = async (day: number, month: number, year: number) => {
    setIsLoading(true);
    try {
      const date = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const response: AxiosResponse<AttendanceLog[]> = await axiosInstance.get(
        `/api/admin/attendance-time/records`,
        {
          params: { date },
        }
      );
      setAttendanceLog(response.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const [selectedKey, setSelectedKey] = React.useState<any>("");
  // const selectedItem = dummyData.find((item) => item.key === selectedKey);
  const config: TableConfigProps<AttendanceLog> = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "status", name: "Status", sortable: true },
      { uid: "punch", name: "Punch", sortable: true },
      { uid: "timestamp", name: "Timestamp", sortable: true },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return (
            <div className="flex items-center space-x-2">
              <Avatar src={item.trans_employees.picture} />
              <p>{`${item.trans_employees.last_name}, ${item.trans_employees.first_name} ${item.trans_employees.middle_name[0]}`}</p>
            </div>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color="primary"
              size="sm"
              variant="faded"
            >
              {statusType[item.status]}
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
          return <span>{item.status}</span>;
        case "timestamp":
          return <span>{convertTo12HourFormat(item.timestamp)}</span>;
        default:
          return <></>;
      }
    },
  };
  // const searchingItemKey: Array<keyof AttendanceLog> = [
  //   "trans_employees"
  // ];
  return (
    <div className="flex flex-row p-1 gap-1">
      <TableData
        config={config}
        items={attendanceLog}
        // searchingItemKey={searchingItemKey}
        // counterName="Attendance Logs"
        isLoading={isLoading}
        className="flex-1 h-[calc(100vh-9.5rem)] overflow-y-auto"
        removeWrapper
        isHeaderSticky
        color={"primary"}
        selectionMode="single"
        aria-label="Attendance Records"
        onRowAction={(key) => {
          setSelectedKey(key as any);
          console.log(selectedKey);
        }}
      />
      <div className="flex flex-col gap-1">
        <Calendar
          classNames={{ cell: "text-sm", gridBodyRow: "first:mt-0 -mt-1" }}
          className="h-fit shadow-none border overflow-hidden"
          aria-label="Date (Controlled)"
          showMonthAndYearPickers
          value={date}
          onChange={handleDateChange}
        />
        <Card shadow="none" className="border">
          <CardHeader className="flex gap-1">
            <div className="flex flex-col">
              <p className="text-md">
                {/* {selectedItem ? selectedItem.name : "No selected"} */}
              </p>
              <p className="text-small text-default-500">On time</p>
            </div>
          </CardHeader>
          <CardBody className="-mt-6">
            <Table
              removeWrapper
              hideHeader
              aria-label="Example static collection table"
            >
              <TableHeader
                columns={[
                  {
                    key: "timestamp",
                    label: "TIME STAMP",
                  },
                  {
                    key: "punch",
                    label: "PUNCH",
                  },
                  {
                    key: "status",
                    label: "STATUS",
                  },
                ]}
              >
                {(column) => (
                  <TableColumn key={column.key}>{column.label}</TableColumn>
                )}
              </TableHeader>
              <TableBody
                emptyContent={"No records for this day."}
                items={[
                  {
                    key: "1",
                    timestamp: "8:30 am",
                    punch: "IN",
                    status: "EARLY",
                  },
                  {
                    key: "2",
                    timestamp: "12:00 pm",
                    punch: "OUT",
                    status: "ONTIME",
                  },
                  {
                    key: "3",
                    timestamp: "1:30 pm",
                    punch: "IN",
                    status: "LATE",
                  },
                  {
                    key: "4",
                    timestamp: "4:58 pm",
                    punch: "OUT",
                    status: "EARLY",
                  },
                ]}
              >
                {(row) => (
                  <TableRow
                    key={row.key}
                    className={`${
                      selectedKey === row.key ? "bg-gray-300" : ""
                    }`}
                  >
                    {(columnKey) => (
                      <TableCell className="py-1.5">
                        {columnKey === "status" ? (
                          <Chip
                            className="capitalize"
                            color="primary"
                            size="sm"
                            variant="flat"
                          >
                            {getKeyValue(row, columnKey)}
                          </Chip>
                        ) : (
                          getKeyValue(row, columnKey)
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

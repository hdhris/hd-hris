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
const statusColorMap = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};
const columns = [
  {
    key: "name",
    label: "NAME",
  },
  {
    key: "status",
    label: "STATUS",
  },
  {
    key: "punch",
    label: "PUNCH",
  },
  {
    key: "timestamp",
    label: "TIME STAMP",
  },
];
// Define your dummy data
// key: "1", Add keys for unique identity
// const avatar = [
//   { key: "1", src: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
//   { key: "2", src: "https://i.pravatar.cc/150?u=a04258a2462d826712d" },
//   { key: "3", src: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
//   { key: "4", src: "https://i.pravatar.cc/150?u=a04258114e29026302d" },
// ];
const convertTo12HourFormat = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};
const statusType = [
  "Password",
  "Fingerprint",
  "Card",
  "Face",
  "Other",
]
const punchType = [
  "IN",
  "OUT",
]
// const dummyData = [
//   {
//     key: "1",
//     name: "Tony Reichert",
//     status: "Fingerprint",
//     timestamp: "8:30 am",
//     punch: "CHECK IN",
//   },
//   {
//     key: "2",
//     name: "Zoey Lang",
//     status: "Fingerprint",
//     timestamp: "8:29 am",
//     punch: "CHECK OUT",
//   },
//   {
//     key: "3",
//     name: "Jane Fisher",
//     status: "Face ID",
//     timestamp: "8:28 am",
//     punch: "CHECK IN",
//   },
//   {
//     key: "4",
//     name: "William Howard",
//     status: "Face ID",
//     timestamp: "8:27 am",
//     punch: "CHECK OUT",
//   },
// ];

// // Function to create repeated data
// const generateData = (data: any, times: any) => {
//   const repeatedData = [];
//   for (let i = 0; i < times; i++) {
//     repeatedData.push(
//       ...data.map((item: any) => ({ ...item, id: `${item.name}-${i}` }))
//     ); // Add unique id for each entry
//   }
//   return repeatedData;
// };

interface AttendanceLog {
  id: number;
  employee_id: number;
  timestamp: string; // ISO format string
  status: number;
  punch: number; // ISO format string
  created_at: string; // ISO format string
  trans_employees: {
    last_name: string;
    first_name: string;
    middle_name: string;
    picture: string;
  };
}

export default function Page() {
  const today = new Date();
  const [attendanceLog, setAttendanceLog] = useState<AttendanceLog[]>([]);
  let [date, setDate] = React.useState(
    parseDate(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(today.getDate()).padStart(2, "0")}`
    )
  );
  
  useEffect(()=>{
    fetchAttandance(date.day, date.month, date.year);
  },[date.day, date.month, date.year])
  const handleDateChange = (newDate: CalendarDate) => {
    setDate(newDate);
    fetchAttandance(newDate.day, newDate.month, newDate.year);
  };
  const fetchAttandance = async (day: number, month:number, year:number) => {
    try {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const response: AxiosResponse<AttendanceLog[]> = await axiosInstance.get(`/api/admin/attendance-time/records`, {
        params: { date } // Sending date as a query parameter, if necessary
      });
      setAttendanceLog(response.data)
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };
  // const items = generateData(dummyData, 10); // Generate data repeated 10 times
  // const items = dummyData; // Generate data repeated 10 times
  const [selectedKey, setSelectedKey] = React.useState<any>("");
  // const selectedItem = dummyData.find((item) => item.key === selectedKey);
  return (
    <div className="flex flex-row p-1 gap-1">
      <Table
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
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No records for this day."} items={attendanceLog}>
          {attendanceLog.map((row) => (
            <TableRow
              key={row.id}
              className={`${selectedKey === row.id ? "bg-gray-300" : ""}`}
            >
              {(columnKey) => (
                <TableCell>
                  {columnKey === "name" ? (
                    <div className="flex items-center space-x-2">
                      <Avatar
                        src={row.trans_employees.picture}
                      />
                      {/* <p>{getKeyValue(row, columnKey)}</p> */}
                      <p>{`${row.trans_employees.last_name} ${row.trans_employees.first_name} ${row.trans_employees.middle_name}`}</p>
                    </div>
                  ) : columnKey === "status" ? (
                    <Chip
                      className="capitalize"
                      color="primary"
                      size="sm"
                      variant="flat"
                    >
                      {/* {getKeyValue(row, columnKey)} */}
                      {statusType[row.status]}
                    </Chip>
                  ) : columnKey === "punch"? (
                    punchType[row.punch]
                  ) : columnKey === "timestamp"? (
                    convertTo12HourFormat(row.timestamp)
                  ) : (
                    getKeyValue(row, columnKey)
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
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

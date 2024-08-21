"use client";
import React from "react";
import { Calendar } from "@nextui-org/react";
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
    key: "time",
    label: "TIME",
  },
];
// Define your dummy data
// key: "1", Add keys for unique identity
const dummyData = [
  { key: "1", name: "Tony Reichert", status: "TIME IN", time: "8:30 am" },
  { key: "2", name: "Zoey Lang", status: "TIME OUT", time: "8:29 am" },
  { key: "3", name: "Jane Fisher", status: "TIME IN", time: "8:28 am" },
  { key: "4", name: "William Howard", status: "TIME OUT", time: "8:27 am" },
];

// Function to create repeated data
const generateData = (data: any, times: any) => {
  const repeatedData = [];
  for (let i = 0; i < times; i++) {
    repeatedData.push(
      ...data.map((item: any) => ({ ...item, id: `${item.name}-${i}` }))
    ); // Add unique id for each entry
  }
  return repeatedData;
};

export default function Page() {
  let [value, setValue] = React.useState(parseDate("2024-03-07"));
  // const items = generateData(dummyData, 10); // Generate data repeated 10 times
  const items = dummyData; // Generate data repeated 10 times
  const [selectedKey, setSelectedKey] = React.useState<any>("");
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
        <TableBody emptyContent={"No records for this day."} items={items}>
          {items.map((row) => (
            <TableRow
              key={row.key}
              className={`${selectedKey === row.key ? "bg-gray-300" : ""}`}
            >
              {(columnKey) => (
                <TableCell>{getKeyValue(row, columnKey)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex flex-col">
        <Calendar
          classNames={{ cell: "text-sm" }}
          className="h-fit"
          aria-label="Date (Controlled)"
          showMonthAndYearPickers
          value={value}
          onChange={setValue}
        />
      </div>
    </div>
  );
}

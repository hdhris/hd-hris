"use client";
import React from "react";
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
const avatar = [
  { key: "1", src: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
  { key: "2", src: "https://i.pravatar.cc/150?u=a04258a2462d826712d" },
  { key: "3", src: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
  { key: "4", src: "https://i.pravatar.cc/150?u=a04258114e29026302d" },
];
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
  const today = new Date();
  let [value, setValue] = React.useState(
    parseDate(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(today.getDate()).padStart(2, "0")}`
    )
  );
  // const items = generateData(dummyData, 10); // Generate data repeated 10 times
  const items = dummyData; // Generate data repeated 10 times
  const [selectedKey, setSelectedKey] = React.useState<any>("");
  const selectedItem = dummyData.find((item) => item.key === selectedKey);
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
                <TableCell>
                  {columnKey === "name" ? (
                    <div className="flex items-center space-x-2">
                      <Avatar
                        src={avatar.find((item) => item.key === row.key)?.src}
                      />
                      <p>{getKeyValue(row, columnKey)}</p>
                    </div>
                  ) : columnKey === "status" ? (
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
          ))}
        </TableBody>
      </Table>
      <div className="flex flex-col gap-1">
        <Calendar
          classNames={{ cell: "text-sm", gridBodyRow: "first:mt-0 -mt-1" }}
          className="h-fit shadow-none border overflow-hidden"
          aria-label="Date (Controlled)"
          showMonthAndYearPickers
          value={value}
          onChange={setValue}
        />
        <Card shadow="none" className="border">
          <CardHeader className="flex gap-1">
            <div className="flex flex-col">
              <p className="text-md">
                {selectedItem ? selectedItem.name : "No selected"}
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
                    key: "time",
                    label: "TIME",
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
                  { key: "1", time: "8:30 am", punch: "IN", status: "EARLY" },
                  {
                    key: "2",
                    time: "12:00 pm",
                    punch: "OUT",
                    status: "ONTIME",
                  },
                  { key: "3", time: "1:30 pm", punch: "IN", status: "LATE" },
                  { key: "4", time: "4:58 pm", punch: "OUT", status: "EARLY" },
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

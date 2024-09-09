"use client";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Spinner,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Input,
  TimeInput,
} from "@nextui-org/react";
import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import {useIsClient} from "@/hooks/ClientRendering";
import { Time } from "@internationalized/date";
import { axiosInstance } from "@/services/fetcher";
import { useIsClient } from "@/hooks/ClientRendering";
import { AxiosResponse } from "axios";

interface Employee {
  id: number;
  employee_id: number;
  days_json: string[];
  batch_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  trans_employees: {
    last_name: string;
    first_name: string;
    middle_name: string;
  };
}

interface Batch {
  id: number;
  name: string;
  clock_in: string;
  clock_out: string;
  break_min: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

const getRandomColor = (index: number) => {
  const colors = ["teal", "pink", "violet", "orange"];
  const color = colors[index % colors.length];
  // return {
  //   border: `border-${color}-500`,
  //   text: `text-${color}-500`,
  //   bg: `bg-${color}-500`,
  // };
  return {
    border: [
      "border-teal-500",
      "border-pink-500",
      "border-violet-500",
      "border-orange-500",
    ][index % colors.length],
    hover_border: [
      "hover:border-teal-500",
      "hover:border-pink-500",
      "hover:border-violet-500",
      "hover:border-orange-500",
    ][index % colors.length],
    text: [
      "text-teal-500",
      "text-pink-500",
      "text-violet-500",
      "text-orange-500",
    ][index % colors.length],
    bg: ["bg-teal-100", "bg-pink-100", "bg-violet-100", "bg-orange-100"][
      index % colors.length
    ],
  };
};

const getShortTime = (time: string) => {
  return time.slice(11, 16) as string;
};

const formatTime = (time: string) => {
  const [hour, minute] = getShortTime(time).split(":");
  const intHour = parseInt(hour);
  const isPM = intHour >= 12;
  const formattedHour = intHour % 12 || 12; // Convert to 12-hour format
  const md = isPM ? "PM" : "AM";

  return (
    <div className="flex items-center">
      <h2 className="font-bold text-lg">
        {String(formattedHour).padStart(2, "0")}
      </h2>
      <p>:</p>
      <h2 className="font-bold text-lg">{minute}</h2>
      <h5 className="text-sm">{md}</h5>
    </div>
  );
};

const calculateShiftLength = (
  clockIn: string,
  clockOut: string,
  breaks: number
) => {
  const [inHour, inMinute] = getShortTime(clockIn).split(":").map(Number);
  const [outHour, outMinute] = getShortTime(clockOut).split(":").map(Number);

  const clockInMinutes = inHour * 60 + inMinute;
  const clockOutMinutes = outHour * 60 + outMinute;

  const shiftLengthMinutes = clockOutMinutes - clockInMinutes - breaks;

  const hours = Math.floor(shiftLengthMinutes / 60);
  const minutes = shiftLengthMinutes % 60;

  return `${hours} hr${hours !== 1 ? "s" : ""} ${
    minutes > 0 ? `and ${minutes} min${minutes !== 1 ? "s" : ""}` : ""
  }`;
};

export default function Page() {
  const [hoveredBatchId, setHoveredBatchId] = useState<number | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const [colorMap, setColorMap] = useState<Map<number, number>>(new Map());
  const isClient = useIsClient();
  const [batchData, setBatchData] = useState<Batch[]>([]);
  const [empScheduleData, setEmpScheduleData] = useState<Employee[]>([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // const colorMap = useRef<Map<number, number>>(new Map());
  const getSchedules = async () => {
    try {
      const response: AxiosResponse<{ batch: Batch[]; emp_sched: Employee[] }> =
        await axiosInstance.get("/api/admin/attendance-time/schedule");
      setBatchData(response.data.batch);
      const newColorMap = new Map<number, number>();
      response.data.batch.forEach((item, index) => {
        newColorMap.set(item.id, index);
      });
      console.log(newColorMap);
      setColorMap(newColorMap);
      setEmpScheduleData(response.data.emp_sched);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };
  // Batch Card (with default gray border and hover effect for color change)
  const BatchCard = ({ item, index }: { item: Batch; index: number }) => {
    return (
      <Card
        key={item.id}
        shadow="none"
        className={`w-full border-2 
          ${
            (hoveredBatchId === item.id || hoveredRowId === empScheduleData.find(
              (emp) => item.id === emp.batch_id
            )?.id)
              ? getRandomColor(colorMap.get(item.id) as number).border
              : "border-gray-400"
          } transition-all duration-300`}
        onMouseEnter={() => setHoveredBatchId(item.id)}
        onMouseLeave={() => setHoveredBatchId(null)}
      >
        <CardHeader>
          <h5 className="font-semibold">{item.name}</h5>
        </CardHeader>
        <CardBody className="flex justify-center items-center py-0">
          <div className="w-fit flex gap-2">
            {formatTime(item.clock_in)}
            <p>-</p>
            {formatTime(item.clock_out)}
          </div>
        </CardBody>
        <CardFooter className="flex flex-col items-start">
          <p className="text-sm">
            {calculateShiftLength(
              item.clock_in,
              item.clock_out,
              item.break_min
            )}{" "}
            shift
          </p>
          <p className="text-sm">{`${item.break_min} mins break`}</p>
        </CardFooter>
      </Card>
    );
  };

  // Card for Schedule Time (no border initially, but adds on hover)
  const getScheduleCard = (scheduleItem: Batch | undefined, id: number) => {
    if (scheduleItem) {
      let startTime = dayjs(`${getShortTime(scheduleItem.clock_in)}`, "HH:mm")
        .format("h:mma")
        .replaceAll("m", "");
      let endTime = dayjs(`${getShortTime(scheduleItem.clock_out)}`, "HH:mm")
        .format("h:mma")
        .replaceAll("m", "");

      const { border, bg, text } = getRandomColor(
        colorMap.get(scheduleItem.id) as number
      );

      return (
        <div className="h-16">
          <Card
            className={`${
              (hoveredBatchId === scheduleItem.id) || (hoveredRowId === id) ? "border-2" : "border-0"
            } ${bg} flex justify-center items-center h-full shadow-none transition-all duration-300 ${border}`}
          >
            <p className={text}>
              {startTime} - {endTime}
            </p>
          </Card>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    getSchedules();
  }, []);

  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  return (
    <div className="flex p-1 min-w-[1230px]">
      <div className="flex flex-col gap-2 w-52">
        {isClient && batchData ? (
          <>
            {batchData.map((item, index) => (
              <BatchCard key={item.id} item={item} index={index} />
            ))}
            <Button onPress={onOpen}>Add Schedule</Button>
          </>
        ) : (
          <Spinner className="m-10" />
        )}
      </div>
      <div className="w-full h-[calc(100vh-9.5rem)] overflow-auto relative mx-2">
        {isClient && empScheduleData ? (
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="text-xs text-gray-500">
              <tr className="divide-x divide-gray-200">
                <th className="sticky top-0 bg-[#f4f4f5] font-bold px-4 py-2 text-left w-[200px] max-w-[200px] z-50">
                  NAME
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="sticky top-0 bg-[#f4f4f5] font-bold px-4 py-2 text-center capitalize z-50"
                  >
                    {day.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {empScheduleData.map((employee) => (
                <tr
                  key={employee.id}
                  className="h-16 divide-x divide-gray-200 transition-all duration-100 hover:bg-gray-200"
                  onMouseEnter={() => setHoveredRowId(employee.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                >
                  <td className="px-4 py-2 truncate text-sm font-semibold w-[200px] max-w-[200px]">
                    {`${employee.trans_employees.first_name} ${employee.trans_employees.last_name}`}
                  </td>
                  {days.map((day) => (
                    <td
                      key={day}
                      className={`p-2 text-center text-sm font-semibold`}
                    >
                      {batchData.some(
                        (batch) =>
                          batch.id === employee.batch_id &&
                          employee.days_json.includes(day.toLowerCase())
                      )
                        ? getScheduleCard(
                            batchData.find(
                              (item) => item.id === employee.batch_id
                            ),
                            employee.id
                          )
                        : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <Spinner label="Loading..." />
          </div>
        )}
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Schedule
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-wrap gap-4">
                  <Input
                    type="file"
                    label="File"
                    labelPlacement="outside-left"
                  />
                  <TimeInput
                    label="Start"
                    defaultValue={new Time(8)}
                    labelPlacement="outside-left"
                  />
                  <TimeInput
                    label="End"
                    defaultValue={new Time(17)}
                    labelPlacement="outside-left"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Add
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

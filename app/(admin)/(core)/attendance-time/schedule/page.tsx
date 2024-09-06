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
import React, { useEffect, useState } from "react";
import { batch, emp_sched } from "./schedules";
import dayjs from "dayjs";
import { Time } from "@internationalized/date";

const colorValue: {
  border: { [key: string]: string }; // Allow any string as key for border colors
  text: { [key: string]: string }; // Allow any string as key for text colors
  bg: { [key: string]: string }; // Allow any string as key for background colors
} = {
  border: {
    violet: "border-violet-500",
    pink: "border-pink-500",
  },
  text: {
    violet: "text-violet-500",
    pink: "text-pink-500",
  },
  bg: {
    violet: "bg-violet-100",
    pink: "bg-pink-100",
  },
};
const formatTime = (time: string) => {
  const [hour, minute] = time.split(":");
  let intHour = parseInt(hour);
  let md: string = "AM";

  if (intHour >= 12) {
    md = "PM";
    if (intHour > 12) {
      intHour -= 12; // Convert to 12-hour format
    }
  } else if (intHour === 0) {
    intHour = 12; // Handle midnight (00:00)
  }

  return (
    <div className="flex items-center">
      <h2 className="font-bold text-lg">{String(intHour).padStart(2, "0")}</h2>
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
  const [inHour, inMinute] = clockIn.split(":").map(Number);
  const [outHour, outMinute] = clockOut.split(":").map(Number);

  const clockInMinutes = inHour * 60 + inMinute;
  const clockOutMinutes = outHour * 60 + outMinute;

  const shiftLengthMinutes = clockOutMinutes - clockInMinutes - breaks;

  const hours = Math.floor(shiftLengthMinutes / 60);
  const minutes = shiftLengthMinutes % 60;

  return `${hours} hr${hours !== 1 ? "s" : ""} ${
    minutes > 0 ? `and ${minutes} min${minutes !== 1 ? "s" : ""}` : ""
  }`;
};

const getScheduleTime = (scheduleName: string) => {
  const scheduleItem = batch.find((item) => item.name === scheduleName);
  if (scheduleItem) {
    let startTime = dayjs(
      `2023-01-01 ${scheduleItem.clock_in}`,
      "YYYY-MM-DD HH:mm"
    ).format("h:mma");
    startTime = startTime.replaceAll("m", "");
    let endTime = dayjs(
      `2023-01-01 ${scheduleItem.clock_out}`,
      "YYYY-MM-DD HH:mm"
    ).format("h:mma");
    endTime = endTime.replaceAll("m", "");
    return (
      <Card
        className={`border-2 ${colorValue.border[scheduleItem.color]} ${
          colorValue.bg[scheduleItem.color]
        } py-5 shadow-none`}
      >
        <p className={`${colorValue.text[scheduleItem.color]}`}>
          {startTime} - {endTime}
        </p>
      </Card>
    );
  }
  return "";
};

export default function Page() {
  const [isClient, setIsClient] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  useEffect(() => {
    setIsClient(true);
  }, []);
  const data = batch;
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  return (
    <div className="flex p-1 min-w-[1230px]">
      <div className="flex flex-col gap-2">
        {isClient ? (
          <>
            {data.map((item, index) => {
              return (
                <Card
                  key={index}
                  shadow="none"
                  className={`max-w-[200px] border-2 ${
                    colorValue.border[item.color]
                  } -z-50`}
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
                        item.break
                      )}{" "}
                      shift
                    </p>
                    <p className="text-sm">{`${item.break} mins break`}</p>
                  </CardFooter>
                </Card>
              );
            })}
            <Button onPress={onOpen}>Add Schedule</Button>
          </>
        ) : (
          <Spinner className="m-10" />
        )}
      </div>
      <div className="w-full h-[calc(100vh-9.5rem)] overflow-auto relative mx-2">
        {isClient ? (
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="text-xs text-gray-500">
              <tr className="divide-x divide-gray-200">
                <th className="sticky top-0 bg-[#f4f4f5] font-bold  px-4 py-2 text-left w-[200px] max-w-[200px] z-50">
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
              {Object.entries(emp_sched).map(
                ([name, { schedule, workday }]) => (
                  <tr
                    key={name}
                    className="h-16 divide-x divide-gray-200 transition-all duration-100 hover:bg-gray-200"
                  >
                    <td className=" px-4 py-2 truncate text-sm font-semibold w-[200px] max-w-[200px]">
                      {name}
                    </td>
                    {days.map((day) => (
                      <td
                        key={day}
                        className={`p-2 text-center text-sm font-semibold`}
                      >
                        {workday.includes(day.toLowerCase())
                          ? getScheduleTime(schedule)
                          : ""}
                      </td>
                    ))}
                  </tr>
                )
              )}
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
                    label="Name"
                    labelPlacement="outside-left"
                  />
                  <TimeInput
                    label="Start.."
                    defaultValue={new Time(8)}
                    labelPlacement="outside-left"
                  />
                  <TimeInput
                    label="End...."
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

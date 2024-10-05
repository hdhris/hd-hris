"use client";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Spinner,
  Button,
} from "@nextui-org/react";
import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { useIsClient } from "@/hooks/ClientRendering";
import axios, { AxiosResponse } from "axios";
import {
  BatchSchedule,
  EmployeeSchedule,
} from "@/types/attendance-time/AttendanceTypes";
import { calculateShiftLength } from "@/lib/utils/timeFormatter";
import { toast } from "@/components/ui/use-toast";
import { Pencil } from "lucide-react";
import { useSchedule } from "@/services/queries";
import showDialog from "@/lib/utils/confirmDialog";
import ScheduleModal from "@/components/admin/attendance-time/schedule/create-edit-modal";

const getRandomColor = (index: number) => {
  const colors = [
    "teal",
    "pink",
    "violet",
    "orange",
    "green",
    "amber",
    "red",
    "yellow",
    "blue",
  ];
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
      "border-green-500",
      "border-amber-500",
      "border-red-500",
      "border-yellow-500",
      "border-blue-500",
    ][index % colors.length],
    hover_border: [
      "hover:border-teal-500",
      "hover:border-pink-500",
      "hover:border-violet-500",
      "hover:border-orange-500",
      "hover:border-green-500",
      "hover:border-amber-500",
      "hover:border-red-500",
      "hover:border-yellow-500",
      "hover:border-blue-500",
    ][index % colors.length],
    text: [
      "text-teal-500",
      "text-pink-500",
      "text-violet-500",
      "text-orange-500",
      "text-green-500",
      "text-amber-500",
      "text-red-500",
      "text-yellow-500",
      "text-blue-500",
    ][index % colors.length],
    bg: [
      "bg-teal-100",
      "bg-pink-100",
      "bg-violet-100",
      "bg-orange-100",
      "bg-green-100",
      "bg-amber-100",
      "bg-red-100",
      "bg-yellow-100",
      "bg-blue-100",
    ][index % colors.length],
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

export default function Page() {
  const [hoveredBatchId, setHoveredBatchId] = useState<number | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const [colorMap, setColorMap] = useState<Map<number, number>>(new Map());
  const [batchData, setBatchData] = useState<BatchSchedule[] | null>([]);
  const [empScheduleData, setEmpScheduleData] = useState<EmployeeSchedule[]>(
    []
  );
  // const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isVisible, setVisible] = useState(false);
  const [isPending, setPending] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchSchedule | null>(
    null
  );
  // Form state

  const handleDelete = async (id: Number | undefined) => {
    try {
      const result = await showDialog(
        "Confirm Delete",
        `Are you sure you want to delete schedule?`,
        false
      );
      if (result === "yes") {
        await axios.post(
          "/api/admin/attendance-time/schedule/delete-schedule",
          {
            id: id,
          }
        );
        toast({
          title: "Deleted",
          description: "Schedule deleted successfully!",
          variant: "success",
        });

        setSelectedBatch(null);
        setVisible(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error: " + error,
        variant: "danger",
      });
    }
  };
  const handleSubmit = async (batch: BatchSchedule) => {
    setPending(true);
    try {
      if (batch.id > 0) {
        // Edit
        await axios.post("/api/admin/attendance-time/schedule/edit-schedule", {
          id: batch.id,
          name: batch.name,
          clock_in: batch.clock_in,
          clock_out: batch.clock_out,
          is_active: batch.is_active,
          break_min: batch.break_min,
        });
        toast({
          title: "Updated",
          description: "Schedule updated successfully!",
          variant: "success",
        });
      } else {
        // Create
        await axios.post("/api/admin/attendance-time/schedule/add-schedule", {
          name: batch.name,
          clock_in: batch.clock_in,
          clock_out: batch.clock_out,
          is_active: batch.is_active,
          break_min: batch.break_min,
        });
        toast({
          title: "Created",
          description: "Schedule created successfully!",
          variant: "success",
        });
      }
      setVisible(false);
    } catch (error) {
      toast({
        title: "Error " + (batch.id > 0 ? "updating" : "creating"),
        description: "Error: " + error,
        variant: "danger",
      });
    }
    setPending(false);
  };

  const { data, isLoading } = useSchedule();
  useEffect(() => {
    setBatchData(data?.batch!);
    const newColorMap = new Map<number, number>();
    data?.batch!.forEach((item, index) => {
      newColorMap.set(item.id, index);
    });
    console.log(newColorMap);
    setColorMap(newColorMap);
    setEmpScheduleData(data?.emp_sched!);
  }, [data]);

  const BatchCard = ({
    item,
    index,
  }: {
    item: BatchSchedule;
    index: number;
  }) => {
    // console.log("Found: "+empScheduleData.find((emp) => emp.id === hoveredRowId)?.batch_id)
    return (
      <Card
        key={item.id}
        shadow="none"
        className={`border-2 w-[200px] me-2 min-h-36 ${
          getRandomColor(index).bg
        } 
          ${
            hoveredBatchId === item.id ||
            empScheduleData.find((emp) => emp.id === hoveredRowId)?.batch_id ===
              item.id
              ? getRandomColor(index).border
              : "border-gray-300"
          } transition-all duration-300`}
        isPressable
        isHoverable
        onMouseEnter={() => setHoveredBatchId(item.id)}
        onMouseLeave={() => setHoveredBatchId(null)}
        onClick={() => {
          setSelectedBatch(item);
          setVisible(true);
        }}
      >
        <CardHeader>
          <h5 className={`font-semibold ${getRandomColor(index).text}`}>
            {item.name}
          </h5>
          <Pencil
            className={`text-default-800 ms-auto ${
              hoveredBatchId === item.id ? "visible" : "invisible"
            }`}
            width={15}
            height={15}
          />
        </CardHeader>
        <CardBody className="flex justify-center items-center py-0">
          <div className={`w-fit flex gap-2 ${getRandomColor(index).text}`}>
            {formatTime(item.clock_in)}
            <p>-</p>
            {formatTime(item.clock_out)}
          </div>
        </CardBody>
        <CardFooter className="flex flex-col items-start">
          <p className={`text-sm ${getRandomColor(index).text}`}>
            {calculateShiftLength(
              item.clock_in,
              item.clock_out,
              item.break_min
            )}{" "}
            shift
          </p>
          <p
            className={`text-sm ${getRandomColor(index).text}`}
          >{`${item.break_min} mins break`}</p>
        </CardFooter>
      </Card>
    );
  };

  // Card for Schedule Time (no border initially, but adds on hover)
  const getScheduleCard = (
    scheduleItem: BatchSchedule | undefined,
    employeeId: number
  ) => {
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
              hoveredBatchId === scheduleItem.id || hoveredRowId === employeeId
                ? "border-2"
                : "border-0"
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
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  if (isLoading || !data) {
    return (
      <Spinner
        className="w-full h-fit-navlayout"
        label="Please wait..."
        color="primary"
      />
    );
  }

  return (
    <div className="flex p-1 min-w-[1230px]">
      <div className="flex flex-col w-[260px] h-fit-navlayout">
        <div className="flex flex-col gap-2 pb-2 overflow-auto flex-1">
          {batchData?.map((item, index) => (
            <BatchCard key={item.id} item={item} index={index} />
          ))}
        </div>
        <Button
          onPress={() => {
            setSelectedBatch(null);
            setVisible(true);
          }}
        >
          Add Schedule
        </Button>
      </div>
      <div className="w-full relative mx-2 h-fit-navlayout">
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
            {empScheduleData?.map((employee) => (
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
                    {batchData?.some(
                      (batch) =>
                        batch.id === employee.batch_id &&
                        Array.isArray(employee.days_json) &&
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
      </div>
      <ScheduleModal
        onSave={handleSubmit}
        selectedSchedule={selectedBatch}
        visible={isVisible}
        pending={isPending}
        onClose={() => setVisible(false)}
        onDelete={handleDelete}
      />
    </div>
  );
}

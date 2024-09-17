import React, { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  DatePicker,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
} from "@nextui-org/react";
import { parseDate, CalendarDate } from "@internationalized/date";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BatchSchedule } from "@/types/attendance-time/AttendanceTypes";

type FormValues = {
  department_id: string;
  hired_at: string;
  job_id: string;
  batch_id: string;
  days_json: Record<string, boolean>;
};

const safeParseDate = (dateString: string) => {
  try {
    return parseDate(dateString);
  } catch (error) {
    console.error("Date parsing error:", error);
    return null;
  }
};

const formatTimeTo12Hour = (time: string) => {
  if (!time || typeof time !== "string") {
    console.error("Invalid time value:", time);
    return "Invalid time";
  }

  const timeParts = time.split("T")[1]?.split("Z")[0];
  if (!timeParts) {
    console.error("Invalid time format:", time);
    return "Invalid time";
  }

  const [hours, minutes] = timeParts.split(":").map(Number);

  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    console.error("Invalid hours or minutes:", timeParts);
    return "Invalid time";
  }

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
};

const EditJobInformationForm: React.FC = () => {
  const { control, setValue, watch, getValues } = useFormContext<FormValues>();
  const [departments, setDepartments] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [jobTitles, setJobTitles] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [batchSchedules, setBatchSchedules] = useState<BatchSchedule[]>([]);

  const selectedBatchId = watch("batch_id");
  const daysJson = watch("days_json") || {};

  useEffect(() => {
    fetchDepartments();
    fetchJobTitles();
    fetchBatchSchedules();
  }, []);

  const days_json = watch("days_json", {});

  const handleCheckboxChange = (day: string, checked: boolean) => {
    setValue(`days_json.${day}`, checked);
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/employeemanagement/department");
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchJobTitles = async () => {
    try {
      const response = await fetch("/api/employeemanagement/jobclasses");
      const data = await response.json();
      setJobTitles(data);
    } catch (error) {
      console.error("Error fetching job titles:", error);
    }
  };

  const fetchBatchSchedules = async () => {
    try {
      const response = await fetch("/api/employeemanagement/batch_schedules");
      const data = await response.json();
      setBatchSchedules(data);
    } catch (error) {
      console.error("Error fetching batch schedules:", error);
    }
  };

  const handleDayChange = (day: string, checked: boolean) => {
    setValue(`days_json.${day}`, checked, { shouldValidate: true });
  };

  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
        {/* Department */}
        <Controller
          name="department_id"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Select
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    field.onChange(value);
                    setValue("department_id", value);
                  }}
                  placeholder="Select Department"
                  variant="bordered"
                  className="border rounded"
                >
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Hire Date */}
        <Controller
          name="hired_at"
          control={control}
          render={({ field }) => {
            const parsedValue = field.value ? safeParseDate(field.value) : null;

            return (
              <FormItem>
                <FormLabel>Hire Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={parsedValue}
                    onChange={(date: CalendarDate | null) => {
                      field.onChange(date ? date.toString() : "");
                    }}
                    aria-label="Hiredate"
                    variant="bordered"
                    className="border rounded"
                    showMonthAndYearPickers
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Job Title */}
        <Controller
          name="job_id"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Select
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    field.onChange(value);
                    setValue("job_id", value);
                  }}
                  aria-label="Job Title"
                  placeholder="Select Job Title"
                  variant="bordered"
                  className="border rounded"
                >
                  {jobTitles.map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()}>
                      {job.name}
                    </SelectItem>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Work Schedule */}
      <div className="mt-5">
        <h3 className="text-lg font-semibold mb-4">Work Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batchSchedules.map((schedule) => (
            <Card
              key={schedule.id}
              isPressable
              onPress={() => setValue("batch_id", schedule.id.toString())}
              className={
                selectedBatchId === schedule.id.toString()
                  ? "border-2 border-green-500"
                  : ""
              }
            >
              <CardHeader className="font-bold">{schedule.name}</CardHeader>
              <CardBody>
                <p>
                  {formatTimeTo12Hour(schedule.clock_in)} -{" "}
                  {formatTimeTo12Hour(schedule.clock_out)}
                </p>
                <p>{schedule.break_min} mins break</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Work Days */}
      <div className="mt-5">
        <h3 className="text-lg font-semibold mb-4">Work Days</h3>
        <div className="flex flex-wrap gap-4">
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => (
            <Checkbox
              key={day}
              isSelected={daysJson?.[day] || false}
              onValueChange={(checked) => handleDayChange(day, checked)}
            >
              {day}
            </Checkbox>
          ))}
        </div>
      </div>
    </form>
  );
};

export default EditJobInformationForm;

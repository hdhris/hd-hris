"use client";

import React, { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  DatePicker,
  TimeInput,
  Checkbox,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { parseDate, CalendarDate } from "@internationalized/date";
import { Time } from "@internationalized/date";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type FormValues = {
  department_id: string;
  hired_at: string;
  job_id: string;
  workingType: string;
  contractYears: string;
  workSchedule?: WorkSchedule;
};

type WorkSchedule = {
  [key: string]: { timeIn: Time | null; timeOut: Time | null };
};

const availableDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Helper function to safely parse date
const safeParseDate = (dateString: string) => {
  try {
    return parseDate(dateString);
  } catch (error) {
    console.error("Date parsing error:", error);
    return null;
  }
};

const EditJobInformationForm: React.FC = () => {
  const { control, setValue, getValues } = useFormContext<FormValues>();
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>({});
  const [departments, setDepartments] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [jobTitles, setJobTitles] = useState<
    Array<{ id: number; name: string }>
  >([]);

  useEffect(() => {
    // Fetch departments and job titles when component mounts
    fetchDepartments();
    fetchJobTitles();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/employeemanagement/department");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched departments:", data); // Log the fetched data
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchJobTitles = async () => {
    try {
      const response = await fetch("/api/employeemanagement/job_title");
      const data = await response.json();
      console.log("Fetched job titles:", data); // Log the fetched data
      setJobTitles(data);
    } catch (error) {
      console.error("Error fetching job titles:", error);
    }
  };

  const handleDayToggle = (day: string, isChecked: boolean) => {
    if (isChecked) {
      setWorkSchedule((prev) => ({
        ...prev,
        [day]: { timeIn: new Time(9, 0), timeOut: new Time(17, 0) },
      }));
    } else {
      setWorkSchedule((prev) => {
        const { [day]: _, ...rest } = prev;
        return rest;
      });
    }
    setValue(
      `workSchedule.${day}`,
      isChecked
        ? { timeIn: new Time(9, 0), timeOut: new Time(17, 0) }
        : { timeIn: null, timeOut: null }
    );
  };

  const handleTimeChange = (
    day: string,
    type: "timeIn" | "timeOut",
    value: Time | null
  ) => {
    setWorkSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [type]: value },
    }));
    setValue(`workSchedule.${day}.${type}`, value);
  };

  return (
    <form className="space-y-6">
      {/* Department */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
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
                    setValue("department_id", value); // Explicitly set the value
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
                    setValue("job_id", value); // Explicitly set the value
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
        <div className="border rounded-md p-4">
          <div className="grid grid-cols-4 gap-4 mb-2">
            <div className="font-semibold">Days</div>
            <div className="font-semibold">Time In*</div>
            <div className="font-semibold">Time Out*</div>
            <div></div>
          </div>
          {availableDays.map((day) => (
            <div key={day} className="grid grid-cols-4 gap-4 items-center mb-2">
              <Checkbox
                isSelected={!!workSchedule[day]}
                onValueChange={(isChecked) => handleDayToggle(day, isChecked)}
              >
                {day}
              </Checkbox>
              <TimeInput
                isDisabled={!workSchedule[day]}
                value={workSchedule[day]?.timeIn || null}
                onChange={(newTime) => handleTimeChange(day, "timeIn", newTime)}
                className="w-full"
              />
              <TimeInput
                isDisabled={!workSchedule[day]}
                value={workSchedule[day]?.timeOut || null}
                onChange={(newTime) =>
                  handleTimeChange(day, "timeOut", newTime)
                }
                className="w-full"
              />
              {workSchedule[day] && (
                <div className="text-sm text-gray-600">
                  {workSchedule[day].timeIn?.toString()} -{" "}
                  {workSchedule[day].timeOut?.toString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};

export default EditJobInformationForm;

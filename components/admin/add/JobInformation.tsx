'use client';

import React, { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { DatePicker, TimeInput, Checkbox, Input, Select, SelectItem } from '@nextui-org/react';
import { parseDate, CalendarDate } from '@internationalized/date';
import { Time } from '@internationalized/date';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

type FormValues = {
  department: string;
  hireDate: string;
  jobTitle: string;
  jobRole: string;
  workingType: string;
  contractYears: string;
  workSchedule?: WorkSchedule;
};

type WorkSchedule = {
  [key: string]: { timeIn: Time | null; timeOut: Time | null };
};

const availableDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const JobInformationForm: React.FC = () => {
  const { control, setValue } = useFormContext<FormValues>();
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>({});

  const handleDayToggle = (day: string, isChecked: boolean) => {
    if (isChecked) {
      setWorkSchedule((prev) => ({
        ...prev,
        [day]: { timeIn: new Time(9, 0), timeOut: new Time(17, 0) }
      }));
    } else {
      setWorkSchedule((prev) => {
        const { [day]: _, ...rest } = prev;
        return rest;
      });
    }
    setValue(`workSchedule.${day}`, isChecked ? { timeIn: new Time(9, 0), timeOut: new Time(17, 0) } : { timeIn: null, timeOut: null });
  };

  const handleTimeChange = (day: string, type: "timeIn" | "timeOut", value: Time | null) => {
    setWorkSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [type]: value }
    }));
    setValue(`workSchedule.${day}.${type}`, value);
  };

  return (
    <form className="space-y-6">
      {/* Department */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
        <Controller
          name="department"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  aria-label="Department"
                  placeholder="Select Department"
                  variant="bordered"
                  className="border rounded"
                >
                  <SelectItem key="HR" value="HR">HR</SelectItem>
                  <SelectItem key="Engineering" value="Engineering">Engineering</SelectItem>
                  <SelectItem key="Marketing" value="Marketing">Marketing</SelectItem>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Hire Date */}
        <Controller
          name="hireDate"
          control={control}
          render={({ field }) => {
            const parsedValue = field.value ? parseDate(field.value) : null;

            return (
              <FormItem>
                <FormLabel>Hire Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={parsedValue}
                    onChange={(date: CalendarDate) => field.onChange(date.toString())}
                    aria-label="Hire Date"
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
          name="jobTitle"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  aria-label="Job Title"
                  placeholder="Select Job Title"
                  variant="bordered"
                  className="border rounded"
                >
                  <SelectItem key="Manager" value="Manager">Manager</SelectItem>
                  <SelectItem key="Developer" value="Developer">Developer</SelectItem>
                  <SelectItem key="Designer" value="Designer">Designer</SelectItem>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Job Role */}
        <Controller
          name="jobRole"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Role</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  aria-label="Job Role"
                  placeholder="Select Job Role"
                  variant="bordered"
                  className="border rounded"

                >
                  <SelectItem key="Frontend" value="Frontend">Frontend</SelectItem>
                  <SelectItem key="Backend" value="Backend">Backend</SelectItem>
                  <SelectItem key="Fullstack" value="Fullstack">Fullstack</SelectItem>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Working Type */}
        <Controller
          name="workingType"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Working Type</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  aria-label="Working Type"
                  placeholder="Select Working Type"
                  variant="bordered"
                  className="border rounded"
                  radius="sm"
                >
                  <SelectItem key="Full-time" value="Full-time">Full-time</SelectItem>
                  <SelectItem key="Part-time" value="Part-time">Part-time</SelectItem>
                  <SelectItem key="Contract" value="Contract">Contract</SelectItem>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Years Of Contract */}
        <Controller
          name="contractYears"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years Of Contract</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="Enter Years of Contract"
                  aria-label="Years Of Contract"
                  variant="bordered"
                  radius="sm"
                />
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
                onChange={(newTime) => handleTimeChange(day, "timeOut", newTime)}
                className="w-full"
              />
              {workSchedule[day] && (
                <div className="text-sm text-gray-600">
                  {workSchedule[day].timeIn?.toString()} - {workSchedule[day].timeOut?.toString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};

export default JobInformationForm;

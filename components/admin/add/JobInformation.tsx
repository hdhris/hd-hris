import React, { useState } from "react";
import { useFormContext, ControllerRenderProps, FieldValues } from "react-hook-form";
import { Avatar, DatePicker, Input, TimeInput, Checkbox } from "@nextui-org/react";
import { Time } from "@internationalized/date";
import FormFields from "@/components/forms/FormFields";
import { Selection } from "@/components/forms/FormFields";
import { UserRound } from "lucide-react";
import Text from "@/components/Text";
import { Button } from "@nextui-org/button";
import { cn, icon_color } from "@/lib/utils";

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

type FormInputProps = {
  name: string;
  label: string;
  placeholder?: string;
  isRequired?: boolean;
  type?: string;
  Component?: (
    field: ControllerRenderProps<FieldValues, string>
  ) => JSX.Element;
};

function assertFormInputProps(
  items: any[]
): asserts items is FormInputProps[] {}

const JobInformationForm: React.FC = () => {
  const { control, setValue } = useFormContext<FormValues>();
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>({});

  const availableDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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

  const formItems: FormInputProps[] = [
    {
      name: "department",
      label: "Department",
      placeholder: "Select Department",
      isRequired: true,
      Component: (field: ControllerRenderProps<FieldValues, string>) => (
        <Selection
          {...field}
          items={["HR", "Engineering", "Marketing"]}
          placeholder="Select Department"
        />
      ),
    },
    {
      name: "hireDate",
      label: "Hire Date",
      placeholder: "Select Hire Date",
      isRequired: true,
      type: "date",
      Component: (field: ControllerRenderProps<FieldValues, string>) => (
        <DatePicker
          {...field}
          onChange={field.onChange}
          aria-label="Hired Date"
          variant="bordered"
          radius="sm"
          classNames={{ selectorIcon: icon_color }}
          color="primary"
          showMonthAndYearPickers
        />
      ),
    },
    {
      name: "jobTitle",
      label: "Job Title",
      placeholder: "Select Job Title",
      isRequired: true,
      Component: (field: ControllerRenderProps<FieldValues, string>) => (
        <Selection
          {...field}
          items={["Manager", "Developer", "Designer"]}
          placeholder="Select Job Title"
        />
      ),
    },
    {
      name: "jobRole",
      label: "Job Role",
      placeholder: "Select Job Role",
      isRequired: true,
      Component: (field: ControllerRenderProps<FieldValues, string>) => (
        <Selection
          {...field}
          items={["Frontend", "Backend", "Fullstack"]}
          placeholder="Select Job Role"
        />
      ),
    },
    {
      name: "workingType",
      label: "Working Type",
      placeholder: "Select Working Type",
      isRequired: true,
      Component: (field: ControllerRenderProps<FieldValues, string>) => (
        <Selection
          {...field}
          items={["Full-time", "Part-time", "Contract"]}
          placeholder="Select Working Type"
        />
      ),
    },
    {
      name: "contractYears",
      label: "Years Of Contract",
      placeholder: "Enter Years of Contract",
      isRequired: true,
      Component: (field: ControllerRenderProps<FieldValues, string>) => (
        <Input variant="bordered"
          {...field}
          type="number"
          placeholder="Years Of Contract"
          labelPlacement="outside"
        />
      ),
    },
    
  ];

  assertFormInputProps(formItems);


  return (
    <form>
      <p className="text-sm text-gray-600 mb-3">
        Please provide the job information.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <FormFields items={formItems} />
      </div>

      <div className="mt-5">
        <h3 className="text-lg font-semibold mb-3">Work Schedule</h3>
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
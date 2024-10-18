import React from "react";
import { useFormContext } from "react-hook-form";
import FormFields, {
  FormInputProps,
} from "@/components/common/forms/FormFields";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import Text from "@/components/Text";
import { Divider } from "@nextui-org/react";
import {
  useDepartmentsData,
  useJobpositionData,
  useBranchesData,
  useBatchSchedules,
} from "@/services/queries";

const formatTimeTo12Hour = (time: string) => {
  if (!time || typeof time !== "string") return "Invalid time";
  const timeParts = time.split("T")[1]?.split("Z")[0];
  if (!timeParts) return "Invalid time";
  const [hours, minutes] = timeParts.split(":").map(Number);
  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
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
  const { setValue, watch } = useFormContext();
  const selectedBatchId = watch("batch_id");

  // Fetch data using SWR hooks
  const { data: departments = [] } = useDepartmentsData();
  const { data: jobTitles = [] } = useJobpositionData();
  const { data: branches = [] } = useBranchesData();
  const { data: batchSchedules = [] } = useBatchSchedules();

  // Create options arrays
  const departmentOptions = departments.reduce((acc: any[], dept) => {
    if (dept && dept.id && dept.name) {
      acc.push({ value: dept.id.toString(), label: dept.name });
    }
    return acc;
  }, []);

  const branchOptions = branches.reduce((acc: any[], branch) => {
    if (branch && branch.id && branch.name) {
      acc.push({ value: branch.id.toString(), label: branch.name });
    }
    return acc;
  }, []);

  const jobOptions = jobTitles.reduce((acc: any[], job) => {
    if (job && job.id && job.name) {
      acc.push({ value: job.id.toString(), label: job.name });
    }
    return acc;
  }, []);

  const formBasicFields: FormInputProps[] = [
    {
      name: "department_id",
      label: "Department",
      type: "auto-complete",
      isRequired: true,
      config: {
        placeholder: "Select Department",
        options: departmentOptions,
      },
    },
    {
      name: "hired_at",
      label: "Hired Date",
      type: "date-picker",
      isRequired: true,
      config: {
        placeholder: "Select hire date",
      },
    },
    {
      name: "job_id",
      label: "Job Position",
      type: "auto-complete",
      isRequired: true,
      config: {
        placeholder: "Select Job Position",
        options: jobOptions,
      },
    },
    {
      name: "branch_id",
      label: "Branch",
      type: "auto-complete",
      isRequired: true,
      config: {
        placeholder: "Select Branch",
        options: branchOptions,
      },
    },
  ];

  const handleBatchSelect = (batchId: string) => {
    setValue("batch_id", batchId, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // Initialize days_json with default values when batch is selected
    setValue(
      "days_json",
      {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      {
        shouldValidate: true,
      }
    );
  };

  const renderBatchSchedules = () => {
    if (!batchSchedules || batchSchedules.length === 0) {
      return <p>No batch schedules available</p>;
    }

    return batchSchedules.map((schedule) => {
      if (!schedule || !schedule.id) return null;

      const isSelected = selectedBatchId === schedule.id.toString();

      return (
        <Card
          key={schedule.id}
          isPressable
          onPress={() => handleBatchSelect(schedule.id.toString())}
          className={isSelected ? "border-2 border-green-500" : ""}
        >
          <CardHeader className="font-bold">{schedule.name}</CardHeader>
          <CardBody>
            <p>
              {formatTimeTo12Hour(schedule.clock_in)} -{" "}
              {formatTimeTo12Hour(schedule.clock_out)}
            </p>
            <p>{schedule.shift_hours} hrs shift</p>
            <p>{schedule.break_min} mins break</p>
          </CardBody>
        </Card>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
        <FormFields items={formBasicFields} />
      </div>

      <Divider />

      <div className="mt-5">
        <Text className="text-lg font-semibold mb-4">Work Schedule</Text>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderBatchSchedules()}
        </div>
      </div>
    </div>
  );
};

export default EditJobInformationForm;

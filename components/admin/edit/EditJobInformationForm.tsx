import React from "react";
import { useFormContext } from "react-hook-form";
import FormFields, {
  FormInputProps,
} from "@/components/common/forms/FormFields";
import { Divider, Spinner } from "@nextui-org/react";
import Text from "@/components/Text";
import { BatchCard } from "@/components/admin/attendance-time/schedule/batchCard";
import {
  useDepartmentsData,
  useJobpositionData,
  useBranchesData,
  useQuery,
} from "@/services/queries";
import {
  BatchSchedule,
  Schedules,
} from "@/types/attendance-time/AttendanceTypes";
//
const EditJobInformationForm: React.FC = () => {
  const { setValue, watch } = useFormContext();
  const selectedBatchId = watch("batch_id");
  const [hoveredBatchId, setHoveredBatchId] = React.useState<number | null>(
    null
  );
  const [selectedBatch, setSelectedBatch] =
    React.useState<BatchSchedule | null>(null);
  const [visible, setVisible] = React.useState(false);

  // Fetch data using SWR hooks
  const { data: departments = [] } = useDepartmentsData();
  const { data: jobTitles = [] } = useJobpositionData();
  const { data: branches = [] } = useBranchesData();
  const { data, isLoading } = useQuery<Schedules>(
    "/api/admin/attendance-time/schedule",
    { refreshInterval: 3000 }
  );

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

  // Get current days_json value and ensure it's an array
  const currentDays = watch("days_json") || [];
  const daysArray = Array.isArray(currentDays) ? currentDays : [];

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

  const daysJsonField: FormInputProps = {
    name: "days_json",
    label: "Working Days",
    type: "select",
    config: {
      placeholder: "Select Working Days",
      selectionMode: "multiple",
      options: [
        { value: "mon", label: "Monday" },
        { value: "tue", label: "Tuesday" },
        { value: "wed", label: "Wednesday" },
        { value: "thu", label: "Thursday" },
        { value: "fri", label: "Friday" },
        { value: "sat", label: "Saturday" },
        { value: "sun", label: "Sunday" },
      ],
      defaultValue: daysArray,
      selectedKeys: new Set(currentDays),
      onChange: (e: { target: { value: string; }; }) => {
        const selectedValues = Array.from(new Set(e.target.value.split(",")));
        setValue("days_json", selectedValues, {
          shouldValidate: true,
          shouldDirty: true,
        });
      },
    },
  };

  React.useEffect(() => {
    if (selectedBatch) {
      setValue("batch_id", selectedBatch.id.toString(), {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [selectedBatch, setValue]);

  const renderBatchSchedules = () => {
    if (!data?.batch || data.batch.length === 0) {
      return <p>No batch schedules available</p>;
    }

    return data.batch.map((schedule) => {
      if (!schedule || !schedule.id) return null;

      const isSelected = selectedBatchId === schedule.id.toString();
      const colorScheme = {
        border: "border-green-500",
        hover_border: "hover:border-green-500",
        text: "text-gray-800",
        bg: "bg-white",
      };

      return (
        <div key={schedule.id} className="space-y-4">
          <BatchCard
            key={schedule.id}
            item={schedule}
            color={colorScheme}
            isHovered={hoveredBatchId === schedule.id}
            isSelected={selectedBatchId === schedule.id.toString()}
            setHoveredBatchId={setHoveredBatchId}
            setSelectedBatch={setSelectedBatch}
            setVisible={setVisible}
          />
          {isSelected && (
            <div className="flex flex-wrap space-x-4">
              <FormFields items={[daysJsonField]} />
            </div>
          )}
        </div>
      );
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

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

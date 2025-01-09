import React from "react";
import { useFormContext } from "react-hook-form";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import Text from "@/components/Text";
import { BatchCard } from "@/components/admin/attendance-time/schedule/batchCard";
import { useQuery } from "@/services/queries";
import { BatchSchedule, Schedules } from "@/types/attendance-time/AttendanceTypes";

const ScheduleSelection: React.FC = () => {
  const {
     setValue,
     watch,
     formState: { errors },
   } = useFormContext();
  const selectedBatchId = watch("batch_id");
  const [hoveredBatchId, setHoveredBatchId] = React.useState<number | null>(null);
  const [selectedBatch, setSelectedBatch] = React.useState<BatchSchedule | null>(null);
  const [visible, setVisible] = React.useState(false);

  const { data, isLoading } = useQuery<Schedules>(
    "/api/admin/attendance-time/schedule",
    { refreshInterval: 3000 }
  );

  const currentDays = watch("days_json") || [];
  const daysArray = Array.isArray(currentDays) ? currentDays : [];

  React.useEffect(() => {
    if (selectedBatch) {
      setValue("batch_id", selectedBatch.id.toString(), {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [selectedBatch, setValue]);

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
      onChange: (e: { target: { value: string } }) => {
        const selectedValues = Array.from(new Set(e.target.value.split(",")));
        setValue("days_json", selectedValues, {
          shouldValidate: true,
          shouldDirty: true,
        });
      },
    },
  };

  // const handleBatchSelect = (batch: BatchSchedule) => {
  //   if (selectedBatch?.id === batch.id) {
  //     setSelectedBatch(null);
  //     setValue("batch_id", "");
  //     setValue("days_json", ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
  //   } else {
  //     setSelectedBatch(batch);
  //   }
  // };

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
    return <div>Loading Working Schedules...</div>;
  }

  return (
    <div className="mt-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderBatchSchedules()}
      </div>
      {errors.batch_id && (
        <p className="text-red-500 font-semibold text-sm">
          {errors.batch_id.message as string}
        </p>
      )}
    </div>
  );
};

export default ScheduleSelection;
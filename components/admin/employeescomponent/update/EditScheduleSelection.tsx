import React from "react";
import { useFormContext } from "react-hook-form";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import { BatchCard } from "@/components/admin/attendance-time/schedule/batchCard";
import { useQuery } from "@/services/queries";
import { BatchSchedule, Schedules } from "@/types/attendance-time/AttendanceTypes";
import { Spinner } from "@nextui-org/react";

interface EditScheduleSelectionProps {
  employeeId: string;
}

const EditScheduleSelection: React.FC<EditScheduleSelectionProps> = ({
  employeeId,
}) => {
  const { setValue, watch, clearErrors } = useFormContext();
  const selectedBatchId = watch("batch_id");
  const [hoveredBatchId, setHoveredBatchId] = React.useState<number | null>(null);
  const [selectedBatch, setSelectedBatch] = React.useState<BatchSchedule | null>(null);
  const [visible, setVisible] = React.useState(false);

  const { data: batchData, isLoading: isBatchLoading } = useQuery<Schedules>(
    "/api/admin/attendance-time/schedule",
    { refreshInterval: 3000 }
  );

  const currentDays = watch("days_json") || [];
  const daysArray = Array.isArray(currentDays) ? currentDays : [];

  const handleBatchSelect = (batch: BatchSchedule | null) => {
    if (selectedBatch?.id === batch?.id) {
      // Unselect the current batch
      setSelectedBatch(null);
      setValue("batch_id", "", {
        shouldValidate: false,
        shouldDirty: true,
      });
      setValue("days_json", [], {
        shouldValidate: false,
        shouldDirty: true,
      });
      // Clear any validation errors
      clearErrors(["batch_id", "days_json"]);
    } else {
      // Select new batch
      setSelectedBatch(batch);
      if (batch) {
        setValue("batch_id", batch.id.toString(), {
          shouldValidate: false,
          shouldDirty: true,
        });
        // Initialize with empty days array when selecting new batch
        setValue("days_json", ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], {
          shouldValidate: false,
          shouldDirty: true,
        });
      }
    }
  };

  const daysJsonField: FormInputProps = {
    name: "days_json",
    label: "Working Days",
    type: "select",
    config: {
      placeholder: "Select Working Days",
      selectionMode: "multiple",
      isRequired: false,
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
          shouldValidate: false,
          shouldDirty: true
        });
      },
    },
  };

  const renderBatchSchedules = () => {
    if (!batchData?.batch || batchData.batch.length === 0) {
      return <p>No batch schedules available</p>;
    }

    return batchData.batch.map((schedule) => {
      if (!schedule || !schedule.id) return null;

      const isSelected = selectedBatchId === schedule.id.toString();

      return (
        <div key={schedule.id} className="space-y-4">
          <BatchCard
            key={schedule.id}
            item={schedule}
            isHovered={hoveredBatchId === schedule.id}
            isSelected={isSelected}
            setHoveredBatchId={setHoveredBatchId}
            setSelectedBatch={() => handleBatchSelect(schedule)}
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

  if (isBatchLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Spinner>Loading schedules...</Spinner>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderBatchSchedules()}
      </div>
    </div>
  );
};

export default EditScheduleSelection;
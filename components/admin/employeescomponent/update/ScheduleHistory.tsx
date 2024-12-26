import React from "react";
import { EmployeeSchedule } from "@/types/attendance-time/AttendanceTypes";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { useQuery } from "@/services/queries";
import { CalendarDays, Clock, Coffee } from "lucide-react";
import { Spinner } from "@nextui-org/react";

interface ScheduleHistoryProps {
  employeeId: string;
}

const ScheduleHistory: React.FC<ScheduleHistoryProps> = ({ employeeId }) => {
  const { data: scheduleHistory, isLoading: isHistoryLoading } = useQuery<
    EmployeeSchedule[]
  >(
    employeeId
      ? `/api/employeemanagement/employees/schedule-history/${employeeId}`
      : null
  );

  const formatDaysString = (days: string[]) => {
    const daysMap: Record<string, string> = {
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun",
    };
    return days.map((day) => daysMap[day] || day).join(", ");
  };

  if (isHistoryLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Spinner>Loading Schedule History....</Spinner>
      </div>
    );
  }

  if (!scheduleHistory || scheduleHistory.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">Schedule History</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scheduleHistory.map((schedule) => (
          <div
            key={schedule.id}
            className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-800">
                {schedule.ref_batch_schedules?.name || "Schedule"}
              </span>
              {!schedule.end_date && (
                <span className="text-xs font-medium text-green-600 px-2 py-1 bg-green-100 rounded-full">
                  Current
                </span>
              )}
            </div>
            <div className="text-xs text-gray-600 mb-3">
              {schedule.start_date &&
                toGMT8(schedule.start_date).format("MMM DD, YYYY")}{" "}
              -{" "}
              {schedule.end_date
                ? toGMT8(schedule.end_date).format("MMM DD, YYYY")
                : "Present"}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {formatDaysString(schedule.days_json)}
                </span>
              </div>
              {schedule.ref_batch_schedules && (
                <>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {schedule.ref_batch_schedules.clock_in &&
                        schedule.ref_batch_schedules.clock_out &&
                        `${toGMT8(schedule.ref_batch_schedules.clock_in).format(
                          "hh:mm A"
                        )} - ${toGMT8(
                          schedule.ref_batch_schedules.clock_out
                        ).format("hh:mm A")}`}
                    </span>
                  </div>
                  {schedule.ref_batch_schedules.break_min && (
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {schedule.ref_batch_schedules.break_min} min break
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleHistory;

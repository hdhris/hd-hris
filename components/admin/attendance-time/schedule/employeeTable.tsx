import {
  BatchSchedule,
  EmployeeSchedule,
} from "@/types/attendance-time/AttendanceTypes";
import ScheduleCard from "./scheduleCard";

interface EmployeeTableProps {
  empScheduleData: EmployeeSchedule[];
  hoveredRowId: number | null;
  hoveredBatchId: number | null;
  onHover: (id: number | null) => void;
  setHoveredRowId: (id: number | null) => void;
  batchData: BatchSchedule[];
}
const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const EmployeeTable: React.FC<EmployeeTableProps> = ({
  empScheduleData,
  batchData,
  hoveredRowId,
  setHoveredRowId,
  onHover,
  hoveredBatchId,
}) => {
  return (
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
                  {batchData &&
                    (() => {
                      const batchItem = batchData.find(
                        (batch) =>
                          batch.id === employee.batch_id &&
                          Array.isArray(employee.days_json) &&
                          employee.days_json.includes(day.toLowerCase())
                      );
                      return (
                        batchItem && (
                          <ScheduleCard
                            batchSchedule={batchItem}
                            employeeId={employee.id}
                            isHovered={
                              hoveredBatchId === batchItem.id ||
                              hoveredRowId === employee.id
                            }
                          />
                        )
                      );
                    })()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;

import {
  BatchSchedule,
  EmployeeSchedule,
} from "@/types/attendance-time/AttendanceTypes";
import { getShortTime } from "./timeHelper";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { Card } from "@nextui-org/react";
import { cardGetRandomColor } from "./scripts";

export function scheduleTable(
  days: string[],
  empScheduleData: EmployeeSchedule[],
  batchData: BatchSchedule[],
  hoveredRowId: number | null,
  hoveredBatchId: number | null,
  setHoveredRowId: (id: number|null)=> void,
) {

    const getScheduleCard = (
        scheduleItem: BatchSchedule | undefined,
        employeeId: number
      ) => {
        if (scheduleItem) {
          let startTime = toGMT8(`${getShortTime(scheduleItem.clock_in)}`)
            .format("h:mma")
            .replaceAll("m", "");
          let endTime = toGMT8(`${getShortTime(scheduleItem.clock_out)}`)
            .format("h:mma")
            .replaceAll("m", "");
    
            const { border, bg, text } = cardGetRandomColor(batchData.findIndex((b) => b.id === scheduleItem.id));
              
    
          return (
            <div className="h-16">
              <Card
                className={`${
                  hoveredBatchId === scheduleItem.id || hoveredRowId === employeeId
                    ? "border-2"
                    : "border-0"
                } ${bg} flex justify-center items-center h-full shadow-none transition-all duration-300 ${border}`}
              >
                <p className={text}>
                  {startTime} - {endTime}
                </p>
              </Card>
            </div>
          );
        }
        return null;
      };
      
  return (
    <div className="h-full overflow-auto">
      <table className="w-full h-full table-fixed divide-y divide-gray-200">
        <thead className="text-xs text-gray-500 sticky top-0 z-10">
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
        <tbody className="divide-y divide-gray-200 h-fit overflow-auto">
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
                  {batchData?.some(
                    (batch) =>
                      batch.id === employee.batch_id &&
                      Array.isArray(employee.days_json) &&
                      employee.days_json.includes(day.toLowerCase())
                  )
                    ? getScheduleCard(
                        batchData.find((item) => item.id === employee.batch_id),
                        employee.id
                      )
                    : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

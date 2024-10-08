import { Card } from "@nextui-org/react";
import { BatchSchedule } from "@/types/attendance-time/AttendanceTypes";
import dayjs from "dayjs";
import { getRandomColor, getShortTime } from "./timeHelper";

interface ScheduleCardProps {
  batchSchedule: BatchSchedule;
  employeeId: number;
  isHovered: boolean;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  batchSchedule,
  employeeId,
  isHovered,
}) => {
  const startTime = dayjs(getShortTime(batchSchedule.clock_in)).format("h:mma");
  const endTime = dayjs(getShortTime(batchSchedule.clock_out)).format("h:mma");
  const colorStyles = getRandomColor(employeeId);

  return (
    <Card
      className={`${isHovered ? "border-2" : "border-0"} ${colorStyles.bg} 
        flex justify-center items-center h-full shadow-none transition-all duration-300 ${colorStyles.border}`}
    >
      <p className={colorStyles.text}>{startTime} - {endTime}</p>
    </Card>
  );
};

export default ScheduleCard;

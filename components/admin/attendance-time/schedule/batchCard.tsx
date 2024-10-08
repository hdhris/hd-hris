import { calculateShiftLength } from "@/lib/utils/timeFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { BatchSchedule } from "@/types/attendance-time/AttendanceTypes";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/react";
import { Pencil } from "lucide-react";
export const BatchCard = ({
    item,
    color,
    isHovered,
    isSelected,
    setHoveredBatchId,
    setSelectedBatch,
    setVisible,
  }: {
    item: BatchSchedule;
    isHovered: boolean;
    isSelected: boolean;
    setHoveredBatchId: (n:number|null)=> void;
    setSelectedBatch: (n:BatchSchedule|null)=> void;
    setVisible: (n:boolean)=> void;
    color: {
        border: string;
        hover_border: string;
        text: string;
        bg: string;
    };
  }) => {
    return (
      <Card
        key={item.id}
        shadow="none"
        className={`border-2 w-[200px] me-2 min-h-36 ${
          color.bg
        } 
          ${
            isHovered || isSelected
              ? color.border
              : "border-gray-300"
          } transition-all duration-300`}
        isPressable
        isHoverable
        onMouseEnter={() => setHoveredBatchId(item.id)}
        onMouseLeave={() => setHoveredBatchId(null)}
        onClick={() => {
          setSelectedBatch(item);
          setVisible(true);
        }}
      >
        <CardHeader>
          <h5 className={`font-semibold ${color.text}`}>
            {item.name}
          </h5>
          <Pencil
            className={`text-default-800 ms-auto ${
              isHovered ? "visible" : "invisible"
            }`}
            width={15}
            height={15}
          />
        </CardHeader>
        <CardBody className="flex justify-center items-center py-0">
          <div className={`w-fit flex gap-2 ${color.text}`}>
            {toGMT8(item.clock_in).format('hh:mm a')}
            <p>-</p>
            {toGMT8(item.clock_out).format('hh:mm a')}
          </div>
        </CardBody>
        <CardFooter className="flex flex-col items-start">
          <p className={`text-sm ${color.text}`}>
            {calculateShiftLength(
              item.clock_in,
              item.clock_out,
              item.break_min
            )}{" "}
            shift
          </p>
          <p
            className={`text-sm ${color.text}`}
          >{`${item.break_min} mins break`}</p>
        </CardFooter>
      </Card>
    );
  };
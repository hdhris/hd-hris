import { getColor } from "@/helper/background-color-generator/generator";
import { calculateShiftLength } from "@/lib/utils/timeFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { BatchSchedule } from "@/types/attendance-time/AttendanceTypes";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/react";
import { LuPencil } from "react-icons/lu";
export const BatchCard = ({
    item,
    isHovered,
    isSelected,
    isDisabled,
    setHoveredBatchId,
    setSelectedBatch,
    setVisible,
}: {
    isDisabled?: boolean;
    item: BatchSchedule;
    isHovered: boolean;
    isSelected: boolean;
    setHoveredBatchId: (n: number | null) => void;
    setSelectedBatch: (n: BatchSchedule | null) => void;
    setVisible: (n: boolean) => void;
}) => {
    return (
        <Card
            isDisabled={isDisabled}
            key={item.id}
            shadow="none"
            style={{
                background: getColor(item.name, 0.1),
                borderColor: isHovered || isSelected ? getColor(item.name, 0.5) : getColor(item.name, 0.2),
                color: getColor(item.name),
            }}
            className={`border-2 w-[200px] me-2 min-h-36 transition-all duration-300`}
            isPressable
            isHoverable
            onMouseEnter={() => setHoveredBatchId(item.id)}
            onMouseLeave={() => setHoveredBatchId(null)}
            onPress={() => {
                setSelectedBatch(item);
                setVisible(true);
            }}
        >
            <CardHeader>
                <h5 className={`font-semibold`}>
                    {item.name}
                </h5>
                <LuPencil
                    className={`text-default-800 ms-auto ${isHovered ? "visible" : "invisible"}`}
                    width={15}
                    height={15}
                />
            </CardHeader>
            <CardBody className="flex justify-center items-center py-0">
                <div className={`w-fit flex gap-2 `}>
                    {toGMT8(item.clock_in).format("hh:mm a")}
                    <p>-</p>
                    {toGMT8(item.clock_out).format("hh:mm a")}
                </div>
            </CardBody>
            <CardFooter className="flex flex-col items-start">
                <p className={`text-sm`}>
                    {calculateShiftLength(item.clock_in, item.clock_out, item.break_min)} shift
                </p>
                <p
                    className={`text-sm `}
                    // ${color.text}
                >{`${item.break_min} mins break`}</p>
            </CardFooter>
        </Card>
    );
};

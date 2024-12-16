import Drawer from "@/components/common/Drawer";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { OvertimeEntry } from "@/types/attendance-time/OvertimeType";
import { Avatar, cn, Divider, ScrollShadow, Textarea, Tooltip } from "@nextui-org/react";
import React from "react";
import { FaRegCalendarAlt, FaRegUserCircle } from "react-icons/fa";
import { MdOutlineMessage } from "react-icons/md";
import { TbClockCheck, TbClockUp, TbClockX } from "react-icons/tb";

interface ViewOvertimeProps {
    overtime: OvertimeEntry | null;
    onClose: () => void;
}

const Item = ({ icon, label, value, vertical }: { icon?: React.ReactNode; label: string; value: React.ReactNode; vertical?: boolean }) => {
    return (
        <div className={cn("flex justify-between gap-4 w-full", vertical ? 'flex-col items-start' : ' flex-row items-center')}>
            <div className="flex gap-4 items-center">
                {icon}
                <h1 className="font-semibold">{label}</h1>
            </div>
            <div className={vertical ? "w-full": undefined}>{value}</div>
        </div>
    );
};

function ViewOvertime({ overtime, onClose }: ViewOvertimeProps) {
    return (
        <Drawer isDismissible isOpen={!!overtime} onClose={onClose} title={"Overtime Details"}>
            {overtime && (
                <ScrollShadow className="space-y-4">
                    <Item
                        key={"date"}
                        icon={<FaRegCalendarAlt />}
                        label="Date"
                        value={toGMT8(overtime.date).format("MMMM DD, YYYY")}
                    />
                    <hr />
                    <Item
                        key={"clock_in"}
                        icon={<TbClockCheck />}
                        label="Clock In"
                        value={toGMT8(overtime.clock_in).format("hh:mm a")}
                    />
                    <hr />
                    <Item
                        key={"clock_in"}
                        icon={<TbClockX />}
                        label="Clock Out"
                        value={toGMT8(overtime.clock_in).format("hh:mm a")}
                    />
                    <hr />
                    <Item
                        key={"requested_min"}
                        icon={<TbClockUp />}
                        label="Requested Minutes"
                        value={`${overtime.requested_mins} minutes`}
                    />
                    <hr />
                    <Item
                        key={"created_by"}
                        icon={<FaRegUserCircle />}
                        label="Created By"
                        value={
                            <Tooltip
                                className="pointer-events-auto"
                                content={getEmpFullName(overtime.trans_employees_overtimes)}
                            >
                                <Avatar size="sm" src={overtime.trans_employees_overtimes.picture} />
                            </Tooltip>
                        }
                    />
                    <hr />
                    <Item
                        key={"reason"}
                        icon={<MdOutlineMessage />}
                        label="Reason"
                        vertical
                        value={
                            <Textarea
                                value={overtime.reason}
                                readOnly
                            />
                        }
                    />
                </ScrollShadow>
            )}
        </Drawer>
    );
}

export default ViewOvertime;

import Drawer from "@/components/common/Drawer";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { approvalStatusColorMap, ApprovalStatusType, OvertimeEntry } from "@/types/attendance-time/OvertimeType";
import { Avatar, Card, Chip, cn, Divider, ScrollShadow, Textarea, Tooltip } from "@nextui-org/react";
import { capitalize } from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { FaRegCalendarAlt, FaRegUserCircle } from "react-icons/fa";
import { MdHowToVote, MdOutlineGroups2, MdOutlineMessage } from "react-icons/md";
import { TbClockCheck, TbClockUp, TbClockX } from "react-icons/tb";
import CardTable from "@/components/common/card-view/card-table";
import Evaluators from "@/components/common/evaluators/evaluators";

interface ViewOvertimeProps {
    overtime: OvertimeEntry | null;
    onClose: () => void;
    mutate: () => void;
}

const Item = ({
    icon,
    label,
    value,
    vertical,
}: {
    icon?: React.ReactNode;
    label: string;
    value: React.ReactNode;
    vertical?: boolean;
}) => {
    return (
        <div
            className={cn(
                "flex justify-between gap-4 w-full",
                vertical ? "flex-col items-start" : " flex-row items-center"
            )}
        >
            <div className="flex gap-4 items-center">
                {icon}
                <h1 className="font-semibold text-medium">{label}</h1>
            </div>
            <div className={vertical ? "w-full" : undefined}>{value}</div>
        </div>
    );
};
function ViewOvertime({ overtime, onClose, mutate }: ViewOvertimeProps) {
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
                    <hr key={1} />
                    <Item
                        key={"clock_in"}
                        icon={<TbClockCheck />}
                        label="Clock In"
                        value={toGMT8(overtime.clock_in).format("hh:mm a")}
                    />
                    <hr />
                    <Item
                        key={"clock_out"}
                        icon={<TbClockX />}
                        label="Clock Out"
                        value={toGMT8(overtime.clock_in).format("hh:mm a")}
                    />
                    <hr key={2} />
                    <Item
                        key={"requested_min"}
                        icon={<TbClockUp />}
                        label="Requested Minutes"
                        value={`${overtime.requested_mins} minutes`}
                    />
                    <hr key={3} />
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
                    <hr key={4} />
                    <Item
                        key={"status"}
                        icon={<MdHowToVote />}
                        label="Status"
                        value={
                            <Chip variant="flat" color={approvalStatusColorMap[overtime.status]}>
                                {capitalize(overtime.status)}
                            </Chip>
                        }
                    />
                    <hr key={5} />
                    <Item
                        key={"reason"}
                        icon={<MdOutlineMessage />}
                        label="Reason"
                        vertical
                        value={<Textarea value={overtime.reason} readOnly />}
                    />
                    <hr key={6} />
                    <Item
                        key={"evaluators"}
                        icon={<MdOutlineGroups2 />}
                        label="Evaluators"
                        vertical
                        value={
                            <div className="space-y-2">
                                <Evaluators
                                    type={"Overtime"}
                                    evaluation={overtime.evaluators}
                                    selectedEmployee={{
                                        id: overtime.id,
                                        name: overtime.trans_employees_overtimes.last_name,
                                    }}
                                    mutate={mutate}
                                    onClose={onClose}
                                    evaluatorsApi="/api/admin/attendance-time/overtime/update"
                                />
                            </div>
                        }
                    />
                </ScrollShadow>
            )}
        </Drawer>
    );
}

export default ViewOvertime;

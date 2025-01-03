import { ValueLabel } from "@/components/admin/attendance-time/overtime/view-overtime";
import Drawer from "@/components/common/Drawer";
import { EmployeeHeader } from "@/components/common/minor-items/components";
import { getColor } from "@/helper/background-color-generator/generator";
import { MajorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { formatCurrency } from "@/lib/utils/numberFormat";
import { calculateShiftLength } from "@/lib/utils/timeFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { AttendanceLog, LogStatus } from "@/types/attendance-time/AttendanceTypes";
import { Chip, ScrollShadow } from "@nextui-org/react";
import { capitalize, toUpper } from "lodash";
import React from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import { LiaUserClockSolid } from "react-icons/lia";
import { MdOutlineAccessTime, MdOutlineMoreTime } from "react-icons/md";
import { TbClockCheck, TbClockShield, TbClockUp, TbClockX } from "react-icons/tb";

interface ViewRecordProps {
    attendanceInfo: {
        log_info: AttendanceLog;
        status: LogStatus | undefined;
        employee: MajorEmployee;
    } | null;
    onClose: () => void;
}
function ViewAttendanceRecord({ attendanceInfo, onClose }: ViewRecordProps) {
    return (
        <Drawer isOpen={!!attendanceInfo} onClose={onClose} isDismissible>
            {!!attendanceInfo && (
                <ScrollShadow className="space-y-4">
                    <EmployeeHeader employee={attendanceInfo?.employee!} />
                    <div className="mx-auto flex justify-center items-center gap-2">
                        {["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
                            // .filter((day) => attendanceInfo.status?.dayNames?.includes(day))
                            .map((day, index) => (
                                <Chip
                                    key={index}
                                    radius="sm"
                                    variant={attendanceInfo.status?.dayNames?.includes(day) ? "solid" : "flat"}
                                    className="p-0"
                                >
                                    {capitalize(day)}
                                </Chip>
                            ))}
                    </div>
                    <ValueLabel
                        label="Time Schedule"
                        icon={<LiaUserClockSolid />}
                        value={
                            <div className="flex flex-row gap-2">
                                <Chip variant="flat" color="success">
                                    {toGMT8(attendanceInfo?.status?.clockIn).format("hh:mm a")}
                                </Chip>
                                <Chip variant="flat" color="warning">
                                    {toGMT8(attendanceInfo?.status?.clockOut).format("hh:mm a")}
                                </Chip>
                            </div>
                        }
                    />
                    <div className="ms-4 space-y-4">
                        <p className="text-sm text-gray-500 font-semibold">Morning</p>
                        <div className="flex justify-between items-center text-medium ms-2">
                            {attendanceInfo?.status?.amIn?.time ? (
                                <strong>{toGMT8(attendanceInfo?.status?.amIn?.time).format("hh:mm a")}</strong>
                            ) : (
                                <p className="text-sm text-gray-500 font-semibold">Unrecorded</p>
                            )}
                            {attendanceInfo?.status?.amIn?.status && (
                                <p>{toUpper(attendanceInfo?.status.amIn.status)}</p>
                            )}
                        </div>
                        <div className="flex justify-between items-center text-medium ms-2">
                            {attendanceInfo?.status?.amOut?.time ? (
                                <strong>{toGMT8(attendanceInfo?.status?.amOut?.time).format("hh:mm a")}</strong>
                            ) : (
                                <p className="text-sm text-gray-500 font-semibold">Unrecorded</p>
                            )}
                            {attendanceInfo?.status?.amOut?.status && (
                                <p>{toUpper(attendanceInfo?.status.amOut.status)}</p>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 font-semibold mt-1">Afternoon</p>
                        <div className="flex justify-between items-center text-medium ms-2">
                            {attendanceInfo?.status?.pmIn?.time ? (
                                <strong>{toGMT8(attendanceInfo?.status?.pmIn?.time).format("hh:mm a")}</strong>
                            ) : (
                                <p className="text-sm text-gray-500 font-semibold">Unrecorded</p>
                            )}
                            {attendanceInfo?.status?.pmIn?.status && (
                                <p>{toUpper(attendanceInfo?.status.pmIn.status)}</p>
                            )}
                        </div>
                        <div className="flex justify-between items-center text-medium ms-2">
                            {attendanceInfo?.status?.pmOut?.time ? (
                                <strong>{toGMT8(attendanceInfo?.status?.pmOut?.time).format("hh:mm a")}</strong>
                            ) : (
                                <p className="text-sm text-gray-500 font-semibold">Unrecorded</p>
                            )}
                            {attendanceInfo?.status?.pmOut?.status && (
                                <p>{toUpper(attendanceInfo?.status.pmOut.status)}</p>
                            )}
                        </div>
                    </div>
                    <hr />
                    {/* <p className="text-sm text-gray-500 font-semibold mt-1">Rendered</p> */}
                    <ValueLabel
                        label="Shift"
                        icon={<TbClockCheck />}
                        value={
                            <div className="flex flex-row gap-2">
                                <p>
                                    {attendanceInfo?.status?.renderedShift
                                        ? calculateShiftLength(null, null, attendanceInfo?.status?.renderedShift, true)
                                        : "UNRECORDED"}
                                </p>
                                <div className="h-5 w-[1px] bg-gray-300" />
                                <p>{formatCurrency(String(attendanceInfo?.status?.paidShift))}</p>
                            </div>
                        }
                    />
                    <hr />
                    <ValueLabel
                        label="Overtime"
                        value={
                            <div className="flex flex-row gap-2">
                                <p>
                                    {attendanceInfo?.status?.renderedOvertime
                                        ? calculateShiftLength(
                                              null,
                                              null,
                                              attendanceInfo?.status?.renderedOvertime,
                                              true
                                          )
                                        : "0"}
                                </p>
                                <div className="h-5 w-[1px] bg-gray-300" />
                                <p>{formatCurrency(String(attendanceInfo?.status?.paidOvertime))}</p>
                            </div>
                        }
                        icon={<TbClockUp />}
                    />
                    <hr />
                    <ValueLabel
                        label="Undertime"
                        value={
                            <div className="flex flex-row gap-2">
                                <p>
                                    {attendanceInfo?.status?.renderedUndertime
                                        ? calculateShiftLength(
                                              null,
                                              null,
                                              attendanceInfo?.status?.renderedUndertime,
                                              true
                                          )
                                        : "0"}
                                </p>
                                <div className="h-5 w-[1px] bg-gray-300" />
                                <p>{formatCurrency(String(-(attendanceInfo?.status?.deductedUndertime ?? 0)))}</p>
                            </div>
                        }
                        icon={<TbClockX />}
                    />
                    <hr />
                    <ValueLabel
                        label="Leave"
                        value={
                            <div className="flex flex-row gap-2">
                                <p>
                                    {attendanceInfo?.status?.renderedLeave
                                        ? calculateShiftLength(null, null, attendanceInfo?.status?.renderedLeave, true)
                                        : "0"}
                                </p>
                                <div className="h-5 w-[1px] bg-gray-300" />
                                <p>{formatCurrency(String(attendanceInfo?.status?.paidLeave))}</p>
                            </div>
                        }
                        icon={<TbClockShield />}
                    />
                    {/* <p>{JSON.stringify(attendanceInfo.status)}</p> */}
                </ScrollShadow>
            )}
        </Drawer>
    );
}

export default ViewAttendanceRecord;

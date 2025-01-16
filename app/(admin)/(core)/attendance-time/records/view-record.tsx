import { ValueLabel } from "@/components/admin/attendance-time/overtime/view-overtime";
import Drawer from "@/components/common/Drawer";
import { EmployeeHeader } from "@/components/common/minor-items/components";
import QuickModal from "@/components/common/QuickModal";
import { toast } from "@/components/ui/use-toast";
import { MajorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import showDialog from "@/lib/utils/confirmDialog";
import { formatCurrency } from "@/lib/utils/numberFormat";
import { calculateShiftLength } from "@/lib/utils/timeFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { AttendanceLog, determineAttendance, LogStatus } from "@/types/attendance-time/AttendanceTypes";
import { parseAbsolute } from "@internationalized/date";
import { Button, Chip, Radio, RadioGroup, ScrollShadow, TimeInput } from "@nextui-org/react";
import axios from "axios";
import { capitalize, toUpper } from "lodash";
import { useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { LiaUserClockSolid, LiaUserPlusSolid } from "react-icons/lia";
import { TbClockCheck, TbClockShield, TbClockUp, TbClockX } from "react-icons/tb";
import { TiPen } from "react-icons/ti";

interface ViewRecordProps {
    attendanceInfo: {
        date: string;
        all_logs: {
            id: number | undefined;
            unique_id: string;
            employee_id: number;
            timestamp: string;
            status: number;
            punch: number;
        }[];
        log_info: AttendanceLog;
        status: LogStatus | undefined;
        employee: MajorEmployee;
    } | null;
    onClose: () => void;
}
function ViewAttendanceRecord({ attendanceInfo, onClose }: ViewRecordProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDTR, setShowDTR] = useState(false);
    const [time, setTime] = useState(toGMT8(attendanceInfo?.date).startOf("minute").toISOString());
    const [punch, setPunch] = useState("0");
    const [logs, setLogs] = useState(attendanceInfo?.all_logs ?? []);

    useEffect(() => {
        if (attendanceInfo?.all_logs) {
            setLogs(attendanceInfo?.all_logs);
        }
    }, [attendanceInfo?.all_logs]);

    const refresh = () => {
        setTime(toGMT8(attendanceInfo?.date).startOf("minute").toISOString());
        setPunch("0");
    };

    const addLog = () => {
        if (time) {
            const newLog = {
                id: undefined,
                employee_id: attendanceInfo?.employee.id ?? 0,
                punch: Number(punch),
                timestamp: time,
                status: 6,
                unique_id: `${attendanceInfo?.employee.id}${time}`,
            };
            setLogs([...logs, newLog]);
            refresh();
        }
    };

    const removeLog = (unique_id: string) => {
        setLogs(logs.filter((log) => log.unique_id !== unique_id));
    };

    const updateLog = (unique_id: string, value: string) => {
        setLogs((prev) => {
            return prev.map((item) => {
                if (item.unique_id === unique_id) {
                    return {
                        ...item,
                        punch: Number(value),
                        status: 5,
                    };
                }
                return item;
            });
        });
    };

    const updateLogs = async () => {
        // This function is called when the "Update Log List" button is clicked
        // In a real application, you might want to save the logs to a database or perform other actions
        setIsSubmitting(true);
        const result = await showDialog({
            title: "Confirm",
            message: "This action is irreversable.\n\nConfirm to update log.",
        });
        if (result != "yes") {
            setIsSubmitting(false);
            return;
        }
        try {
            await axios.post("/api/admin/attendance-time/records/update", {
                removed: attendanceInfo?.all_logs
                    .filter((item) => !logs.some((log) => log.unique_id === item.unique_id))
                    .map((item) => item.id),
                updated: logs.map((log) => ({
                    id: log.id,
                    timestamp: log.timestamp,
                    punch: log.punch,
                    status: log.status,
                    employee_id: log.employee_id,
                    unique_id: log.unique_id,
                })),
            });
            toast({
                title: "Incident reported successfully!",
                variant: "success",
            });
            // onClose();
            refresh();
            setShowDTR(false);
        } catch (error) {
            toast({
                title: "An error has occured",
                description: String(error),
                variant: "danger",
            });
        }
        setIsSubmitting(false);
    };

    return (
        <>
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
                            label="Hired Date"
                            icon={<LiaUserPlusSolid />}
                            value={toGMT8(attendanceInfo.employee.hired_at).format("MMMM DD, YYYY")}
                        />
                        <hr />
                        <ValueLabel
                            label="Time Schedule"
                            icon={<LiaUserClockSolid />}
                            value={
                                attendanceInfo?.status?.clockIn && attendanceInfo?.status?.clockOut ? (
                                    <div className="flex flex-row gap-2">
                                        <Chip variant="flat" color="success">
                                            {toGMT8(attendanceInfo.status.clockIn).format("hh:mm a")}
                                        </Chip>
                                        <Chip variant="flat" color="warning">
                                            {toGMT8(attendanceInfo.status.clockOut).format("hh:mm a")}
                                        </Chip>
                                    </div>
                                ) : (
                                    "UNSCHEDULED"
                                )
                            }
                        />
                        <hr />
                        <div className="ms-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500 font-semibold">Morning</p>
                                <Button
                                    isDisabled={[
                                        "Unscheduled",
                                        "Unhired",
                                        "Unemployed",
                                        "Suspended",
                                        "No Work",
                                        "On Leave",
                                    ].includes(determineAttendance(attendanceInfo!.status!))}
                                    onPress={() => setShowDTR(true)}
                                    size="sm"
                                    startContent={<TiPen />}
                                    variant="light"
                                >
                                    DTR
                                </Button>
                            </div>
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
                                            ? calculateShiftLength(
                                                  null,
                                                  null,
                                                  attendanceInfo?.status?.renderedShift,
                                                  true
                                              )
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
                                            ? calculateShiftLength(
                                                  null,
                                                  null,
                                                  attendanceInfo?.status?.renderedLeave,
                                                  true
                                              )
                                            : "0"}
                                    </p>
                                    <div className="h-5 w-[1px] bg-gray-300" />
                                    <p>{formatCurrency(String(attendanceInfo?.status?.paidLeave))}</p>
                                </div>
                            }
                            icon={<TbClockShield />}
                        />
                        {(attendanceInfo?.status?.deductedUnhired ?? 0) > 0 && (
                            <>
                                <hr />
                                <ValueLabel
                                    label="Unhired"
                                    value={
                                        <p>{formatCurrency(String(-(attendanceInfo?.status?.deductedUnhired ?? 0)))}</p>
                                    }
                                    icon={<TbClockShield />}
                                />
                            </>
                        )}
                        {/* <p>{JSON.stringify(attendanceInfo.status)}</p> */}
                    </ScrollShadow>
                )}
            </Drawer>
            <QuickModal
                isOpen={showDTR}
                title="Date Time Record"
                onClose={() => setShowDTR(false)}
                buttons={{
                    onClose: {
                        label: "Close",
                        isLoading: isSubmitting,
                        onPress: () => {
                            if (attendanceInfo?.all_logs) {
                                setLogs(attendanceInfo?.all_logs);
                            }
                            setShowDTR(false);
                        },
                    },
                    onAction: {
                        label: "Update",
                        isLoading: isSubmitting,
                        onPress: updateLogs,
                    },
                }}
            >
                <div className="grid grid-cols-3 gap-4 items-center w-full">
                    <TimeInput
                        value={
                            toGMT8(time).isValid()
                                ? parseAbsolute(toGMT8(time).startOf("minute").toISOString(), "UTC")
                                : null
                        }
                        onChange={(e) => setTime((e?.toDate() ?? new Date()).toISOString())}
                        hideTimeZone
                        variant="bordered"
                        aria-label="Time"
                    />
                    <RadioGroup
                        value={String(punch)}
                        onValueChange={setPunch}
                        className="flex m-auto"
                        orientation="horizontal"
                        size="sm"
                    >
                        {[
                            {
                                key: "0",
                                label: "IN",
                            },
                            {
                                key: "1",
                                label: "OUT",
                            },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center">
                                <Radio value={item.key} />
                                <p className="text-medium">{item.label}</p>
                            </div>
                        ))}
                    </RadioGroup>
                    <Button className="ms-auto w-fit" onPress={addLog} {...uniformStyle()}>
                        Add Log
                    </Button>
                </div>
                <hr />
                <ul className="space-y-1">
                    {logs
                        .sort((a, b) => toGMT8(a.timestamp).diff(toGMT8(b.timestamp)))
                        .map((log) => (
                            <li
                                key={log.unique_id}
                                className="border rounded p-2 ps-4 grid grid-cols-3 gap-4 items-center w-full"
                            >
                                <p className="text-medium">{toGMT8(log.timestamp).format("hh:mm a")}</p>
                                <RadioGroup
                                    value={String(log.punch)}
                                    onValueChange={(value) => updateLog(log.unique_id, value)}
                                    className="flex m-auto"
                                    orientation="horizontal"
                                    size="sm"
                                >
                                    {[
                                        {
                                            key: "0",
                                            label: "IN",
                                        },
                                        {
                                            key: "1",
                                            label: "OUT",
                                        },
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center">
                                            <Radio value={item.key} />
                                            <p className="text-medium">{item.label}</p>
                                        </div>
                                    ))}
                                </RadioGroup>
                                <Button
                                    size="sm"
                                    className="ms-auto"
                                    isIconOnly
                                    variant="light"
                                    onPress={() => removeLog(log.unique_id)}
                                >
                                    <IoIosClose size={20} />
                                </Button>{" "}
                            </li>
                        ))}
                </ul>
            </QuickModal>
        </>
    );
}

export default ViewAttendanceRecord;

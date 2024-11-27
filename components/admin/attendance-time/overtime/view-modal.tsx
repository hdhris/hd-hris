import React, { useState, useEffect, useCallback, ReactElement } from "react";
import {
    Button,
    Textarea,
    Avatar,
    Chip,
    Spinner,
    cn,
} from "@nextui-org/react";
import { OvertimeEntry } from "@/types/attendance-time/OvertimeType";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { calculateShiftLength } from "@/lib/utils/timeFormatter";
import { TbClock, TbClockCancel, TbClockCheck } from "react-icons/tb";
import TableData from "@/components/tabledata/TableData";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { PiClockCountdownFill } from "react-icons/pi";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import { useEmployeeId } from "@/hooks/employeeIdHook";
import UserMail from "@/components/common/avatar/user-info-mail";
import Drawer from "@/components/common/Drawer";
import { useQuery } from "@/services/queries";

interface ScheduleModalProps {
    visible: boolean;
    onClose: () => void;
    onUpdate: (data: OvertimeEntry) => Promise<OvertimeEntry | null>;
    overtimeData?: OvertimeEntry;
    isPending: { id: number; method: string };
}

const statusColorMap: Record<string, "danger" | "success" | "warning"> = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
};

const OvertimeModal: React.FC<ScheduleModalProps> = ({ visible, onClose, onUpdate, overtimeData: data, isPending }) => {
    const [overtimeData, setOvertimeData] = useState<OvertimeEntry>();
    const [selectedEmployee, setSelectedEmployee] = useState(0);
    const [selectedEntry, setSelectedEntry] = useState(0);
    const {
        data: recordData,
        isLoading: recordLoading,
        mutate,
    } = useQuery<OvertimeEntry[]>(`/api/admin/attendance-time/overtime/preview?id=${selectedEmployee}`);
    const [comment, setComment] = useState("");
    const [ratePH, setRatePH] = useState("0.0");
    const userID = useEmployeeId();

    const fetchEmployeeOvertimeRecords = useCallback(
        async (entry: OvertimeEntry) => {
            // console.log("FLAG");
            setOvertimeData(entry);
            setComment(entry?.comment || "");
            setRatePH(entry?.rate_per_hour || String(entry.trans_employees_overtimes.ref_job_classes.pay_rate) || "0");
            setSelectedEntry(entry.id);
            setSelectedEmployee(entry.employee_id);
        },
        [] // Depend on 'date' as it's used in the function
    );

    useEffect(() => {
        if (data) {
            fetchEmployeeOvertimeRecords(data);
        }
    }, [data, fetchEmployeeOvertimeRecords]);

    useEffect(() => {
        if (overtimeData) {
            console.log(overtimeData);
        }
    }, [overtimeData]);

    const config: TableConfigProps<OvertimeEntry> = {
        columns: [
            { uid: "status", name: "Status", sortable: true },
            { uid: "overtime_date", name: "Overtime Date", sortable: true },
            { uid: "overtime", name: "Overtime", sortable: true },
            { uid: "duration", name: "Duration", sortable: true },
        ],
        rowCell: (item, columnKey) => {
            switch (columnKey) {
                case "overtime_date":
                    return <p>{toGMT8(item.date).format("DD MMMM YYYY")}</p>;
                case "overtime":
                    return (
                        <p>
                            <strong>{toGMT8(item.clock_in).format("hh:mm a")}</strong>{" - "}
                            <strong>{toGMT8(item.clock_out).format("hh:mm a")}</strong>
                        </p>
                    );
                case "duration":
                    return <p>{item?.rendered_mins}</p>;
                case "status":
                    return (
                        <Chip
                            startContent={
                                item.status === "approved" ? (
                                    <FaCheckCircle size={18} />
                                ) : item.status === "pending" ? (
                                    <PiClockCountdownFill size={18} />
                                ) : (
                                    <IoMdCloseCircle size={18} />
                                )
                            }
                            variant="flat"
                            color={statusColorMap[item.status]}
                            className="capitalize mx-auto"
                        >
                            {item.status}
                        </Chip>
                    );
                default:
                    return <></>;
            }
        },
    };

    return (
        <Drawer
            isOpen={visible}
            onClose={onClose}
            size="lg"
            title="Review Overtime"
            footer={
                <div className="flex gap-2 items-center ms-auto">
                    {overtimeData?.status === "pending" && (
                        <>
                            <Button
                                variant="flat"
                                isLoading={isPending.id === overtimeData.id && isPending.method === "rejected"}
                                onClick={async () => {
                                    const result = await onUpdate({
                                        ...overtimeData,
                                        comment: comment,
                                        rate_per_hour: "0",
                                        approved_at: toGMT8().toISOString(),
                                        updated_at: toGMT8().toISOString(),
                                        approved_by: userID!,
                                        status: "rejected",
                                    });
                                    if (result) fetchEmployeeOvertimeRecords(result);
                                }}
                                {...uniformStyle({ color: "danger" })}
                                startContent={
                                    !(isPending.id === overtimeData.id && isPending.method === "rejected") && (
                                        <IoCloseSharp className="size-5 text-danger-500" />
                                    )
                                }
                            >
                                Reject
                            </Button>
                            <Button
                                type="submit"
                                form="schedule-form"
                                isLoading={isPending.id === overtimeData.id && isPending.method === "approved"}
                                {...uniformStyle({ color: "success" })}
                                className="text-white"
                                startContent={
                                    !(isPending.id === overtimeData.id && isPending.method === "approved") && (
                                        <IoCheckmarkSharp className="size-5 text-white" />
                                    )
                                }
                                onClick={async () => {
                                    const result = await onUpdate({
                                        ...overtimeData,
                                        comment: comment,
                                        rate_per_hour: ratePH,
                                        approved_at: toGMT8().toISOString(),
                                        updated_at: toGMT8().toISOString(),
                                        approved_by: userID!,
                                        status: "approved",
                                    });
                                    if (result) fetchEmployeeOvertimeRecords(result);
                                }}
                            >
                                Approve
                            </Button>{" "}
                        </>
                    )}
                </div>
            }
        >
            <div className="w-full flex justify-between items-center">
                <div className="flex gap-4 items-center">
                    <Avatar
                        isBordered
                        radius="full"
                        size="md"
                        src={overtimeData?.trans_employees_overtimes?.picture ?? ""}
                        className="m-2"
                    />
                    <div>
                        <p className="text-small font-semibold">
                            {getEmpFullName(overtimeData?.trans_employees_overtimes!)}
                        </p>
                        <p className="text-tiny font-normal">
                            {toGMT8(overtimeData?.created_at).format("ddd, MMM DD YYYY")}
                        </p>
                    </div>
                </div>

                {overtimeData?.trans_employees_overtimes_approvedBy && (
                    <div className="me-4">
                        <UserMail
                            name={`${
                                overtimeData.trans_employees_overtimes_approvedBy.last_name
                            }, ${overtimeData.trans_employees_overtimes_approvedBy.first_name.slice(0, 1)}.`}
                            picture={overtimeData?.trans_employees_overtimes_approvedBy.picture}
                            description="Reviewer"
                            size="sm"
                        />
                    </div>
                )}
            </div>
            <div className="flex gap-4">
                <div className="flex flex-col gap-4 w-[350px]">
                    <div className="flex w-full">
                        <div className="flex-1 py-2">
                            {/* {left} */}
                            <p className="text-small font-semibold text-default-600">Requested:</p>
                            <div className=" space-y-2">
                                <Info
                                    icon={<TbClock size={20} className="text-default-600" />}
                                    content={calculateShiftLength(
                                        new Date().toISOString(),
                                        new Date().toISOString(),
                                        -Number(overtimeData?.requested_mins),
                                        true
                                    )}
                                />
                                <Info
                                    icon={<TbClockCheck size={20} className="text-default-600" />}
                                    content={
                                        overtimeData?.clock_in ? toGMT8(overtimeData.clock_in).format("hh:mm a") : "N/A"
                                    }
                                    label="Clock In"
                                />
                                <Info
                                    icon={<TbClockCancel size={20} className="text-default-600" />}
                                    content={
                                        overtimeData?.clock_out
                                            ? toGMT8(overtimeData.clock_out).format("hh:mm a")
                                            : "N/A"
                                    }
                                    label="Clock Out"
                                />
                            </div>
                        </div>
                        <div className="flex-1 py-2">
                            {/* {right} */}
                            <p className="text-small font-semibold text-default-600">Rendered:</p>
                            <div className=" space-y-2">
                                <Info
                                    icon={<TbClock size={20} className="text-default-600" />}
                                    content={
                                        overtimeData?.clock_in && overtimeData.clock_out
                                            ? calculateShiftLength(
                                                  overtimeData.clock_in,
                                                  overtimeData.clock_out,
                                                  0,
                                                  true
                                              )
                                            : "N/A"
                                    }
                                />
                                <Info
                                    icon={<TbClockCheck size={20} className="text-default-600" />}
                                    content={
                                        overtimeData?.clock_in ? toGMT8(overtimeData.clock_in).format("hh:mm a") : "N/A"
                                    }
                                    label="Clock In"
                                />
                                <Info
                                    icon={<TbClockCancel size={20} className="text-default-600" />}
                                    content={
                                        overtimeData?.clock_out
                                            ? toGMT8(overtimeData.clock_out).format("hh:mm a")
                                            : "N/A"
                                    }
                                    label="Clock Out"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-small font-semibold text-default-600">Reason:</p>
                        <Textarea value={overtimeData?.reason} isReadOnly />
                    </div>
                    <div>
                        <p className="text-small font-semibold text-default-600">Comment:</p>
                        <Textarea
                            value={comment}
                            onValueChange={setComment}
                            isReadOnly={overtimeData?.status != "pending"}
                            placeholder="Add comment"
                            classNames={{
                                inputWrapper: cn(
                                    "border-2",
                                    overtimeData?.status === "pending" ? "border-primary" : "border-gray-100"
                                ),
                            }}
                        />
                    </div>
                    {/* <div>
            <p className="text-small font-semibold text-default-600">
              Rate Per Hour:
            </p>
            <Input
              value={ratePH}
              onValueChange={setRatePH}
              isReadOnly={overtimeData?.status != "pending"}
              type="number"
              placeholder="0.0"
              classNames={{
                inputWrapper: cn(
                  "border-2 h-fit",
                  overtimeData?.status === "pending"
                    ? "border-primary"
                    : "border-gray-100"
                ),
              }}
            />
          </div> */}
                </div>
                {recordLoading ? (
                    <Spinner label="Loading..." color="primary" className="w-full" />
                ) : (
                    <TableData
                        items={recordData || []}
                        config={config}
                        isLoading={recordLoading}
                        classNames={{ td: "w-fit" }}
                        layout="auto"
                        selectionMode="single"
                        disallowEmptySelection
                        removeWrapper
                        selectedKeys={new Set(selectedEntry.toString())}
                        onSelectionChange={(keys) => {
                            const record = recordData?.find((item) => String(item.id) === Array.from(keys)[0]);
                            setSelectedEntry(Number(Array.from(keys)[0]));
                            setOvertimeData(record);
                            setComment(record?.comment || "");
                            setRatePH(
                                record?.rate_per_hour ||
                                    String(record?.trans_employees_overtimes.ref_job_classes?.pay_rate) ||
                                    "0"
                            );
                        }}
                    />
                    // <DataDisplay
                    //   data={recordData || []}
                    //   // config={config}
                    //   isLoading={recordLoading}
                    //   onTableDisplay={{
                    //     config: config,
                    //     classNames: { td: "w-fit" },
                    //     layout: "auto",
                    //     selectionMode: "single",
                    //     disallowEmptySelection: true,
                    //     selectedKeys: new Set(selectedEntry.toString()),
                    //     onSelectionChange: (keys) => {
                    //       const record = recordData?.find(
                    //         (item) => String(item.id) === Array.from(keys)[0]
                    //       );
                    //       setSelectedEntry(Number(Array.from(keys)[0]));
                    //       setOvertimeData(record);
                    //       setComment(record?.comment || "");
                    //       setRatePH(
                    //         record?.rate_per_hour ||
                    //           String(
                    //             record?.trans_employees_overtimes.ref_job_classes
                    //               ?.pay_rate
                    //           ) ||
                    //           "0"
                    //       );
                    //     },
                    //   }}
                    //   defaultDisplay="table"
                    // />
                )}
            </div>
        </Drawer>
    );
};

const Info = ({ icon, content, label }: { icon: ReactElement; content: string; label?: string }) => {
    return (
        <div className="flex-1 flex items-center gap-4 min-h-10">
            {icon}
            <div className="flex flex-col gap-1">
                <p className="font-semibold leading-none">{content}</p>
                <p className="text-tiny leading-none font-semibold text-gray-500">{label}</p>
            </div>
        </div>
    );
};

export default OvertimeModal;

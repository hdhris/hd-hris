"use client";
import React, { useMemo, useState } from "react";
import { Calendar, Card, CardBody, CardHeader, Chip, cn, ScrollShadow, SortDescriptor } from "@nextui-org/react";
import { parseDate } from "@internationalized/date";
import {
    AttendanceLog,
    AttendanceData,
    LogStatus,
    Schedules,
} from "@/types/attendance-time/AttendanceTypes";
import TableData from "@/components/tabledata/TableData";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { useQuery } from "@/services/queries";
import UserMail from "@/components/common/avatar/user-info-mail";
import { toUpper } from "lodash";
import { calculateShiftLength } from "@/lib/utils/timeFormatter";
import useSWR from "swr";
import { fetchAttendanceData } from "./stage";

const modeType = ["Password", "Fingerprint", "Card", "Face ID", "Other"];
const punchType = ["IN", "OUT"];

export default function Page() {
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
        column: "timestamp",
        direction: "descending",
    });
    const [date, setDate] = useState(parseDate(toGMT8().format("YYYY-MM-DD")));
    const [datedApi, setDatedApi] = useState(
        `/api/admin/attendance-time/records?start=${toGMT8().format("YYYY-MM-DD")}&end=${toGMT8().format(
            "YYYY-MM-DD"
        )}`
    );
    const { data, mutate: mutateSchedule } = useQuery<Schedules>("/api/admin/attendance-time/schedule");

    const fetcher = async (url: string | null) => {
        const data = await fetchAttendanceData(String(url));
        return data;
    };

    const { data: attendanceData, isLoading } = useSWR<AttendanceData>(datedApi, fetcher);
    // const { data: attendanceData, isLoading } = useQuery<AttendanceData>(api);

    const [selectedLog, setSelectedLog] = useState<string>();

    const currentAttendanceInfo = useMemo(() => {
        const foundLog = attendanceData?.attendanceLogs.find((al) => al.id === Number(selectedLog));
        if (foundLog) {
            const empSched = data?.employees.find(emp => emp.id === foundLog?.employee_id)?.dim_schedules[0];
            const batchSched = data?.batch.find((b) => b.id === empSched?.batch_id);
            const status = attendanceData?.statusesByDate[`${date}`][`${foundLog?.employee_id}`];
            return {
                log_info: foundLog,
                employee_schedule: empSched,
                batchmate_schedule: batchSched,
                status: status,
            };
        }
    }, [attendanceData, selectedLog, data, date]);

    const clockSchedule = useMemo(() => {
        const info = currentAttendanceInfo;
        if (info?.batchmate_schedule && info?.employee_schedule) {
            return (
                <>
                    <Chip variant="flat" color="success">
                        {toGMT8(info?.batchmate_schedule?.clock_in).format("hh:mm a")}
                    </Chip>
                    <Chip variant="flat" color="warning">
                        {toGMT8(info?.batchmate_schedule?.clock_out).format("hh:mm a")}
                    </Chip>
                </>
            );
        }
        return null;
    }, [currentAttendanceInfo]);

    const sortedItems = React.useMemo(() => {
        if (attendanceData?.attendanceLogs) {
            const items = attendanceData?.attendanceLogs.sort((a, b) => {
                let aItem = null;
                let bItem = null;
                if (sortDescriptor.column === "timestamp") {
                    aItem = toGMT8(a.timestamp);
                    bItem = toGMT8(b.timestamp);
                } else if (sortDescriptor.column === "name") {
                    aItem = getEmpFullName(attendanceData?.employees.find((ar) => ar.id === a.employee_id)!);
                    bItem = getEmpFullName(attendanceData?.employees.find((ar) => ar.id === b.employee_id)!);
                }
                const cmp = aItem && bItem ? (bItem > aItem ? -1 : bItem < aItem ? 1 : 0) : 0;
                return sortDescriptor.direction === "descending" ? -cmp : cmp;
            });
            return items;
        }
        return [];
    }, [sortDescriptor, attendanceData]);

    const config: TableConfigProps<AttendanceLog> = {
        columns: [
            { uid: "id", name: "ID", sortable: true },
            { uid: "name", name: "Name", sortable: true },
            { uid: "mode", name: "Mode" },
            { uid: "daytime", name: "Daytime" },
            { uid: "punch", name: "Punch" },
            { uid: "timestamp", name: "Timestamp", sortable: true },
            { uid: "status", name: "Status" },
        ],
        rowCell: (item, columnKey) => {
            // const employeeSchedule = data?.emp_sched.find(
            //   (sched) => sched.employee_id === item.employee_id
            // );
            // const batchSchedule = data?.batch.find(
            //   (batch) => batch.id === employeeSchedule?.batch_id
            // );
            function findStatusKeyById(
                status: LogStatus | null,
                id: number
            ): "amIn" | "amOut" | "pmIn" | "pmOut" | null {
                for (const key of ["amIn", "amOut", "pmIn", "pmOut"] as const) {
                    if (status && status[key]) {
                        if (status[key].id === id) {
                            return key;
                        }
                    }
                }
                return null;
            }
            const employee = attendanceData?.employees.find((ar) => ar.id === item.employee_id)!;
            // console.log(attendanceData);
            const record = attendanceData?.statusesByDate[`${date}`][`${item.employee_id}`];
            let logStatus = null;
            const foundKey = findStatusKeyById(record || null, item.id);
            if (record && foundKey) {
                logStatus = record[foundKey];
            }

            switch (columnKey) {
                case "id":
                  return <>{employee.id}</>
                case "name":
                    return (
                        <UserMail name={getEmpFullName(employee)} picture={employee.picture} email={employee.email} />
                    );
                case "mode":
                    return (
                        <Chip className="capitalize" color="primary" size="sm" variant="faded">
                            {modeType[item.status]}
                        </Chip>
                    );
                case "punch":
                    return (
                        <Chip color={item.punch === 0 ? "success" : "danger"} size="sm" variant="flat">
                            {punchType[item.punch]}
                        </Chip>
                    );
                case "status":
                    return <strong>{toUpper(logStatus?.status || "Invalid")}</strong>;
                case "timestamp":
                    return <strong>{toGMT8(item.timestamp).format("hh:mm a")}</strong>;
                case "daytime":
                    return (
                        <strong
                            className={cn(
                                foundKey
                                    ? foundKey.includes("a")
                                        ? "text-blue-500"
                                        : "text-orange-400"
                                    : "text-red-500"
                            )}
                        >
                            {foundKey ? (foundKey.includes("a") ? "Morning" : "Afternoon") : "Invalid"}
                        </strong>
                    );
                default:
                    return <></>;
            }
        },
    };

    return (
        <div className="flex flex-row gap-1 h-full">
            <TableData
                items={sortedItems}
                title="Attendance Logs"
                config={config}
                isLoading={isLoading}
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={new Set([selectedLog || ""])}
                onSelectionChange={(key) => setSelectedLog(String(Array.from(key)[0]))}
            />
            <div className="flex flex-col gap-1">
                <Calendar
                    classNames={{ cell: "text-sm", gridBodyRow: "first:mt-0 -mt-1" }}
                    className="min-h-[252px] shadow-none border overflow-hidden"
                    aria-label="Date (Controlled)"
                    showMonthAndYearPickers
                    value={date}
                    onChange={(value) => {
                        setSelectedLog(undefined);
                        setDate(value);
                        setDatedApi(
                            (() => {
                                const selectedDate = toGMT8(value.toString()).format("YYYY-MM-DD");
                                return `/api/admin/attendance-time/records?start=${selectedDate}&end=${selectedDate}`;
                            })()
                        );
                        mutateSchedule();
                    }}
                />
                <Card shadow="none" className="border h-auto">
                    <CardHeader className="flex gap-2 justify-evenly">
                        {clockSchedule ? (
                            clockSchedule
                        ) : selectedLog ? (
                            <Chip variant="bordered" color="danger">
                                Invalid schedule
                            </Chip>
                        ) : (
                            <Chip variant="bordered">No log selected</Chip>
                        )}
                    </CardHeader>
                    <CardBody className="-mt-3">
                        {currentAttendanceInfo && clockSchedule && attendanceData && selectedLog && (
                            <ScrollShadow className="flex flex-col gap-2 p-1">
                                <p className="text-sm text-gray-500 font-semibold">Morning</p>
                                <div className="flex justify-between items-center text-sm ms-2">
                                    {currentAttendanceInfo.status?.amIn?.time ? (
                                        <strong>
                                            {toGMT8(currentAttendanceInfo.status?.amIn?.time).format("hh:mm a")}
                                        </strong>
                                    ) : (
                                        <p className="text-sm text-gray-500 font-semibold">Unrecorded</p>
                                    )}
                                    {currentAttendanceInfo.status?.amIn?.status && (
                                        <p>{toUpper(currentAttendanceInfo.status.amIn.status)}</p>
                                    )}
                                </div>
                                <div className="flex justify-between items-center text-sm ms-2">
                                    {currentAttendanceInfo.status?.amOut?.time ? (
                                        <strong>
                                            {toGMT8(currentAttendanceInfo.status?.amOut?.time).format("hh:mm a")}
                                        </strong>
                                    ) : (
                                        <p className="text-sm text-gray-500 font-semibold">Unrecorded</p>
                                    )}
                                    {currentAttendanceInfo.status?.amOut?.status && (
                                        <p>{toUpper(currentAttendanceInfo.status.amOut.status)}</p>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 font-semibold mt-1">Afternoon</p>
                                <div className="flex justify-between items-center text-sm ms-2">
                                    {currentAttendanceInfo.status?.pmIn?.time ? (
                                        <strong>
                                            {toGMT8(currentAttendanceInfo.status?.pmIn?.time).format("hh:mm a")}
                                        </strong>
                                    ) : (
                                        <p className="text-sm text-gray-500 font-semibold">Unrecorded</p>
                                    )}
                                    {currentAttendanceInfo.status?.pmIn?.status && (
                                        <p>{toUpper(currentAttendanceInfo.status.pmIn.status)}</p>
                                    )}
                                </div>
                                <div className="flex justify-between items-center text-sm ms-2">
                                    {currentAttendanceInfo.status?.pmOut?.time ? (
                                        <strong>
                                            {toGMT8(currentAttendanceInfo.status?.pmOut?.time).format("hh:mm a")}
                                        </strong>
                                    ) : (
                                        <p className="text-sm text-gray-500 font-semibold">Unrecorded</p>
                                    )}
                                    {currentAttendanceInfo.status?.pmOut?.status && (
                                        <p>{toUpper(currentAttendanceInfo.status.pmOut.status)}</p>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 font-semibold mt-1">Rendered</p>
                                <p className="flex justify-between items-center text-sm ms-2">
                                    Shift:{" "}
                                    <span>
                                        {currentAttendanceInfo.status?.renderedShift
                                            ? calculateShiftLength(
                                                  null,
                                                  null,
                                                  currentAttendanceInfo.status?.renderedShift,
                                                  true
                                              )
                                            : "UNRECORDED"}
                                    </span>
                                </p>
                                <p className="flex justify-between items-center text-sm ms-2">
                                    Overtime:{" "}
                                    <span>
                                        {currentAttendanceInfo.status?.renderedOvertime
                                            ? calculateShiftLength(
                                                  null,
                                                  null,
                                                  currentAttendanceInfo.status?.renderedOvertime,
                                                  true
                                              )
                                            : "0"}
                                    </span>
                                </p>
                                <p className="flex justify-between items-center text-sm ms-2">
                                    Undertime:{" "}
                                    <span>
                                        {currentAttendanceInfo.status?.renderedUndertime
                                            ? calculateShiftLength(
                                                  null,
                                                  null,
                                                  currentAttendanceInfo.status?.renderedUndertime,
                                                  true
                                              )
                                            : "0"}
                                    </span>
                                </p>
                            </ScrollShadow>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

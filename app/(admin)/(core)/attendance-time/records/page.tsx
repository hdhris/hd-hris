"use client";
import React, { useMemo, useState } from "react";
import { Calendar, Card, CardBody, CardHeader, Chip, ScrollShadow, SortDescriptor, Tab, Tabs } from "@nextui-org/react";
import { parseDate } from "@internationalized/date";
import { AttendanceData } from "@/types/attendance-time/AttendanceTypes";
import TableData from "@/components/tabledata/TableData";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { toUpper } from "lodash";
import { calculateShiftLength } from "@/lib/utils/timeFormatter";
import useSWR from "swr";
import { fetchAttendanceData } from "./stage";
import { formatCurrency } from "@/lib/utils/numberFormat";
import { attEmployeeConfig, attLogRecordConfig } from "./config";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import { MajorEmployee } from "@/helper/include-emp-and-reviewr/include";
import ViewAttendanceRecord from "./view-record";

export default function Page() {
    const [currentTab, setCurrentTab] = useState<"by-logs" | "by-employees">("by-employees"); //
    SetNavEndContent(() => (
        <Tabs selectedKey={currentTab} onSelectionChange={(value) => setCurrentTab(String(value) as any)} radius="lg">
            <Tab key="by-logs" title={"By Logs"} />
            <Tab key="by-employees" title={"By Employees"} />
        </Tabs>
    ));
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
        column: "timestamp",
        direction: "descending",
    });
    const [date, setDate] = useState(parseDate(toGMT8().format("YYYY-MM-DD")));
    const [datedApi, setDatedApi] = useState(toGMT8().format("YYYY-MM-DD"));
    const [selectedEmployee, setSelectedEmployee] = useState<MajorEmployee | null>(null);
    // const { data, mutate: mutateSchedule } = useQuery<Schedules>("/api/admin/attendance-time/schedule");

    const fetcher = async (url: string | null) => {
        const data = await fetchAttendanceData(String(url));
        return data;
    };

    const { data: attendanceData, isLoading } = useSWR<AttendanceData>(
        `/api/admin/attendance-time/records?start=${datedApi}&end=${datedApi}&all_employee=${
            currentTab === "by-employees" ? "true" : "false"
        }`,
        fetcher
    );
    // const { data: attendanceData, isLoading } = useQuery<AttendanceData>(api);

    const [selectedLog, setSelectedLog] = useState<string>();

    const currentAttendanceInfo = useMemo(() => {
        if (currentTab != "by-logs") return
        const foundLog = attendanceData?.attendanceLogs.find((al) => al.id === Number(selectedLog));
        if (foundLog) {
            const status = attendanceData?.statusesByDate[`${date}`][`${foundLog?.employee_id}`];
            return {
                log_info: foundLog,
                status: status,
            };
        }
    }, [attendanceData, selectedLog, date]);

    const employeeMap = useMemo(() => {
        return new Map(attendanceData?.employees.map((emp) => [emp.id, emp]));
    }, [attendanceData]);

    const currentEmployeeAttendanceInfo = useMemo(() => {
        if (!selectedEmployee || currentTab != "by-employees") return null;
        // console.log({ attendanceData });
        const foundLog = attendanceData?.attendanceLogs.find((al) => al.employee_id === selectedEmployee.id);
        const status = attendanceData?.statusesByDate[`${date}`][`${selectedEmployee.id}`];
        console.log({
            log_info: foundLog!,
            status: status,
            employee: selectedEmployee,
        });
        return {
            log_info: foundLog!,
            status: status,
            employee: selectedEmployee,
        };
    }, [attendanceData, selectedEmployee, date]);

    const clockSchedule = useMemo(() => {
        if (currentAttendanceInfo?.status) {
            return (
                <>
                    <Chip variant="flat" color="success">
                        {toGMT8(currentAttendanceInfo?.status?.clockIn).format("hh:mm a")}
                    </Chip>
                    <Chip variant="flat" color="warning">
                        {toGMT8(currentAttendanceInfo?.status?.clockOut).format("hh:mm a")}
                    </Chip>
                </>
            );
        }
        return null;
    }, [currentAttendanceInfo]);

    const sortedItems = React.useMemo(() => {
        // console.log({ attendanceData });
        return (
            attendanceData?.attendanceLogs?.sort((a, b) => {
                let aItem = null;
                let bItem = null;
                if (sortDescriptor.column === "timestamp") {
                    aItem = toGMT8(a.timestamp);
                    bItem = toGMT8(b.timestamp);
                } else if (sortDescriptor.column === "name") {
                    aItem = getEmpFullName(employeeMap.get(a.employee_id)!);
                    bItem = getEmpFullName(employeeMap.get(b.employee_id)!);
                }
                const cmp = aItem && bItem ? (bItem > aItem ? -1 : bItem < aItem ? 1 : 0) : 0;
                return sortDescriptor.direction === "descending" ? -cmp : cmp;
            }) ?? []
        );
    }, [sortDescriptor, attendanceData]);

    return (
        <div className="flex flex-row gap-1 h-full">
            <ViewAttendanceRecord
                attendanceInfo={currentEmployeeAttendanceInfo}
                onClose={() => setSelectedEmployee(null)}
            />
            {currentTab === "by-logs" ? (
                <TableData
                    items={sortedItems}
                    title="Attendance Logs"
                    config={attLogRecordConfig(date, attendanceData)}
                    isLoading={isLoading}
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                    selectionMode="single"
                    disallowEmptySelection
                    selectedKeys={new Set([selectedLog || ""])}
                    onSelectionChange={(key) => setSelectedLog(String(Array.from(key)[0]))}
                />
            ) : (
                <TableData
                    items={attendanceData?.employees ?? []}
                    title="Employee records"
                    config={attEmployeeConfig(date, attendanceData)}
                    isLoading={isLoading}
                    onRowAction={(value) => {
                        const employee = employeeMap.get(Number(String(value)));
                        setSelectedEmployee(employee ?? null);
                    }}
                    // selectedKeys={new Set([selectedLog || ""])}
                    // onSelectionChange={(key) => setSelectedLog(String(Array.from(key)[0]))}
                />
            )}
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
                        setDatedApi(toGMT8(value.toString()).format("YYYY-MM-DD"));
                    }}
                />
                {currentTab === "by-logs" && (
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
                                        Paid Overtime:{" "}
                                        <span>
                                            {formatCurrency(String(currentAttendanceInfo.status?.paidOvertime))}
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
                )}
            </div>
        </div>
    );
}

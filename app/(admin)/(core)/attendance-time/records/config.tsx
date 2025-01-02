import UserMail from "@/components/common/avatar/user-info-mail";
import { MajorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { AttendanceData, AttendanceLog, determineAttendance, LogStatus } from "@/types/attendance-time/AttendanceTypes";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { CalendarDate, Chip, cn } from "@nextui-org/react";
import { toUpper } from "lodash";

const modeType = ["Password", "Fingerprint", "Card", "Face ID", "Other"];
const punchType = ["IN", "OUT"];

export const attLogRecordConfig = (date: CalendarDate, attendanceData?: AttendanceData) => {
    return {
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
                    return <>{employee.id}</>;
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
    } as TableConfigProps<AttendanceLog>;
};

export const attEmployeeConfig = (date: CalendarDate, attendanceData?: AttendanceData): TableConfigProps<MajorEmployee> => {
    return {
        columns: [
            { uid: "id", name: "ID", sortable: true },
            { uid: "name", name: "Name", sortable: true },
            { uid: "status", name: "Status" },
            { uid: "duration", name: "Duration" },
        ],
        rowCell: (item, columnKey) => {
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
            // const employee = attendanceData?.employees.find((ar) => ar.id === item.employee_id)!;
            // console.log(attendanceData);
            const record = attendanceData?.statusesByDate[`${date}`][`${item.id}`];
            // let logStatus = null;
            // const foundKey = findStatusKeyById(record || null, item.id);
            // if (record && foundKey) {
            //     logStatus = record[foundKey];
            // }

            switch (columnKey) {
                case "id":
                    return <>{item.id}</>;
                case "name":
                    return (
                        <UserMail name={getEmpFullName(item)} picture={item.picture} email={item.email} />
                    );
                case "status":
                    return (
                        <strong>
                            {record ? determineAttendance(record) : "Unrecorded"}
                        </strong>
                    );
                case "duration":
                    return <>{record?.renderedShift}</>;
                default:
                    return <></>;
            }
        },
    }
};

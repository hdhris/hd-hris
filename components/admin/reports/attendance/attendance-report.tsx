"use client"
import React, {useState} from 'react';
import {AttendanceData, determineAttendance, LogStatus} from "@/types/attendance-time/AttendanceTypes";
import {fetchAttendanceData} from "@/app/(admin)/(core)/attendance-time/records/stage";
import {toGMT8} from "@/lib/utils/toGMT8";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import useSWR from "swr";
import {useControl} from "@/components/admin/reports/reports-controls/provider/reports-control-provider";
import ReportControls from "@/components/admin/reports/reports-controls/report-controls";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import NoData from "@/components/common/no-data/NoData";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import BorderCard from "@/components/common/BorderCard";
import Loading from "@/components/spinner/Loading";

function AttendanceReport() {
    // const [filterDepartment, setFilterDepartment] = useState<number>(0)
    // const [dateRange, setDateRange] = useState<DateValue>()
    const [start, setStart] = useState<string>("")
    const [end, setEnd] = useState<string>("")
    const {value} = useControl()
    // constt [attendanceLogs, setAttendanceLogs] = useState<AttendanceData | null>(null)
    // useEffect(() => {
    //     const logs = async () => {
    //         const attLogs = await fetchAttendanceData(String(`/api/admin/attendance-time/records?start=${toGMT8(value.start).format("YYYY-MM-DD")}&end=${toGMT8(value.end).format("YYYY-MM-DD")}&all_employee=true`));
    //         setAttendanceLogs(attLogs);
    //         console.log({attLogs});
    //     }
    //     logs()
    // }, [value.end, value.start])

    // useEffect(() => {
    //     setStart(value.start)
    //     setEnd(value.end)
    // }, [value])
    SetNavEndContent(() => {
        return <ReportControls/>
    })

    const fetcher = async (url: string | null) => {
        return await fetchAttendanceData(String(url));
    };

    console.log({
        start: toGMT8(value.date.start).format("YYYY-MM-DD"), end: toGMT8(value.date.end).format("YYYY-MM-DD")
    })

    const {
        data: attendanceData, isLoading
    } = useSWR<AttendanceData>(`/api/admin/attendance-time/records?start=${toGMT8(value.date.start).format("YYYY-MM-DD")}&end=${toGMT8(value.date.end).format("YYYY-MM-DD")}&all_employee=true`, fetcher, {
        refreshInterval: 3000,
    });

    // console.log({attendanceData})

    console.log({attendanceData})
    const attendance = attendanceData?.employees.sort((a,b) => a.last_name.localeCompare(b.last_name) ).map((employee, index) => {
        const start = toGMT8(value.date.start).toDate();
        const end = toGMT8(value.date.end).toDate()
        const attendance = [];
        const modeType = ["Password", "Fingerprint", "Card", "Face ID", "Other"];
        const punchType = ["IN", "OUT"];

        // console.log({attendanceData})
        function findStatusKeyById(status: LogStatus | null, id: number): "amIn" | "amOut" | "pmIn" | "pmOut" | null {
            for (const key of ["amIn", "amOut", "pmIn", "pmOut"] as const) {
                if (status && status[key]) {
                    if (status[key].id === id) {
                        return key;
                    }
                }
            }
            return null;
        }



        const attendanceLogs = attendanceData.attendanceLogs
        const attendancelog = attendanceLogs.find((attendanceLog) => attendanceLog.employee_id === employee.id)!;
        // console.log({attendanceLogs})
        // console.log({attendanceData})
        for (let current = new Date(start); current < end; current.setDate(current.getDate() + 1)) {
            const record = attendanceData?.statusesByDate[`${toGMT8(current).format("YYYY-MM-DD")}`][`${employee.id}`];
            // let logStatus = null;
            const foundKey = findStatusKeyById(record || null, attendancelog ? attendancelog.id : 0);
            // if (record && foundKey) {
            //     logStatus = record[foundKey];
            // }

            attendance.push({
                id: attendancelog?.unique_id,
                name: getEmpFullName(employee),
                department: employee.ref_departments.name,
                date: toGMT8(attendancelog?.timestamp).format("YYYY-MM-DD"),
                mode: modeType[attendancelog?.status!],
                punch: punchType[attendancelog?.punch!],
                timestamp: toGMT8(attendancelog?.timestamp).format("hh:mm A"),
                daytime: foundKey ? (foundKey.includes("a") ? "Morning" : "Afternoon") : "Unrecognized",
                status: determineAttendance(record)
            })
        }

        return attendance.filter(item => item.id);
    })
    console.log({attendance})
    console.log({attendance: attendance ? attendance.flatMap(item => item) : []})
    return (<div className="h-full">
        <BorderCard className="h-full overflow-auto p-2">
            {
                attendanceData?.attendanceLogs.length! > 0 && attendance && attendance.length > 0 ? <table className="w-full border-collapse p-2">
                    <thead className="bg-gray-100 sticky top-0">
                    <tr>
                        <th className="p-3 text-left border text-[7pt]">Attendance ID</th>
                        <th className="p-3 text-left border text-[7pt]">Name</th>
                        <th className="p-3 text-left border text-[7pt]">Department</th>
                        <th className="p-3 text-left border text-[7pt]">Date</th>
                        <th className="p-3 text-left border text-[7pt]">Timestamp</th>
                        <th className="p-3 text-right border text-[7pt]">Mode</th>
                        <th className="p-3 text-right border text-[7pt]">Punch</th>
                        <th className="p-3 text-right border text-[7pt]">Daytime</th>
                        <th className="p-3 text-right border text-[7pt]">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {attendance && attendance.flatMap((item) => {
                        return (<>
                            {item.map((att, index) => (<tr key={index} className="hover:bg-gray-50">
                                <td className="p-3 border text-[7pt]">{att.id}</td>
                                <td className="p-3 border text-[7pt]">{att.name}</td>
                                <td className="p-3 border text-[7pt]">{att.department}</td>
                                <td className="p-3 border text-[7pt]">{att.date}</td>
                                <td className="p-3 border text-[7pt]">{att.timestamp}</td>
                                <td className="p-3 border text-[7pt]">{att.mode}</td>
                                <td className="p-3 border text-[7pt]">{att.punch}</td>
                                <td className="p-3 border text-[7pt]">{att.daytime}</td>
                                <td className="p-3 border text-[7pt]">{att.status}</td>

                            </tr>))}
                        </>)
                    })}
                    </tbody>
                </table> : isLoading ? <Loading/>: <NoData message="No Attendance found."/>
            }
        </BorderCard>
    </div>);
}

export default AttendanceReport;
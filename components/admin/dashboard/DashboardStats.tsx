'use client'
import {PiUsersThree, PiUsersThreeLight} from "react-icons/pi";
import {TbCurrencyPeso} from "react-icons/tb";
import {FiLogOut} from "react-icons/fi";
import {LuCalendarDays, LuCalendarX2, LuPlane, LuTicket} from "react-icons/lu";
import {Stat, StatProps} from "@/components/statistics/Stat";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {compactNumber, getRandomInt, numberWithCommas} from "@/lib/utils/numberFormat";
import CountUp from "react-countup";
import {icon_color, icon_size} from "@/lib/utils";
import {Chip, cn} from '@nextui-org/react'
import {Avatar} from "@nextui-org/avatar";
import BorderCard from "@/components/common/BorderCard";
import PayrollGraph from "@/components/admin/dashboard/payroll-graph/payroll-graph";
import {useDashboard} from "@/services/queries";
import {toGMT8} from "@/lib/utils/toGMT8";
import {fetchAttendanceData} from "@/app/(admin)/(core)/attendance-time/records/stage";
import {
    AttendaceStatuses, AttendanceData, determineAttendance, LogStatus
} from "@/types/attendance-time/AttendanceTypes";
import useSWR from "swr";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {getColor} from "@/helper/background-color-generator/generator";
import CardTable from "@/components/common/card-view/card-table";
import {capitalize} from "lodash";
import {MajorEmployee} from "@/helper/include-emp-and-reviewr/include";

const DashboardStats = () => {
    // const {startYear, startSem} = useDashboardDate()
    const [attendanceLogs, setAttendanceLogs] = useState<AttendaceStatuses | null>(null)
    useEffect(() => {
        const logs = async () => {
            const attLogs = await fetchAttendanceData(String(`/api/admin/attendance-time/records?start=${toGMT8().subtract(1, "day").format("YYYY-MM-DD")}&end=${toGMT8().format("YYYY-MM-DD")}&all_employee=true`));
            setAttendanceLogs(attLogs.statusesByDate[toGMT8().format("YYYY-MM-DD")]);
        }
        logs()
    }, [])
    const {data: dash} = useDashboard();
    const dashboard_data = useMemo(() => {
        if (!dash) {
            return null;
        }
        return dash
    }, [dash])

    const payroll = dashboard_data?.payroll &&  dashboard_data?.payroll?.length! > 0 ? dashboard_data?.payroll : []
    const emp_percentage = ((dashboard_data?.employees_kpi.newly_hired_employees! - dashboard_data?.employees_kpi.left_employees!) / dashboard_data?.employees_kpi.total_employees! * 100)
    const presentMorning = attendanceLogs ? Object.values(attendanceLogs).flatMap(item => item).filter(presentAm => ["Morning only", "Whole Day"].includes(determineAttendance(presentAm))).length : 0
    const presentAfternoon = attendanceLogs ? Object.values(attendanceLogs).flatMap(item => item).filter(presentPm => ["Afternoon only", "Whole Day"].includes(determineAttendance(presentPm))).length : 0
    const total_present = presentMorning + presentAfternoon
    // console.log("Total: ", total_present)
    // console.log("Percentage: ", (total_present / dashboard_data?.employees_kpi.total_employees!) * 100)
    const isMorning = toGMT8().format("A") === "AM"
    const attendanceSession = isMorning ? presentMorning : presentAfternoon
    // console.log("Session: ", attendanceSession)
    const dashboardData: StatProps[] = [{
        icon: <PiUsersThree className={cn("", icon_color, icon_size)}/>,
        value: <CountUp start={0} end={dashboard_data?.employees_kpi.total_employees || 0}
                        formattingFn={(value) => compactNumber(value)}/>, // value: '500',
        title: "Total Employees",
        status: emp_percentage === 0 ? "no change" : emp_percentage > 0 ? "increment" : "decrement",
        footer: `${dashboard_data?.employees_kpi.newly_hired_employees ?? 0} new, ${dashboard_data?.employees_kpi.left_employees ?? 0} left`,
        percent: `${isNaN(emp_percentage) ? 0 : emp_percentage.toFixed(2)}`,
        chart: <PiUsersThreeLight className="size-10 text-default-400/60"/>
    }, {
        icon: <FiLogOut className={cn("", icon_color, icon_size)}/>,
        value: <CountUp start={0} end={dashboard_data?.leave_pending!} formattingFn={(value) => compactNumber(value)}/>, // value: '20',
        title: "Pending Leave Requests", // status: "decrement",
        // percent: `${((30 - data?.leaves!) / 30 * 100).toFixed(2)}`,
        footer: "Awaiting approval",
        chart: <LuPlane className="size-10 text-default-400/60"/>
    }, {
        icon: <LuCalendarX2 className={cn("", icon_color, icon_size)}/>,
        value: <CountUp start={0} end={isNaN(total_present) ? 0 : total_present}
                        formattingFn={(value) => (isNaN((value / dashboard_data?.employees_kpi.total_employees!) * 100) ? 0: (value / dashboard_data?.employees_kpi.total_employees!) * 100).toFixed(2)}/>, // value: '10',
        title: "Attendance Rate (%)",
        // status: "increment",
        percent: `${(isNaN(((attendanceSession / total_present) * 100)) ? 0 : (attendanceSession / total_present) * 100).toFixed(2)}`,
        footer: `Employees present today (${isMorning ? "Morning" : "Afternoon"})`, // chart: <PiUsersThreeLight />
        chart: <LuCalendarDays className="size-10 text-default-400/60"/>
    }, {
        icon: <TbCurrencyPeso className={cn("", icon_color, icon_size)} />,
        value: (
            <CountUp
                start={0}
                end={payroll && payroll.length > 0 && payroll[0].net_salary ? payroll[0].net_salary : 0}
                formattingFn={(value) => compactNumber(value)}
            />
        ),
        title: "Total Net Salary",
        status: payroll && payroll.length > 1
            ? payroll[0].net_salary > payroll[1].net_salary
                ? "increment"
                : payroll[0].net_salary === payroll[1].net_salary
                    ? "no change"
                    : "decrement"
            : undefined,
        percent: payroll && payroll.length > 1 && payroll[1].net_salary !== 0
            ? `${Math.abs((((payroll[0].net_salary - payroll[1].net_salary) / payroll[1].net_salary) * 100)).toFixed(2)}`
            : undefined,
        footer: payroll && payroll.length > 0 && payroll[0].payroll_date
            ? payroll[0].payroll_date
            : "-- -- --",
        chart: <LuTicket className="size-10 text-default-400/60" />
    }]
    return (<Stat data={dashboardData}/>)
}

const SalaryData = () => {
    const {data: dash} = useDashboard();
    const dashboard_data = useMemo(() => {
        if (!dash) {
            return null;
        }
        return dash
    }, [dash])

    const payroll = dashboard_data?.payroll && dashboard_data?.payroll?.length! > 0 ? dashboard_data?.payroll : []

    return (<BorderCard className='space-y-4 h-full col-span-3'
                        heading={<CountUp start={0} end={Number( payroll && payroll.length > 0 && payroll[0].gross_total_amount ? payroll[0].gross_total_amount : 0)}
                                          formattingFn={(val) => `₱${numberWithCommas(val)}`}/>}
                        subHeading={payroll && payroll.length > 0  ? `Gross Salary for this ${payroll[0]?.payroll_date}` : "No deployed payroll"}
                        classNames={{heading: "text-3xl"}}>
        <PayrollGraph payrollData={dashboard_data?.payroll || []}/>
    </BorderCard>);
}

const TopSalaries = () => {
    const fetcher = async (url: string | null) => {
        return await fetchAttendanceData(String(url));
    };

    const {
        data: attendanceData, isLoading
    } = useSWR<AttendanceData>(`/api/admin/attendance-time/records?start=${toGMT8().format("YYYY-MM-DD")}&end=${toGMT8().format("YYYY-MM-DD")}&all_employee=true`, fetcher, {
        refreshInterval: 3000,
    });

    const sortedItems = React.useMemo(() => {
        return (attendanceData?.attendanceLogs?.sort((a, b) => {
            return toGMT8(b.timestamp).diff(toGMT8(a.timestamp));
        }) ?? []);
    }, [attendanceData]);

    // const atteLogs = useMemo(() => {
    //     return attendanceData?.statusesByDate[toGMT8().format("YYYY-MM-DD")] ?? null;
    // }, [attendanceData]);
    // const presentMorning = sortedItems ? Object.values(atteLogs!).flatMap(item => item).filter(presentAm => ["Morning only", "Whole Day"].includes(determineAttendance(presentAm))).length : 0
    // const presentAfternoon = sortedItems ? Object.values(atteLogs!).flatMap(item => item).filter(presentPm => ["Afternoon only", "Whole Day"].includes(determineAttendance(presentPm))).length : 0

    const topEmp = useCallback(() => {
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

        return (

            <CardTable
                data={sortedItems.map((att) => {
                    // Retrieve the record for the specific employee and date
                    const record = attendanceData?.statusesByDate?.[toGMT8().format("YYYY-MM-DD")]?.[att.employee_id];
                    let logStatus = null;
                    const foundKey = findStatusKeyById(record || null, att.id);
                    if (record && foundKey) {
                        logStatus = record[foundKey];
                    }

                    // Find the employee and calculate the required information
                    const employee = attendanceData?.employees.find((ar) => ar.id === att.employee_id)!;
                    const status = capitalize(logStatus?.status || "Unrecognized");
                    const emp_name = getEmpFullName(employee);

                    const attSession = foundKey?.includes("a") ? "Morning" : "Afternoon";
                    // const attSession = "Morning";
                    const current = toGMT8().format("A") === "AM" ? "Morning" : "Afternoon";
                    // const current = "Morning";

                    // Filter employees based on the current session and attendance session
                    let emp: MajorEmployee | null = null;
                    if (current === "Morning" && attSession === "Morning") {
                        emp = employee;
                    } else if (current === "Afternoon" && attSession === "Afternoon") {
                        emp = employee;
                    } else {
                        emp = null; // Skip employees who don't match the session criteria
                    }
                    // If the employee is not relevant to the current session, return null to exclude
                    if (!emp) return {label: null, value: null};

                    return {
                        label: (<div className="flex flex-row items-center gap-3">
                            <Avatar alt={emp_name} src={employee.picture} size="sm"/>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm break-words text-pretty">{emp_name}</span>
                            </div>
                        </div>), value: (<Chip
                            className="rounded font-semibold text-xs"
                            style={{
                                background: getColor(status, 0.2),
                                border: getColor(status, 0.5),
                                color: getColor(status, 1),
                            }}
                        >
                            {status}
                        </Chip>),
                    };
                }).filter(Boolean) || [] /* Exclude null values from the data array */}
            />)
    }, [attendanceData, sortedItems])
    return (<div className="flex w-full flex-col mt-2 h-[500px] overflow-auto">
        {topEmp()}
    </div>)
}
export {DashboardStats, SalaryData, TopSalaries}
'use client'
import {PiUsersThree, PiUsersThreeLight} from "react-icons/pi";
import {TbCurrencyPeso} from "react-icons/tb";
import {FiLogOut} from "react-icons/fi";
import {LuCalendarDays, LuCalendarX2, LuPlane, LuTicket} from "react-icons/lu";
import {Stat, StatProps} from "@/components/statistics/Stat";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import BarChart from "@/components/common/charts/Bar";
import RadialChart from "@/components/common/charts/Radial";
import {compactNumber, getRandomInt, numberWithCommas} from "@/lib/utils/numberFormat";
import CountUp from "react-countup";
import {icon_color, icon_size} from "@/lib/utils";
import {cn, Listbox, ListboxItem, Tab, Tabs} from '@nextui-org/react'
import {ApexOptions} from "apexcharts";
import Stackedbar from "@/components/common/charts/StackBar";
import dynamic from "next/dynamic";
import Typography from "@/components/common/typography/Typography";
import {Avatar} from "@nextui-org/avatar";
import {topDepartmentList, topEmployeeList} from "@/sampleData/admin/dashboard/TopEmployeeList";
import BorderCard from "@/components/common/BorderCard";
import PayrollGraph from "@/components/admin/dashboard/payroll-graph/payroll-graph";
import {useDashboard} from "@/services/queries";
import {toGMT8} from "@/lib/utils/toGMT8";
import {fetchAttendanceData} from "@/app/(admin)/(core)/attendance-time/records/stage";
import {AttendaceStatuses, AttendanceData, determineAttendance} from "@/types/attendance-time/AttendanceTypes";

const ApexChart = dynamic(() => import("react-apexcharts"), {ssr: false});

const DashboardStats = () => {
    // const {startYear, startSem} = useDashboardDate()
    const [attendanceLogs, setAttendanceLogs] = useState<AttendaceStatuses | null>(null)
    useEffect(() => {
        const logs = async () => {
            const attLogs = await fetchAttendanceData(
                String(
                    `/api/admin/attendance-time/records?start=${toGMT8("2024-12-16").subtract(1, "day").format(
                        "YYYY-MM-DD"
                    )}&end=${toGMT8("2024-12-16").format("YYYY-MM-DD")}&all_employee=true`
                )
            );
            setAttendanceLogs(attLogs.statusesByDate[toGMT8("2024-12-16").format("YYYY-MM-DD")]);
        }
        logs()
    },[])
    const {data: dash} = useDashboard();
    const dashboard_data = useMemo(() => {
        if(!dash){
            return null;
        }
        return dash
    }, [dash])
    const data = {
        emp: 500, salary: 10000, leaves: 20, absences: 10
    }

    // console.log("Logs", {logs})
    // const stat_data = {
    //     emp_data: [
    //         {name: "1", count: getRandomInt(1, 200)}, {
    //             name: "2", count: getRandomInt(1, 200)
    //         }, {name: "3", count: getRandomInt(1, 200)},
    //         {name: "4", count: getRandomInt(1, 200)}, {
    //             name: "5", count: getRandomInt(1, 200)
    //         },{name: "1", count: getRandomInt(1, 200)}
    //
    //     ]
    // }
    // const employeesStat:BarChartProps = {
    //     data: stat_data.emp_data.map(({name, count}) => ({
    //         x: name.length > 10 ? `${name.substring(0, 7)}...` : name, y: count
    //     }))
    // }
    // const salaryStat:AreaChartProps[] = [{
    //     name: "",
    //     value: [getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000)],
    //     color: "#0088FE"
    // }]
    //
    // const leavesStat:AreaChartProps[] = [{
    //     name: "",
    //     value: [getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000)],
    //     color: "#c4005b"
    // }]
    //
    // const absencesStat:AreaChartProps[] = [{
    //     name: "",
    //     value: [getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000)],
    //     color: "#FFBB28"
    // }]

    const emp_percentage = ((dashboard_data?.employees_kpi.newly_hired_employees! - dashboard_data?.employees_kpi.left_employees!) / dashboard_data?.employees_kpi.total_employees! * 100)
    const presentMorning = attendanceLogs ? Object.values(attendanceLogs).flatMap(item => item).filter(presentAm => ["Morning only", "Whole Day"].includes(determineAttendance(presentAm))).length : 0
    const presentAfternoon = attendanceLogs ? Object.values(attendanceLogs).flatMap(item => item).filter(presentPm => ["Afternoon only", "Whole Day"].includes(determineAttendance(presentPm))).length : 0
    const total_present = presentMorning + presentAfternoon
    console.log("Total: ", total_present)
    console.log("Percentage: ", (total_present / dashboard_data?.employees_kpi.total_employees!) * 100)
    const isMorning = toGMT8().format("A") === "AM"
    const attendanceSession = isMorning ? presentMorning : presentAfternoon
    // console.log("Session: ", attendanceSession)
    const dashboardData: StatProps[] = [
        {
        icon: <PiUsersThree className={cn("", icon_color, icon_size)}/>,
        value: <CountUp start={0} end={dashboard_data?.employees_kpi.total_employees || 0} formattingFn={(value) => compactNumber(value)}/>, // value: '500',
        title: "Total Employees",
        status: emp_percentage === 0 ? "no change" : emp_percentage > 0 ? "increment" : "decrement",
        footer: `${dashboard_data?.employees_kpi.newly_hired_employees} new, ${dashboard_data?.employees_kpi.left_employees} left`,
        percent: `${emp_percentage.toFixed(2)}`,
        chart: <PiUsersThreeLight  className="size-10 text-default-400/60"/>
    }, {
        icon: <FiLogOut className={cn("", icon_color, icon_size)}/>,
        value: <CountUp start={0} end={dashboard_data?.leave_pending!} formattingFn={(value) => compactNumber(value)}/>, // value: '20',
        title: "Pending Leave Requests",
        // status: "decrement",
        // percent: `${((30 - data?.leaves!) / 30 * 100).toFixed(2)}`,
        footer: "Awaiting approval",
        chart: <LuPlane className="size-10 text-default-400/60"/>
    }, {
        icon: <LuCalendarX2 className={cn("", icon_color, icon_size)}/>,
        value: <CountUp start={0} end={isNaN(total_present) ? 0 : total_present} formattingFn={(value) => ((value / dashboard_data?.employees_kpi.total_employees!) * 100).toFixed(2)}/>, // value: '10',
        title: "Attendance Rate (%)",
        status: "increment",
        percent: `${(isNaN((attendanceSession/total_present) * 100) ? 0 : (attendanceSession/total_present) * 100).toFixed(2)}`,
        footer: `Employees present today (${isMorning ? "Morning" : "Afternoon"})`,
        // chart: <PiUsersThreeLight />
        chart: <LuCalendarDays className="size-10 text-default-400/60"/>
    }, {
        icon: <TbCurrencyPeso className={cn("", icon_color, icon_size)}/>,
        value: <CountUp start={0} end={data?.salary!} formattingFn={(value) => compactNumber(value)}/>, // value: '200000',
        title: "Total Net Salary",
        status: "decrement",
        percent: "5",
        footer: "January 1 - 15, 2025",
        chart: <LuTicket className="size-10 text-default-400/60"/>
    }]
    return (<Stat data={dashboardData}/>)
}

const LeaveData = () => {
    // const {data, isLoading} = useDashboard()
    const data = {
        leave_stats: [
            {name: "1", count: getRandomInt(1, 200)}, {
                name: "2", count: getRandomInt(1, 200)
            }, {name: "3", count: getRandomInt(1, 200)},
            {name: "4", count: getRandomInt(1, 200)}, {
                name: "5", count: getRandomInt(1, 200)
            },{name: "1", count: getRandomInt(1, 200)}, {
                name: "2", count: getRandomInt(1, 200)
            }, {name: "3", count: getRandomInt(1, 200)},
            {name: "4", count: getRandomInt(1, 200)}, {
                name: "5", count: getRandomInt(1, 200)
            },{name: "1", count: getRandomInt(1, 200)}, {
                name: "2", count: getRandomInt(1, 200)
            }, {name: "3", count: getRandomInt(1, 200)},
            {name: "4", count: getRandomInt(1, 200)}, {
                name: "5", count: getRandomInt(1, 200)
            },
        ]
    }
    const leaveData = data.leave_stats.map(({name, count}) => ({
        x: name.length > 10 ? `${name.substring(0, 7)}...` : name, y: count
    }));
    // const leaveData = React.useMemo(() => {
    //     if (!data) return []
    //     return data.leave_stats.map(({name, count}) => ({
    //         x: name.length > 10 ? `${name.substring(0, 7)}...` : name, y: count
    //     }));
    // }, [data])

    return (

        <BarChart data={leaveData!} height="100%" width="100%"/>)
}

const PayrollData = () => {
    // const {data, isLoading} = useDashboard();
    const data = {
        earnings_percentage: '10', deduction_percentage: '20',
    }

    const payrollDataChart = {
        label: ["Earnings", "Deduction"],
        value: Array.from({length: 2}, (_, index) => index === 0 ? parseInt(data?.deduction_percentage!) : parseInt(data?.earnings_percentage!))
    }
    // const payrollDataChart = React.useMemo(() => {
    //     return {
    //         label: ["Earnings", "Deduction"],
    //         value: Array.from({ length: 2 }, (_, index) => index === 0 ? parseInt(data?.deduction_percentage!) : parseInt(data?.earnings_percentage!))
    //     };
    // }, [data]);
    return (<RadialChart label={payrollDataChart.label} value={payrollDataChart.value}/>)
}
const SalaryData = () => {
    const [btnFocusThisSem, setBtnFocusThisSem] = React.useState(true);
    const [btnFocusLastSem, setBtnFocusLastSem] = React.useState(false);
    // const router = useRouter();


    const handleBtnFocusThisSem = () => {
        setBtnFocusThisSem(true);
        setBtnFocusLastSem(false);
    };

    const handleBtnFocusLastSem = () => {
        setBtnFocusThisSem(false);
        setBtnFocusLastSem(true);

    };
    const cat = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

    const data = [{
        name: "Deductions",
        value: [{
            x: "Jan", y: getRandomInt(50000, 1000000)
        }, {
            x: "Feb", y: getRandomInt(50000, 1000000)
        }, {
            x: "Mar", y: getRandomInt(50000, 1000000)
        }, {
            x: "Apr", y: getRandomInt(50000, 1000000)
        }, {
            x: "May", y: getRandomInt(50000, 1000000)
        }, {
            x: "Jun", y: getRandomInt(50000, 1000000)
        }, {
            x: "Jul", y: getRandomInt(50000, 1000000)
        }, {
            x: "Aug", y: getRandomInt(50000, 1000000)
        }, {
            x: "Sep", y: getRandomInt(50000, 1000000)
        }, {
            x: "Oct", y: getRandomInt(50000, 1000000)
        }, {
            x: "Nov", y: getRandomInt(50000, 1000000)
        }, {
            x: "Dec", y: getRandomInt(50000, 1000000)
        }],
        color: "#FE5B6E"
    },
        {
            name: "Earnings",
            value: [{
                x: "Jan", y: getRandomInt(50000, 1000000)
            }, {
                x: "Feb", y: getRandomInt(50000, 1000000)
            }, {
                x: "Mar", y: getRandomInt(50000, 1000000)
            }, {
                x: "Apr", y: getRandomInt(50000, 1000000)
            }, {
                x: "May", y: getRandomInt(50000, 1000000)
            }, {
                x: "Jun", y: getRandomInt(50000, 1000000)
            }, {
                x: "Jul", y: getRandomInt(50000, 1000000)
            }, {
                x: "Aug", y: getRandomInt(50000, 1000000)
            }, {
                x: "Sep", y: getRandomInt(50000, 1000000)
            }, {
                x: "Oct", y: getRandomInt(50000, 1000000)
            }, {
                x: "Nov", y: getRandomInt(50000, 1000000)
            }, {
                x: "Dec", y: getRandomInt(50000, 1000000)
            }],
            color: "#00C49F"
        }]

    const totalSalary = data.reduce((a, b) => a + b.value.reduce((a, b) => a + b.y, 0), 0);
    // const memoizedData = React.useMemo(() => data, []);
    return (<BorderCard className='space-y-4 h-full col-span-3'
                        heading={<CountUp start={0} end={totalSalary}
                                          formattingFn={(val) => `₱${numberWithCommas(val)}`}/>}
                        subHeading={`Gross Salary for this ${btnFocusThisSem} sem`}
                        classNames={{heading: "text-3xl"}}>
        {/*<AreaChart data={data} w="100%" h={500} style={options}/>*/}
        {/*<ApexChart type="bar" series={data.flatMap(item => item.value)} height="100%" width="100%" style={barOptions}/>*/}
        <PayrollGraph/>
    </BorderCard>);
}
const SalaryByDepartment = () => {
    const options: ApexOptions = {
        chart: {
            height: 100, stacked: true, stackType: '100%', toolbar: {
                show: false,
            },
        }, plotOptions: {
            bar: {
                horizontal: true,
            },
        }, grid: {
            show: false
        }, title: {
            text: ''
        }, stroke: {
            width: 1, colors: ['#fff']
        }, xaxis: {
            categories: [2008], labels: {
                show: false
            }
        }, yaxis: {
            show: false
        }, tooltip: {
            y: {
                formatter: function (val) {
                    return val + "K"
                }
            }
        }, fill: {
            opacity: 1

        }, legend: {
            show: false
        }
    }
    const data = [{
        name: 'Marine Sprite', data: [44]
    }, {
        name: 'Striking Calf', data: [53]
    }, {
        name: 'Tank Picture', data: [12]
    }, {
        name: 'Bucket Slope', data: [9]
    }, {
        name: 'Reborn Kid', data: [25]
    }]


    return (<Stackedbar data={data} style={options} height="100" width="100%"/>)
}

const TopSalaries = () => {

    const topEmp = useCallback(() => {
        return (<Listbox
            classNames={{
                base: "max-w-xs", list: "max-h-[300px] overflow-scroll",
            }}
            items={topEmployeeList}
            label="Assigned to"
            variant="flat"
        >
            {(item) => (<ListboxItem key={item.name} textValue={item.name}>
                <div className="flex gap-2 items-center">
                    <Avatar alt={item.name} className="flex-shrink-0" size="sm" src={item.picture}/>
                    <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col">
                            <Typography
                                className="text-small w-3/4 overflow-hidden whitespace-nowrap overflow-ellipsis">{item.name}</Typography>
                            <Typography
                                className="text-tiny text-default-400 w-3/4 overflow-hidden whitespace-nowrap overflow-ellipsis">{(item.email)}</Typography>
                        </div>
                        <Typography
                            className="text-default-400">₱<CountUp start={0} end={item.amount as number}
                                                                   formattingFn={(val) => compactNumber(val)}/></Typography>
                    </div>
                </div>
            </ListboxItem>)}
        </Listbox>)
    }, [])
    return (<div className="flex w-full flex-col mt-2">
        {topEmp()}
    </div>)
}
export {DashboardStats, LeaveData, PayrollData, SalaryData, SalaryByDepartment, TopSalaries}
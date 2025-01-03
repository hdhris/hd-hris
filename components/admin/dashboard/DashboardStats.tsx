'use client'
import {PiUsersThree, PiUsersThreeLight} from "react-icons/pi";
import {TbCurrencyPeso} from "react-icons/tb";
import {FiLogOut} from "react-icons/fi";
import {LuCalendarDays, LuCalendarX2, LuPlane, LuTicket} from "react-icons/lu";
import {Stat, StatProps} from "@/components/statistics/Stat";
import React, {useCallback, useEffect} from "react";
import BarChart, {BarChartProps} from "@/components/common/charts/Bar";
import RadialChart from "@/components/common/charts/Radial";
import {compactNumber, getRandomInt, numberWithCommas} from "@/lib/utils/numberFormat";
import CountUp from "react-countup";
import {icon_color, icon_size} from "@/lib/utils";
import {cn} from '@nextui-org/react'
import AreaChart, {AreaChartProps} from "@/components/common/charts/Area";
import {ApexOptions} from "apexcharts";
import Stackedbar from "@/components/common/charts/StackBar";
import dynamic from "next/dynamic";
import {ButtonGroup, Listbox, ListboxItem, Tab, Tabs} from "@nextui-org/react";
import Typography from "@/components/common/typography/Typography";
import {Avatar} from "@nextui-org/avatar";
import {topDepartmentList, topEmployeeList} from "@/sampleData/admin/dashboard/TopEmployeeList";
import BorderCard from "@/components/common/BorderCard";
import {Button} from "@nextui-org/button";
import AddEmployees from "@/components/admin/employeescomponent/store/AddEmployees";
import PayrollGraph from "@/components/admin/dashboard/payroll-graph/payroll-graph";
import {useDashboardDate} from "@/components/admin/dashboard/provider/DashboardProvider";
import {useDashboard} from "@/services/queries";
import {toGMT8} from "@/lib/utils/toGMT8";
import {months} from "@/lib/utils/dateFormatter";

const ApexChart = dynamic(() => import("react-apexcharts"), {ssr: false});

const DashboardStats = () => {
    const {startDate, endDate} = useDashboardDate()
    const startMonth = toGMT8(startDate!).get("month") || 0;
    const endMonth = toGMT8(endDate!).get("month") || 0;

    const salaryMonth = months.slice(startMonth, endMonth);
    const {data: dash} = useDashboard({start: startDate!, end: endDate!})
    const data = {
        emp: 500, salary: 72, leaves: 20, absences: 10
    }

    const stat_data = {
        emp_data: [
            {name: "1", count: getRandomInt(1, 200)}, {
                name: "2", count: getRandomInt(1, 200)
            }, {name: "3", count: getRandomInt(1, 200)},
            {name: "4", count: getRandomInt(1, 200)}, {
                name: "5", count: getRandomInt(1, 200)
            },{name: "1", count: getRandomInt(1, 200)}

        ]
    }
    const employeesStat:BarChartProps = {
        data: stat_data.emp_data.map(({name, count}) => ({
            x: name.length > 10 ? `${name.substring(0, 7)}...` : name, y: count
        }))
    }
    const salaryStat:AreaChartProps[] = [{
        name: "",
        value: [getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000)],
        color: "#0088FE"
    }]

    const leavesStat:AreaChartProps[] = [{
        name: "",
        value: [getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000)],
        color: "#c4005b"
    }]

    const absencesStat:AreaChartProps[] = [{
        name: "",
        value: [getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000)],
        color: "#FFBB28"
    }]
    const dashboardData: StatProps[] = [
        {
        icon: <PiUsersThree className={cn("", icon_color, icon_size)}/>,
        value: <CountUp start={0} end={data?.emp!} formattingFn={(value) => compactNumber(value)}/>, // value: '500',
        title: "New Hired Employees",
        status: "increased",
        footer: <AddEmployees />,
        percent: 3.6,
        // chart: <BarChart data={employeesStat.data}/>
        chart: <PiUsersThreeLight  className="size-10 text-default-400/60"/>
    }, {
        icon: <FiLogOut className={cn("", icon_color, icon_size)}/>,
        value: <CountUp start={0} end={data?.leaves!} formattingFn={(value) => compactNumber(value)}/>, // value: '20',
        title: "Pending Leave Requests",
        status: "decreased",
        percent: 10,
        footer: <Typography className="text-medium">Common: <span className="text-medium font-semibold">Sick Leave</span></Typography>,
        chart: <LuPlane className="size-10 text-default-400/60"/>
    }, {
        icon: <LuCalendarX2 className={cn("", icon_color, icon_size)}/>,
        value: <CountUp start={0} end={data?.absences!} formattingFn={(value) => compactNumber(value)}/>, // value: '10',
        title: "Attendance Rate (%)",
        status: "increased",
        percent: 3.6,
        footer: "Late",
        // chart: <PiUsersThreeLight />
        chart: <LuCalendarDays className="size-10 text-default-400/60"/>
    }, {
        icon: <TbCurrencyPeso className={cn("", icon_color, icon_size)}/>,
        value: <CountUp start={0} end={data?.salary!} formattingFn={(value) => String(value + "%")}/>, // value: '200000',
        title: "Active Payroll Records",
        status: "decreased",
        percent: 5,
        footer: "₱152k/₱220k",
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
                        subHeading={`Salary for ${btnFocusThisSem ? "this" : "last"} sem`}
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
    const topDep = useCallback(() => {
        return (<Listbox
            classNames={{
                base: "max-w-xs", list: "max-h-[300px] overflow-scroll",
            }}
            items={topDepartmentList}
            variant="flat"
        >
            {(item) => (<ListboxItem key={item.name} textValue={item.name}>
                <div className="flex gap-2 items-center">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: `#${item.color}`}}></span>
                    <div className="flex justify-between items-center w-full">
                        <Typography className="text-small">{item.name}</Typography>
                        <Typography
                            className="text-default-400">₱<CountUp start={0} end={item.amount as number}
                                                                   formattingFn={(val) => compactNumber(val)}/></Typography>

                    </div>
                </div>
            </ListboxItem>)}
        </Listbox>)
    }, [])
    return (<div className="flex w-full flex-col mt-2">
        <Tabs aria-label="Options">
            <Tab key="topEmployees" title="Top Employees">
                {topEmp()}
            </Tab>
            <Tab key="topDepartments" title="Top Departments">
                {topDep()}
            </Tab>
        </Tabs>
    </div>)
}
export {DashboardStats, LeaveData, PayrollData, SalaryData, SalaryByDepartment, TopSalaries}
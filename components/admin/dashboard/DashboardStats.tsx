'use client'
import {PiUsersThree} from "react-icons/pi";
import {TbCurrencyPeso} from "react-icons/tb";
import {FiLogOut} from "react-icons/fi";
import {LuCalendarX2} from "react-icons/lu";
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
import AddEmployees from "@/components/admin/add/AddEmployees";


const DashboardStats = () => {
    // const {data} = useDashboard()
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
    const dashboardData: StatProps[] = [{
        icon: <PiUsersThree className={cn("", icon_color, icon_size)}/>,
        value: <CountUp start={0} end={data?.emp!} formattingFn={(value) => compactNumber(value)}/>, // value: '500',
        title: "Employees",
        status: "increased",
        footer: <AddEmployees onEmployeeAdded={() => {alert("added")}}/>,
        percent: 3.6,
        chart: <BarChart data={employeesStat.data}/>
    }, {
        icon: <FiLogOut className={cn("", icon_color, icon_size)}/>,
        value: <CountUp start={0} end={data?.leaves!} formattingFn={(value) => compactNumber(value)}/>, // value: '20',
        title: "Leaves",
        status: "decreased",
        percent: 10,
        footer: <Typography className="text-medium">Common: <span className="text-medium font-semibold">Sick Leave</span></Typography>,
        chart: <AreaChart data={leavesStat} showTooltip={false}/>
    }, {
        icon: <LuCalendarX2 className={cn("", icon_color, icon_size)}/>,
        value: <CountUp start={0} end={data?.absences!} formattingFn={(value) => compactNumber(value)}/>, // value: '10',
        title: "Absences",
        status: "increased",
        percent: 3.6,
        footer: "Late",
        chart: <AreaChart data={absencesStat} showTooltip={false}/>
    }, {
        icon: <TbCurrencyPeso className={cn("", icon_color, icon_size)}/>,
        value: <CountUp start={0} end={data?.salary!} formattingFn={(value) => String(value + "%")}/>, // value: '200000',
        title: "Salary Breakdown",
        status: "decreased",
        percent: 5,
        footer: "₱152k/₱220k",
        chart: <AreaChart data={salaryStat} showTooltip={false}/>
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
    const options: ApexOptions = {
        chart: {
            id: "salaryData", type: "area", // Specifies the chart type as area
            fontFamily: "Inter, sans-serif", // Sets the font family for the chart
            width: cat.length * 100, dropShadow: {
                enabled: true, color: "#623CEA14", top: 10, blur: 4, left: 0, opacity: 0.1,
            }, toolbar: {
                show: false, // Hides the chart toolbar
            },
        },
        tooltip: {
            enabled: true, // Enables tooltips

            x: {
                show: false, // Hides the x-axis tooltip
            }, y: {
                formatter(val: number, opts?: any): string {
                    return `${compactNumber(val)}`
                }
            }, shared: true, // Enables shared tooltips
        },
        legend: {
            position: "top", horizontalAlign: "center", formatter(legendName: string, opts?: any): string {
                const val = opts.w.globals.series[opts.seriesIndex].reduce((a: number, b: number) => a + b, 0);
                return `<div class="flex items-center justify-center gap-2 space-x-4">
                    <div class="flex flex-col items-center justify-center">
                        <span class="inline-block w-3 h-3 rounded-full"></span>
                        <span class="text-sm">${legendName}</span>
                        <span class="text-sm font-bold underline">${compactNumber(val)}</span>
                    </div>
                </div>`;
            }
        },
        fill: {
            type: "gradient", // Specifies fill type as gradient
            gradient: {
                opacityFrom: 0.55, // Sets opacity from
                opacityTo: 0, // Sets opacity to
                shade: "#1C64F2", // Sets the shade color
                gradientToColors: ["#1C64F2"], // Sets gradient to colors
            },
        },
        dataLabels: {
            enabled: false, // Disables data labels
        },
        markers: {
            size: 4,
            colors: "#fff",
            strokeColors: ["#FE5B6E", "#00C49F"],
            strokeWidth: 3,
            strokeOpacity: 0.9,
            strokeDashArray: 0,
            fillOpacity: 1,
            discrete: [],
            hover: {
                size: undefined, sizeOffset: 5,
            },
        },
        stroke: {
            width: [2, 2], // Sets the stroke width
            curve: "smooth", // Sets the stroke curve to smooth
        },
        grid: {
            show: true, // Hides the grid lines
            strokeDashArray: 4, // Sets the stroke dash array
            position: "back", // Sets the grid lines position to back
            padding: {
                left: 10, right: 10,
            }, xaxis: {
                lines: {
                    show: false
                }
            }, yaxis: {
                lines: {
                    show: true
                }
            }

        },
        xaxis: {
            categories: cat, // Specifies categories for x-axis
            labels: {
                show: true,

            }, axisBorder: {
                show: false, // Hides x-axis border
            }, axisTicks: {
                show: false, // Hides x-axis ticks
            }, tooltip: {
                enabled: false, // Disables x-axis tooltip
            }
        },
        yaxis: {
            show: true, labels: {
                formatter(val: number, opts?: any): string | string[] {
                    return `${compactNumber(val)}`
                }
            }

        }
    };

    const data: AreaChartProps[] = [{
        name: "Deductions",
        value: [getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000)],
        color: "#FE5B6E"
    },
        {
            name: "Earnings",
            value: [getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000), getRandomInt(50000, 1000000)],
            color: "#00C49F"
        }]

    const totalSalary = data.reduce((a, b) => a + b.value.reduce((a, b) => a + b, 0), 0);
    // const memoizedData = React.useMemo(() => data, []);
    return (<BorderCard className='space-y-4 h-full col-span-3'
                        heading={<CountUp start={0} end={totalSalary}
                                          formattingFn={(val) => `₱${numberWithCommas(val)}`}/>}
                        subHeading={`Salary for ${btnFocusThisSem ? "this" : "last"} sem`}
                        classNames={{heading: "text-3xl"}}
                        endContent={<ButtonGroup radius="sm" variant="ghost">
                            <Button color="primary" variant={btnFocusLastSem ? "flat" : "light"} onClick={handleBtnFocusLastSem}>Last Sem</Button>
                            <Button color="primary" variant={btnFocusThisSem ? "flat" : "light"} onClick={handleBtnFocusThisSem}>This Sem</Button>
                        </ButtonGroup>}>
        <AreaChart data={data} w="100%" h={500} style={options}/>
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
import React from 'react';

import {ApexOptions} from "apexcharts";
import dynamic from "next/dynamic";
import {compactNumber, getRandomInt, numberWithCommas} from '@/lib/utils/numberFormat';
import {PayrollKPI} from "@/types/dashboard/stats-types";


const ApexChart = dynamic(() => import("react-apexcharts"), {ssr: false});

function PayrollGraph({payrollData}: {payrollData: PayrollKPI[]}) {
    const cat = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    // const match = payrollData..match(/\d{2} - \d{2}/);
    //
    // if (match) {
    //     const dateRange = match[0]; // Extracted "01 - 15"
    //     console.log(dateRange);
    // }


    const series = payrollData && payrollData.length > 0 ? payrollData.flatMap((item) => [
        {
            name: `Deductions ${item.payroll_date}`,
            group: "deductions",
            color: "#FE5B6E",
            data: cat.map((month) => {
                return {
                    x: month,
                    y: cat[item.month] === month ? item.deduction_total_amount : 0,
                };
            }),
        },
        {
            name: `Earnings ${item.payroll_date}`,
            group: "earnings",
            color: "#00C49F",
            data: cat.map((month) => {
                return {
                    x: month,
                    y: cat[item.month] === month ? item.gross_total_amount : 0,
                };
            }),
        },
    ]) : [];
    console.log({series})
    const options: ApexOptions = {
        // colors: ["#FE5B6E", "#00C49F", "#00C49F", "#FE5B6E"],
        series: series, chart: {
            type: "bar", height: "320px", fontFamily: "Inter, sans-serif", stacked: true, toolbar: {
                show: false,
            },
        }, plotOptions: {
            bar: {
                // isFunnel3d: true, // horizontal: false,
                // columnWidth: "70%",
                // borderRadiusApplication: "end",
                // borderRadius: 8,
                // borderRadiusWhenStacked: "all",
                horizontal: false, columnWidth: "75%",
            },
        }, tooltip: {
            shared: true, intersect: false, style: {
                fontFamily: "Inter, sans-serif",
            }, x: {
                show: false
            },

        }, states: {
            hover: {
                filter: {
                    type: "darken", value: 1,
                },
            },
        }, stroke: {
            show: true, width: 0, colors: ["transparent"],
        }, grid: {
            show: true, strokeDashArray: 4, padding: {
                top: -14
            },
        }, dataLabels: {
            enabled: false
        }, legend: {
            show: false,
        }, xaxis: {
            categories: cat,
            floating: false,
            labels: {
                show: true, style: {
                    fontFamily: "Inter, sans-serif", cssClass: 'text-sm font-bold fill-gray-500 dark:fill-gray-400'
                }
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        }, yaxis: {
            show: true, labels: {
                show: true, style: {
                    fontFamily: "Inter, sans-serif", cssClass: 'text-sm font-bold fill-gray-500 dark:fill-gray-400'
                }, formatter: (value) => {
                    return `${numberWithCommas(value)}`
                },
            }
        }, fill: {
            opacity: 1,
        },
    }
    return (<ApexChart options={options} series={options.series} type="bar" width="100%" height="100%"/>);
}

export default PayrollGraph;
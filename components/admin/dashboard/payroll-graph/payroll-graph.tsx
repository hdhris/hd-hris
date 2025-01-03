import React from 'react';

import {ApexOptions} from "apexcharts";
import dynamic from "next/dynamic";
import {getRandomInt, numberWithCommas} from '@/lib/utils/numberFormat';


const ApexChart = dynamic(() => import("react-apexcharts"), {ssr: false});
function PayrollGraph() {
    const options: ApexOptions = {
        // colors: ["#FE5B6E", "#00C49F"],
        series: [
            {
                name: "Deductions",
                color: "#FE5B6E",
                data: [{
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
            },
            {
                name: "Earnings",
                color: "#00C49F",
                data: [{
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
            },
        ],
        chart: {
            type: "bar",
            height: "320px",
            fontFamily: "Inter, sans-serif",
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                // horizontal: false,
                // columnWidth: "70%",
                // borderRadiusApplication: "end",
                // borderRadius: 8,
                horizontal: false, columnWidth: "50%", borderRadiusApplication: "end", borderRadius: 5,
            },
        },
        tooltip: {
            shared: true, intersect: false, style: {
                fontFamily: "Inter, sans-serif",
            }, x: {
                show: false
            },

        },
        states: {
            hover: {
                filter: {
                    type: "darken",
                    value: 1,
                },
            },
        },
        stroke: {
            show: true,
            width: 0,
            colors: ["transparent"],
        },
        grid: {
            show: true, strokeDashArray: 4, padding: {
                top: -14
            },
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: false,
        },
        xaxis: {
            floating: false,
            labels: {
                show: true,
                style: {
                    fontFamily: "Inter, sans-serif",
                    cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
                }
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            show: true,
            labels: {
                show: true,
                style: {
                    fontFamily: "Inter, sans-serif",
                    cssClass: 'text-xs fill-gray-500 dark:fill-gray-400',
                    fontSize: "10px",
                    fontWeight: "bold"
                },
                formatter: (value) => { return `${numberWithCommas(value)}` },
            }
        },
        fill: {
            opacity: 1,
        },
    }
    return (
        <ApexChart options={options} series={options.series} type="bar" width="100%" height="100%"/>
    );
}

export default PayrollGraph;
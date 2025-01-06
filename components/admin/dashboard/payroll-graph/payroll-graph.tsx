import React from 'react';

import {ApexOptions} from "apexcharts";
import dynamic from "next/dynamic";
import {compactNumber, getRandomInt, numberWithCommas} from '@/lib/utils/numberFormat';


const ApexChart = dynamic(() => import("react-apexcharts"), {ssr: false});

function PayrollGraph() {
    const options: ApexOptions = {
        colors: ["#FE5B6E", "#00C49F", "#00C49F", "#FE5B6E"], series: [{
            name: "Deductions 1-16", group: "deductions", data: [{
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
        }, {
            name: "Earnings 1-16", group: "earnings", data: [{
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
        }, {
            name: "Deductions 17-30", group: "deductions", data: [{
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
        }, {
            name: "Earnings 17-30", group: "earnings", data: [{
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
        },], chart: {
            type: "bar", height: "320px", fontFamily: "Inter, sans-serif", stacked: true, toolbar: {
                show: false,
            },
        }, plotOptions: {
            bar: {
                isFunnel3d: true, // horizontal: false,
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
            show: true,
        }, xaxis: {
            // categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
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
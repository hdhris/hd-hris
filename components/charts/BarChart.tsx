'use client'
import React from "react";

import dynamic from "next/dynamic";
import {ApexOptions} from "apexcharts";

const ApexChart = dynamic(() => import("react-apexcharts"), {ssr: false});

interface BarChartProps {
    color?: string,
    data: {
        x: string
        y: number | number[]
    }[],
    width?: number | string,
    height?: number | string,
    style?: ApexOptions
}

export default function BarChart({color, data, height, width, style}: BarChartProps) {
    const option: ApexOptions = {
        chart: {
            fontFamily: "Inter, sans-serif", toolbar: {
                show: false,
            },

            // events.jsx: {
            //     click: function(chart, w, e) {
            //         console.log(chart)
            //     }
            // }
        }, plotOptions: {
            bar: {
                horizontal: false, columnWidth: "50rem",

                borderRadiusApplication: "end", borderRadius: 2,
            },

        }, tooltip: {
            shared: true, intersect: false, style: {
                fontFamily: "Inter, sans-serif",
            }, x: {
                show: false
            }, custom: function ({series, seriesIndex, dataPointIndex, w}) {
                const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
                // return "Value: <b>" + data.y + "</b><br> Percentage: "
                const percent = (data.y / w.globals.seriesTotals[seriesIndex]) * 100
                return `<Card radius="sm">
                            <CardBody>
                                <div class="p-2 flex items-center bg-">
                                    <div class="h-5 w-5 rounded-full" style="background-color: ${w.globals.colors[seriesIndex]}"></div>
                                    <div class="p-2">
                                        <Text>Name: <b>${data.x}</b></Text>
                                        <br/>
                                        <Text>Count: <b>${data.y}</b></Text>
                                        <br/>
                                        <Text>Percentage: <b>${percent.toFixed(2)} % </b></Text>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>`
            }

        },

        states: {
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
            enabled: false,
        }, legend: {
            show: false,
        }, xaxis: {
            floating: false, labels: {
                show: true, style: {
                    fontFamily: "Inter, sans-serif", cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
                }
            }, axisBorder: {
                show: false,
            }, axisTicks: {
                show: false,
            },
        }, yaxis: {
            show: false,
        }, fill: {
            opacity: 1,
        },
    }

    const series: ApexOptions["series"] = [{
        color: color ? color : "#16BDCA", data: data
    },]

    return (<>
        <ApexChart type="bar" options={style ? style : option} series={series} height={height ? height : "100%"}
                   width={width ? width : "100%"}/>
    </>)
}


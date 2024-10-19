'use client'
import React from 'react';
import dynamic from "next/dynamic";
import {ApexOptions} from "apexcharts";

const ApexChart = dynamic(() => import("react-apexcharts"), {ssr: false});

export type AreaChartProps = {
    name: string; value: number[]; color: string;
}


function AreaChart({data, h = "auto", w = "100%", category, style, showTooltip = true}: {
    data: AreaChartProps[],
    h?: number | string,
    w?: number | string,
    category?: string[],
    style?: ApexOptions
    showTooltip?: boolean
}) {
    const series: ApexOptions["series"] = data.map(item => ({name: item.name, data: item.value, color: item.color}));
    const option: ApexOptions = {
        chart: {
            type: "area", fontFamily: "Inter, sans-serif", dropShadow: {
                enabled: false,
            }, toolbar: {
                show: false,
            },
        }, tooltip: {
            enabled: showTooltip,
            x: {
                show: false,
            },
        }, legend: {
            horizontalAlign: "center",
        }, fill: {
            type: "gradient", gradient: {
                opacityFrom: 0.55, opacityTo: 0, shade: "#1C64F2", gradientToColors: ["#1C64F2"],
            },
        }, dataLabels: {
            enabled: false,
        },
        // markers: {
        //     size: 4,
        //     colors: "#fff",
        //     strokeColors: data.find(color => color.color)?.color,
        //     strokeWidth: 3,
        //     strokeOpacity: 0.9,
        //     strokeDashArray: 0,
        //     fillOpacity: 1,
        //     discrete: [],
        //     hover: {
        //         size: undefined, sizeOffset: 5,
        //     },
        // },
        stroke: {
            width: 2, curve: "smooth",
        }, grid: {
            show: false, strokeDashArray: 4, padding: {
                left: 10, right: 2, top: -26
            },
        },

        xaxis: {
            categories: category, labels: {
                show: false,

            }, axisBorder: {
                show: false,
            }, axisTicks: {
                show: false,
            }, tooltip: {
                enabled: false
            }
        }, yaxis: {
            show: false, labels: {
                formatter: function (value) {
                    const totalValue = data
                        .map(item => item.value)
                        .flat()
                        .filter(val => !isNaN(val))
                        .reduce((acc, val) => acc + val, 0);
                    const percentage = (value / totalValue) * 100
                    return "Total: " + value + " - " + percentage.toFixed(2) + "%";
                }
            }
        }
    }

    return (<ApexChart options={style ? style : option} series={series} type="area"
                       height={h}
                       width={w}/>);
}

export default AreaChart;
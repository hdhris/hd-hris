'use client'
import React from "react";

import dynamic from "next/dynamic";
import {ApexOptions} from "apexcharts";
import {Spinner} from "@nextui-org/react";

const ApexChart = dynamic(() => import("react-apexcharts"), {ssr: false});

interface RadialChartProps{
        color?: string[]
        label: string[]
        value: number[]
}
export default function RadialChart({color, label, value}: RadialChartProps) {
    const option: ApexOptions = {
        colors: color ? color : ["#1C64F2", "#16BDCA"],
            chart: {
            type: "radialBar",
                sparkline: {
                enabled: true,
            },
        },
        plotOptions: {
            radialBar: {
                track: {
                    background: '#E5E7EB',
                },
                dataLabels: {
                    show: false,
                },
                hollow: {
                    margin: 0,
                        size: "32%",
                }
            },
        },
        grid: {
            show: false,
                strokeDashArray: 4,
                padding: {
                left: 2,
                    right: 2,
                    top: -23,
                    bottom: -20,
            },
        },
        labels: label,
            legend: {
            show: true,
                position: "bottom",
                fontFamily: "Inter, sans-serif",
        },
        tooltip: {
            enabled: true,
            x: {
                show: false,
            },
        },
        yaxis: {
            show: false,
            labels: {
                formatter: function (value) {
                    return value + '%';
                }
            }
        }
    }

    return (
        <>
            <ApexChart options={option} series={value}  type="radialBar" height="118%" width='100%'/>
        </>
    )
}
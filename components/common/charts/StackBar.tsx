'use client'
import React from "react";

import dynamic from "next/dynamic";
import {ApexOptions} from "apexcharts";

const ApexChart = dynamic(() => import("react-apexcharts"), {ssr: false});

interface BarChartProps {
    color?: string,
    data: ApexAxisChartSeries,
    width?: number | string,
    height?: number | string,
    style?: ApexOptions
}

export default function Stackedbar({ data, height, width, style}: BarChartProps) {
    const option: ApexOptions = {
        chart: {
            type: 'bar', height: 350, stacked: true, stackType: '100%',
            toolbar: {
                show: false,
            },
        }, plotOptions: {
            bar: {
                horizontal: true,
            },
        }, stroke: {
            width: 1, colors: ['#fff']
        }, title: {
            text: '100% Stacked Bar'
        }, xaxis: {
            categories: [2008, 2009, 2010, 2011, 2012, 2013, 2014],
        }, tooltip: {
            y: {
                formatter: function (val) {
                    return val + "K"
                }
            }
        }, fill: {
            opacity: 1

        }, legend: {
            position: 'top', horizontalAlign: 'left', offsetX: 40
        }
    }


    return (<>
        <ApexChart type="bar" options={style ? style : option} series={data} height={height ? height : "100%"}
                   width={width ? width : "100%"}/>
    </>)
}


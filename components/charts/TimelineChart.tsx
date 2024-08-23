"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import moment from "moment";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface TimelineProps {
  data: {
    x: string;
    y: number[];
  }[];
  width?: number | string;
  height?: number | string;
  customOptions?: ApexOptions;
}

export default function Timeline({
  data,
  height,
  width,
  customOptions,
}: TimelineProps) {
  const series = [{ data }];

  const defaultOptions: ApexOptions = {
    chart: {
      height: 350,
      type: "rangeBar",
      toolbar: {
        show: false, // This will hide the buttons on top
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        dataLabels: {
          hideOverflowingLabels: false,
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        const [start, end] = val as [number, number];
        const startTime = moment(start).format("h:mm A");
        const endTime = moment(end).format("h:mm A");
        return `${startTime} - ${endTime}`;
      },
      style: {
        colors: ["#f3f4f5", "#fff"],
      },
    },
    xaxis: {
      type: "datetime",
      min: new Date("2023-01-01 05:00:00").getTime(), // Start time at 5 AM
      max: new Date("2023-01-01 20:00:00").getTime(), // End time at 8 PM
    },
    yaxis: {
      show: true,
    },
    grid: {
      row: {
        colors: ["#f3f4f5", "#fff"],
        opacity: 1,
      },
    },
  };

  const options = customOptions || defaultOptions;

  return (
    <ApexChart
      type="rangeBar"
      options={options}
      series={series}
      height={height || "100%"}
      width={width || "100%"}
    />
  );
}

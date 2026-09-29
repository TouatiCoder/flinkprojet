import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const ChartTwoHome: React.FC = () => {
  const options: ApexOptions = {
    colors: ["#465FFF", "#E1E5FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 280,
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 8,
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ["Jan", "Mar", "May", "Jul", "Sep", "Nov"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      min: 0,
      max: 10,
      tickAmount: 5,
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    grid: {
      strokeDashArray: 5,
      borderColor: "#E5E7EB",
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    legend: {
      show: false,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function ({ dataPointIndex, w }) {
        const rev = [4.1, 2.2, 1.0, 3.4, 1.8, 2.8][dataPointIndex];
        const trans = [320, 410, 150, 235, 180, 290][dataPointIndex];
        return (
          '<div class="flex flex-col p-4 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 min-w-[200px]">' +
          '<div class="text-sm font-semibold text-gray-800 dark:text-white mb-3">' +
          w.globals.labels[dataPointIndex] +
          " 2024</div>" +
          '<div class="flex items-center justify-between mb-2">' +
          '<div class="flex items-center gap-2">' +
          '<span class="w-2.5 h-2.5 rounded-full bg-[#E1E5FF]"></span>' +
          '<span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Transaction</span>' +
          '</div>' +
          '<span class="text-xs font-bold text-gray-900 dark:text-white">' + trans + '</span>' +
          "</div>" +
          '<div class="flex items-center justify-between">' +
          '<div class="flex items-center gap-2">' +
          '<span class="w-2.5 h-2.5 rounded-full bg-[#465FFF]"></span>' +
          '<span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Revenue</span>' +
          '</div>' +
          '<span class="text-xs font-bold text-gray-900 dark:text-white">$' + rev + 'k</span>' +
          "</div>" +
          "</div>"
        );
      },
    },
  };

  const series = [
    {
      name: "Total Revenue",
      data: [5.5, 2.5, 1.2, 5.2, 2.0, 3.2],
    },
    {
      name: "Total Transaction",
      data: [4.0, 5.2, 3.0, 4.0, 4.2, 5.0],
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Performance Overview
        </h3>
        <button className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:hover:text-white/90 underline decoration-gray-300 dark:decoration-gray-700 underline-offset-4 transition-colors">
          View All
        </button>
      </div>

      <div className="-ml-4 -mt-2">
        <Chart options={options} series={series} type="bar" height={280} />
      </div>
    </div>
  );
};

export default ChartTwoHome;

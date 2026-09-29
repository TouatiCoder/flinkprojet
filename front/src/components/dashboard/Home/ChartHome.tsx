import { useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function ChartHome() {
  const [activeTab, setActiveTab] = useState("Users");

  const options: ApexOptions = {
    legend: { show: false },
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 180,
      type: "area",
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: [2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
    xaxis: {
      type: "category",
      categories: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#6B7280" },
      },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
        formatter: (val) => {
          if (val === 0) return "0";
          return `${val / 1000}k`;
        },
      },
      title: { text: "" },
    },
  };

  const dataMap: Record<string, number[]> = {
    "Users": [5000, 7500, 11000, 3000, 14000, 6000, 10000],
    "Compte Pro": [3000, 4000, 8000, 2000, 9000, 4000, 7000],
    "Annonces": [1000, 2000, 5000, 1000, 6000, 2000, 4000],
  };

  const series = [
    {
      name: activeTab,
      data: dataMap[activeTab],
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Sales Overview
        </h3>
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl dark:bg-white/[0.05]">
          {["Users", "Compte Pro", "Annonces"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm dark:bg-white/10 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab === "Users" && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${activeTab === tab ? "text-gray-900 dark:text-white" : "text-gray-400"}`}
                >
                  <path
                    d="M12 4.5C7.5 4.5 3.737 7.253 2 12c1.737 4.747 5.5 7.5 10 7.5s8.263-2.753 10-7.5c-1.737-4.747-5.5-7.5-10-7.5zm0 12c-2.481 0-4.5-2.019-4.5-4.5S9.519 7.5 12 7.5s4.5 2.019 4.5 4.5-2.019 4.5-4.5 4.5zm0-7.5c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-full custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="area" height={180} />
        </div>
      </div>
    </div>
  );
}

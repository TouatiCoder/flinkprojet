import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const ChartColor: React.FC = () => {
  const series = [50, 60, 45];
  
  const options: ApexOptions = {
    chart: {
      type: "pie",
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#22C55E", "#3B82F6", "#FACC15"],
    labels: ["Completed", "Inprogress", "Pending"],
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      colors: ["#ffffff"],
      width: 4,
    },
    tooltip: {
      enabled: true,
      theme: "light",
      y: {
        formatter: function(val) {
          return val + "%";
        }
      }
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center gap-2 mb-6">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-500 dark:text-gray-400"
        >
          <rect x="3" y="4" width="7" height="16" rx="1.5" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="4" width="7" height="16" rx="1.5" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Overall Progress
        </h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
        <div className="flex justify-center">
          <Chart options={options} series={series} type="pie" width={200} />
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-[#22C55E]"></span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-0.5">50%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-none">Completed</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-[#3B82F6]"></span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-0.5">60%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-none">Inprogress</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FACC15]"></span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-0.5">45%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-none">Pending</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartColor;

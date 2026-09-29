import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface StatItem {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  percentage?: string;
  isPositive?: boolean;
  iconBgClass?: string;
  trendColorClass?: string;
}

interface StatCardsProps {
  items: StatItem[];
}

export default function StatCardUser({ items }: StatCardsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = direction === "left" ? -280 : 280;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative mb-6 group">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hidden sm:flex"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2 pt-2 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, index) => {
          const trendColor =
            item.trendColorClass ??
            (item.isPositive === true
              ? "text-green-500"
              : item.isPositive === false
              ? "text-red-500"
              : "text-gray-400");

          const trendArrow = item.isPositive === false ? "↘" : "↗";

          return (
            <div
              key={index}
              className="flex items-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 min-w-[240px] sm:min-w-[260px] shrink-0 snap-start"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full text-white mr-3 shrink-0 [&_svg]:text-white [&_path]:fill-white ${
                  item.iconBgClass ?? "bg-gray-400"
                }`}
              >
                {item.icon}
              </div>

              <div className="flex flex-col min-w-0">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight truncate">
                  {item.value}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                  {item.title}
                </p>
                {item.percentage && (
                  <p className={`text-[11px] mt-0.5 font-medium ${trendColor}`}>
                    {trendArrow} {item.percentage}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
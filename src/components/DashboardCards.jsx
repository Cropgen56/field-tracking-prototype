import React from "react";
import ndviIcon from "../assets/ndvi-graph.png";
import areaIcon from "../assets/area.png";
import healthyIcon from "../assets/healthy.png";
import warningIcon from "../assets/warning.png";
import { useFieldData } from "../context/FieldDataContext";

export default function DashboardCards() {
  const { fieldData } = useFieldData();

  // 1) When nothing is active on the map -> hide all four cards
  if (!fieldData || !fieldData.dashboardData) return null;

  const data = fieldData.dashboardData;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full">
      {/* Avg NDVI */}
      <div className="bg-[#0C2214] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:px-6 md:py-6 shadow-xl flex items-center justify-between">
        <div className="flex flex-col justify-evenly h-full">
          <p className="text-gray-400 text-xs sm:text-sm md:text-[16px] font-medium mb-2 sm:mb-3">
            Avg. NDVI Value
          </p>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <p className="text-white text-base sm:text-lg md:text-xl font-semibold leading-none">
              {data.avgNDVI.value}
            </p>
            <span
              className={`text-${
                data.avgNDVI.positive ? "green" : "red"
              }-400 text-[10px] sm:text-[11px] md:text-[12px] font-medium leading-none whitespace-nowrap`}
            >
              {data.avgNDVI.positive ? "↑" : "↓"}{" "}
              {data.avgNDVI.positive ? "+" : ""}
              {data.avgNDVI.change}%
            </span>
          </div>
        </div>
        <img
          src={ndviIcon}
          alt="ndvi graph icon"
          className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
        />
      </div>

      {/* Total Area */}
      <div className="bg-[#0C2214] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:px-6 md:py-6 shadow-xl flex items-center justify-between">
        <div className="flex flex-col justify-evenly h-full">
          <p className="text-gray-400 text-xs sm:text-sm md:text-[16px] font-medium mb-2 sm:mb-3">
            Total Area
          </p>
          <div className="flex-col">
            <p className="text-white text-base sm:text-lg md:text-xl font-semibold leading-none">
              {data.totalArea.toFixed(2)}
            </p>
            <span className="text-green-400 text-[10px] sm:text-[11px] md:text-[12px] leading-none">
              Hectares
            </span>
          </div>
        </div>
        <img
          src={areaIcon}
          alt="area icon"
          className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
        />
      </div>

      {/* Healthy Farms */}
      <div className="bg-[#0C2214] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:px-6 md:py-6 shadow-xl flex items-center justify-between">
        <div className="flex flex-col justify-evenly h-full">
          <p className="text-gray-400 text-xs sm:text-sm md:text-[16px] font-medium mb-2 sm:mb-3">
            Healthy Farms
          </p>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <p className="text-white text-base sm:text-lg md:text-xl font-semibold leading-none">
              {data.healthyFarms.healthy}
            </p>
            <span className="text-green-400 text-[10px] sm:text-[11px] md:text-[12px] leading-none">
              of {data.healthyFarms.total}
            </span>
          </div>
        </div>
        <img
          src={healthyIcon}
          alt="healthy farm icon"
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
        />
      </div>

      {/* Low Index Farms */}
      <div className="bg-[#0C2214] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:px-6 md:py-6 shadow-xl flex items-center justify-between">
        <div className="flex flex-col justify-evenly h-full">
          <p className="text-gray-400 text-xs sm:text-sm md:text-[16px] font-medium mb-2 sm:mb-3">
            Low Index Farms
          </p>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <p className="text-white text-base sm:text-lg md:text-xl font-semibold leading-none">
              {data.lowIndexFarms}
            </p>
            <span className="text-green-400 text-[10px] sm:text-[11px] md:text-[12px] leading-none">
              Need Attention
            </span>
          </div>
        </div>
        <img
          src={warningIcon}
          alt="warning icon"
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
        />
      </div>
    </div>
  );
}

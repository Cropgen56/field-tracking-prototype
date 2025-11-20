import React, { useState } from "react";
import wheatCrop from "../assets/cropimage.png";
import SoilHealthChart from "./crophealth/SoilHealthChart";

export default function SoilHealth() {
  const [autoDetectCrop, setAutoDetectCrop] = useState(true);

  const soilNutrients = [
    { symbol: "P", label: "Nitrogen", thisYear: 25.4, lastYear: 20.6 },
    { symbol: "Mg", label: "Phosphorous", thisYear: 8.1, lastYear: 7.5 },
    { symbol: "K", label: "Potassium", thisYear: 10.4, lastYear: 8.1 },
  ];

  const maxNutrientValue = Math.max(
    ...soilNutrients.flatMap((n) => [n.thisYear, n.lastYear])
  );

  return (
    <div className="bg-[#0C2214] rounded-xl p-4 sm:p-5 md:px-8 md:py-5 text-white">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-5">
        <h1 className="text-lg sm:text-xl font-bold">Crop Health</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs">Auto-Detect Major Crop</span>
          <label className="relative inline-block w-11 h-5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoDetectCrop}
              onChange={(e) => setAutoDetectCrop(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`absolute inset-0 rounded-full transition-colors ${
                autoDetectCrop ? "bg-green-500" : "bg-gray-700"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                  autoDetectCrop ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </span>
          </label>
        </div>
      </div>

      {/* Crop Info Section */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mb-4 sm:mb-6">
        {/* Crop Image */}
        <img
          src={wheatCrop}
          alt="Wheat Crop"
          className="w-full sm:w-[140px] md:w-[160px] h-[120px] sm:h-[140px] md:h-[160px] rounded-lg object-cover border border-white/10"
        />

        {/* Crop Details */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 sm:gap-y-2 mb-3">
            <div className="text-xs sm:text-sm">
              <p>Major Crop :- Wheat</p>
              <p className="mt-1 sm:mt-2">Total Area :- 1.5 Acre</p>
              <p className="mt-1 sm:mt-2 text-xs font-semibold text-gray-300">
                Overall Crop Health
              </p>
            </div>
            <div className="text-xs sm:text-sm">
              <p>Crop Age :- 15 days</p>
              <p className="mt-1 sm:mt-2">Standard Yield Data :- 460.00 kg/acre</p>
            </div>
          </div>

          {/* Crop Health Status & Progress Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold">60%</span>
              <span className="text-[10px] text-gray-400 hidden sm:inline">
                No Precipitation within the Hour
              </span>
            </div>
            <span className="bg-white text-yellow-600 px-3 sm:px-4 py-1 rounded-md text-xs font-medium">
              Normal
            </span>
          </div>
          <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 w-[60%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Soil Analysis & Soil Health Grid */}
      <div className="mt-6 sm:mt-8 md:mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-14">
        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Soil analysis</h2>

          {/* Legend */}
          <div className="flex gap-4 sm:gap-8 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-[#4ADE80] rounded" />
              <span className="text-[10px] sm:text-[11px] text-gray-300">This year</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-[#B6F152] rounded" />
              <span className="text-[10px] sm:text-[11px] text-gray-300">Last Year</span>
            </div>
          </div>

          {/* Nutrients */}
          {soilNutrients.map((nutrient) => (
            <div key={nutrient.symbol} className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#73E21D] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0">
                {nutrient.symbol}
              </div>

              <div className="w-full">
                <p className="text-xs sm:text-sm mb-2">{nutrient.label}</p>

                <div className="flex items-center gap-2 mb-1">
                  <div className="relative h-1 w-full bg-white/10 rounded-sm">
                    <div
                      className="absolute h-full bg-[#4ADE80] rounded-sm"
                      style={{ width: `${(nutrient.thisYear / maxNutrientValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs opacity-80 whitespace-nowrap">
                    {nutrient.thisYear}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative h-1 w-full bg-white/10 rounded-sm">
                    <div
                      className="absolute h-full bg-[#B6F152] rounded-sm"
                      style={{ width: `${(nutrient.lastYear / maxNutrientValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs opacity-80 whitespace-nowrap">
                    {nutrient.lastYear}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Soil Health</h2>
          <SoilHealthChart />
        </div>
      </div>
    </div>
  );
}
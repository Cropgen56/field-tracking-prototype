import React from "react";

const NutrientBar = ({ label, symbol, current, required, colorCurrent, colorRequired }) => {
  const max = Math.max(current, required, 1);
  const currentWidth = `${(current / max) * 100}%`;
  const requiredWidth = `${(required / max) * 100}%`;

  return (
    <div className="flex items-center gap-2 mb-3 rounded-lg p-2 ">
      <div className="w-7 h-7 bg-cg-accent rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-green-900 font-bold text-xs">
          {symbol}
        </span>
      </div>
      <div className="flex-1">
        <span className="block text-xs font-semibold text-white mb-1">
          {label}
        </span>
        <div className=" h-1.5 rounded-full mb-1 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ backgroundColor: colorCurrent, width: currentWidth }}
          />
        </div>
        <div className=" h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ backgroundColor: colorRequired, width: requiredWidth }}
          />
        </div>
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <span className="text-xs font-bold text-white">{`${current} kg/acre`}</span>
        <span className="text-xs font-medium text-cg-muted">{`${required} kg/acre`}</span>
      </div>
    </div>
  );
};

const SoilAnalysisChart = () => {
  // Static nutrient data
  const nutrientData = [
    { symbol: "N", label: "Nitrogen", current: 35, required: 50 },
    { symbol: "P", label: "Phosphorus", current: 20, required: 30 },
    { symbol: "K", label: "Potassium", current: 150, required: 180 },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-end items-center mb-3">
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-green-600 rounded-sm mr-1.5" />
          <span className="text-xs text-cg-muted">
            Current Level
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-lime-400 rounded-sm mr-1.5" />
          <span className="text-xs text-cg-muted">
            Recommended
          </span>
        </div>
      </div>

      {nutrientData.map((item) => (
        <NutrientBar
          key={item.symbol}
          label={item.label}
          symbol={item.symbol}
          current={item.current}
          required={item.required}
          colorCurrent="#36A534"
          colorRequired="#C4E930"
        />
      ))}
    </div>
  );
};

export default SoilAnalysisChart;
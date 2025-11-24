import React, { useMemo, useRef, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useFieldData } from "../context/FieldDataContext";
import { Info } from "lucide-react";

const defaultData = [
  { date: "Day 1", "2025": 0.45, "2024": 0.42 },
  { date: "Day 2", "2025": 0.47, "2024": 0.43 },
  { date: "Day 3", "2025": 0.49, "2024": 0.44 },
  { date: "Day 4", "2025": 0.51, "2024": 0.46 },
  { date: "Day 5", "2025": 0.52, "2024": 0.48 },
  { date: "Day 6", "2025": 0.54, "2024": 0.49 },
  { date: "Day 7", "2025": 0.56, "2024": 0.51 },
  { date: "Day 8", "2025": 0.58, "2024": 0.52 },
  { date: "Day 9", "2025": 0.60, "2024": 0.54 },
  { date: "Day 10", "2025": 0.62, "2024": 0.55 },
  { date: "Day 11", "2025": 0.63, "2024": 0.57 },
  { date: "Day 12", "2025": 0.64, "2024": 0.58 },
  { date: "Day 13", "2025": 0.65, "2024": 0.60 },
  { date: "Day 14", "2025": 0.66, "2024": 0.61 },
  { date: "Day 15", "2025": 0.67, "2024": 0.62 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cg-panel border border-cg-accent px-3 py-2 rounded-lg shadow-xl">
        <p className="text-cg-muted text-xs font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 text-xs mb-1"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-0.5 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-cg-muted">{entry.name}:</span>
            </div>
            <span className="font-bold text-white">
              {entry.value.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = () => (
  <div className="flex justify-start gap-6 mb-2 px-4">
    <div className="flex items-center gap-2">
      <div className="w-6 h-0.5 bg-cg-accent rounded" />
      <span className="text-cg-muted text-xs font-semibold">2025</span>
    </div>
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-0.5 rounded opacity-70"
        style={{
          background: "#b8e89f",
          backgroundImage:
            "repeating-linear-gradient(to right, #b8e89f 0, #b8e89f 3px, transparent 3px, transparent 6px)",
        }}
      />
      <span className="text-cg-muted text-xs font-semibold">2024</span>
    </div>
  </div>
);

export default function NDVIChart() {
  const { fieldData } = useFieldData();
  const data = fieldData?.ndviTimeSeries || defaultData;

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Calculate summary statistics
  const summaryData = useMemo(() => {
    if (!data || data.length === 0) {
      return { min2025: 0, max2025: 1, mean2025: 0.5, change: 0 };
    }

    const values2025 = data.map((d) => d["2025"]).filter((v) => v != null);
    const values2024 = data.map((d) => d["2024"]).filter((v) => v != null);

    const min2025 = Math.min(...values2025);
    const max2025 = Math.max(...values2025);
    const mean2025 = values2025.reduce((a, b) => a + b, 0) / values2025.length;

    const lastValue2025 = values2025[values2025.length - 1];
    const lastValue2024 = values2024[values2024.length - 1];
    const change = lastValue2025 - lastValue2024;

    return { min2025, max2025, mean2025, change };
  }, [data]);

  // Chart configuration - Updated to show all 15 days
  const chartConfig = useMemo(() => {
    const length = data.length;
    return {
      // Minimum 60px per day for 15 days = 900px
      width: Math.max(length * 60, 900),
      // Show all labels (interval: 0)
      interval: 0,
    };
  }, [data.length]);

  // Y-axis configuration
  const yAxisConfig = useMemo(() => {
    const { min2025, max2025 } = summaryData;
    const padding = 0.1;
    const domain = [
      Math.max(0, Math.floor((min2025 - padding) * 10) / 10),
      Math.min(1, Math.ceil((max2025 + padding) * 10) / 10),
    ];

    return { domain, ticks: [0, 0.25, 0.5, 0.75, 1.0] };
  }, [summaryData]);

  // Drag scroll handlers
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleMouseDown = (e) => {
      isDragging.current = true;
      startX.current = e.pageX - el.offsetLeft;
      scrollLeft.current = el.scrollLeft;
      el.style.cursor = "grabbing";
    };

    const handleMouseLeave = () => {
      if (isDragging.current) {
        isDragging.current = false;
        el.style.cursor = "grab";
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        el.style.cursor = "grab";
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = x - startX.current;
      el.scrollLeft = scrollLeft.current - walk;
    };

    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mouseleave", handleMouseLeave);
    el.addEventListener("mouseup", handleMouseUp);
    el.addEventListener("mousemove", handleMouseMove);

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("mouseup", handleMouseUp);
      el.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="w-full bg-cg-panel rounded-xl shadow-cg-soft overflow-hidden border border-cg-bg/50">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-cg-bg">
        <h2 className="text-lg font-bold text-white">NDVI Analysis</h2>
        <p className="text-xs text-cg-muted">
          Vegetation health monitoring (15-day period)
        </p>
      </div>

      <div className="px-4 py-3 flex flex-col lg:flex-row gap-4">
        {/* Summary Card */}
        <div className="w-full lg:w-1/4 flex flex-col items-center justify-center">
          <div className="bg-cg-bg rounded-xl p-4 flex flex-col items-center shadow-md border border-cg-accent/20 h-full w-full justify-around">
            <h2 className="text-2xl font-bold text-cg-accent">Vegetation Index</h2>

            <button
              className={`${
                summaryData.change >= 0
                  ? "bg-cg-accent/20 text-cg-accent border-cg-accent/40"
                  : "bg-red-500/20 text-red-400 border-red-500/40"
              } px-4 py-2 text-sm font-bold rounded-lg mt-2 border transition-all hover:scale-105`}
            >
              {summaryData.change >= 0 ? "+" : ""}
              {summaryData.change.toFixed(3)}
            </button>

            <div className="mt-4 w-full space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-cg-muted">Mean:</span>
                <span className="text-white font-semibold">
                  {summaryData.mean2025.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-cg-muted">Min:</span>
                <span className="text-white font-semibold">
                  {summaryData.min2025.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-cg-muted">Max:</span>
                <span className="text-white font-semibold">
                  {summaryData.max2025.toFixed(3)}
                </span>
              </div>
            </div>

            <div className="border border-cg-muted/30 bg-cg-panel p-3 rounded-lg text-cg-muted text-xs w-full mt-4">
              <div className="flex items-start justify-between gap-2">
                <span className="flex-1">
                  NDVI values help in mapping vegetation health and detecting
                  cover changes over time.
                </span>
                <span className="bg-cg-bg rounded-full p-1 border border-cg-accent/30">
                  <Info size={14} strokeWidth={2} color="#79c24a" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="lg:w-3/4 flex-grow">
          <div className="bg-cg-bg rounded-xl border border-cg-muted/20 p-3">
            <div className="mb-2">
              <h3 className="text-base font-bold text-white">NDVI Trend</h3>
              <p className="text-xs text-cg-muted">
                Daily progression (15 days) • Scroll to view all →
              </p>
            </div>

            <div
              ref={scrollRef}
              className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing pr-2 custom-scrollbar"
              style={{ scrollbarWidth: "thin" }}
            >
              <div style={{ minWidth: chartConfig.width }}>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart
                    data={data}
                    margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      stroke="#486152"
                      strokeDasharray="3 3"
                      opacity={0.2}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#9fb79f", fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "#486152" }}
                      interval={chartConfig.interval}
                      dy={8}
                      angle={0}
                      textAnchor="middle"
                      height={50}
                    />
                    <YAxis
                      domain={yAxisConfig.domain}
                      tick={{ fill: "#9fb79f", fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: "#486152" }}
                      ticks={yAxisConfig.ticks}
                      dx={-5}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />

                    {/* 2025 Line - Solid, Theme Accent */}
                    <Line
                      type="monotone"
                      dataKey="2025"
                      stroke="#79c24a"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#79c24a",
                        strokeWidth: 2,
                        stroke: "#0c2214",
                      }}
                      activeDot={{
                        r: 6,
                        fill: "#79c24a",
                        stroke: "#0c2214",
                        strokeWidth: 2,
                      }}
                      name="2025"
                      connectNulls={false}
                    />

                    {/* 2024 Line - Dashed, Lighter Green */}
                    <Line
                      type="monotone"
                      dataKey="2024"
                      stroke="#b8e89f"
                      strokeWidth={2.5}
                      strokeDasharray="5 5"
                      dot={{
                        r: 3,
                        fill: "#b8e89f",
                        strokeWidth: 2,
                        stroke: "#0c2214",
                      }}
                      activeDot={{
                        r: 5,
                        fill: "#b8e89f",
                        stroke: "#0c2214",
                        strokeWidth: 2,
                      }}
                      name="2024"
                      opacity={0.8}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
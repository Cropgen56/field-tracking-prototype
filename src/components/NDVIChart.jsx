// src/components/NDVIChart.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useFieldData } from "../context/FieldDataContext";

const defaultData = [
  { name: "WK 1", v: 0.2 },
  { name: "WK 2", v: 0.4 },
  { name: "WK 3", v: 0.32 },
  { name: "WK 4", v: 0.45 },
  { name: "WK 5", v: 0.5 },
  { name: "WK 6", v: 0.7 },
  { name: "WK 7", v: 0.6 },
  { name: "WK 8", v: 0.48 },
];

export default function NDVIChart() {
  const { fieldData } = useFieldData();
  const data = fieldData?.ndviTimeSeries || defaultData;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke="#486152" strokeDasharray="0" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#9FB79F", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis hide domain={[0, 1]} />
        <Line
          type="monotone"
          dataKey="v"
          stroke="#8DD36A"
          strokeWidth={2}
          dot={{ r: 4, fill: "#8DD36A" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

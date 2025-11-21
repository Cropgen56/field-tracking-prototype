import React from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { useFieldData } from "../context/FieldDataContext";

const defaultData = [
  { name: "WK 1", v: 0.15 },
  { name: "WK 2", v: 0.22 },
  { name: "WK 3", v: 0.28 },
  { name: "WK 4", v: 0.25 },
  { name: "WK 5", v: 0.32 },
  { name: "WK 6", v: 0.38 },
  { name: "WK 7", v: 0.35 },
  { name: "WK 8", v: 0.30 },
];

export default function WaterIndexChart() {
  const { fieldData } = useFieldData();
  const data = fieldData?.waterIndexTimeSeries || defaultData;

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
        <YAxis hide domain={[0, 0.5]} />
        <Line
          type="monotone"
          dataKey="v"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ r: 4, fill: "#3B82F6" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
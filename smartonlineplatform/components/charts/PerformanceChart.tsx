"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  name: string;
  score: number;
}

export default function PerformanceChart({ data }: { data: DataPoint[] }) {
  if (!data.length) {
    return (
      <p className="text-center text-gray-400 py-12 text-sm">
        No performance data yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#6b7280" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "13px",
          }}
          formatter={(value: number) => [`${value}%`, "Score"]}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#0ea5e9"
          strokeWidth={2}
          dot={{ r: 4, fill: "#0ea5e9" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

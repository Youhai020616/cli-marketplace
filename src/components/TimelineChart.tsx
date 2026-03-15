"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  month: string;
  count: number;
  cumulative: number;
}

export default function TimelineChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fontFamily: "monospace", fill: "#999" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e5e5" }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fontFamily: "monospace", fill: "#999" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e5e5" }}
        />
        <Tooltip
          contentStyle={{
            background: "white",
            border: "2px solid #e5e5e5",
            fontFamily: "monospace",
            fontSize: 12,
          }}
          labelStyle={{ color: "#7c3aed" }}
        />
        <Area
          type="stepAfter"
          dataKey="cumulative"
          stroke="#7c3aed"
          fill="url(#purpleGradient)"
          strokeWidth={2}
          name="Total Tools"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface CategoryData {
  name: string;
  count: number;
  icon: string;
}

const COLORS = [
  "#7c3aed", "#a78bfa", "#6d28d9", "#8b5cf6",
  "#c4b5fd", "#5b21b6", "#ddd6fe", "#4c1d95",
  "#ede9fe", "#9333ea", "#a855f7", "#7e22ce",
];

export default function CategoryPieChart({ data }: { data: CategoryData[] }) {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={110}
            strokeWidth={2}
            stroke="#fff"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "white",
              border: "2px solid #e5e5e5",
              fontFamily: "monospace",
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-col gap-1 min-w-[200px]">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2 font-pixel text-xs">
            <span
              className="w-3 h-3 inline-block flex-shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-[#666] truncate">{item.icon} {item.name}</span>
            <span className="text-[#bbb] ml-auto">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

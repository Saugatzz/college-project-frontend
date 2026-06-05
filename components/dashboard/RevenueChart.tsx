"use client";

import { REVENUE_DATA } from "@/lib/constant";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";




export default function RevenueChart() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-playfair text-lg font-medium text-[#1a1a2e]">
          Revenue Overview
        </h2>
        <div className="flex gap-2">
          {["6M", "1Y", "All"].map((t) => (
            <button
              key={t}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                t === "1Y"
                  ? "bg-[#1A5276] text-white border-[#1A5276]"
                  : "text-gray-400 border-gray-200 hover:border-gray-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={REVENUE_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1A5276" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#1A5276" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}k`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
            }}
            formatter={(value: number) => [`$${value}k`, "Revenue"]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#1A5276"
            strokeWidth={2}
            fill="url(#revGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api/api";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";

interface Booking {
  totalAmount: number;
  status: string;
  createdAt: string;
}

type Range = "6M" | "1Y" | "All";

function buildChartData(bookings: Booking[], range: Range) {
  const now = new Date();
  const months = range === "6M" ? 6 : range === "1Y" ? 12 : 24;

  const buckets: Record<string, number> = {};
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    buckets[key] = 0;
  }

  bookings.forEach((b) => {
    if (b.status === "cancelled") return;
    const d = new Date(b.createdAt);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    if (key in buckets) buckets[key] += b.totalAmount;
  });

  const currentKey = now.toLocaleString("default", { month: "short", year: "2-digit" });

  return Object.entries(buckets).map(([month, revenue]) => ({
    month,
    revenue: Math.round((revenue / 1000) * 10) / 10,
    isCurrent: month === currentKey,
  }));
}

// Custom dot: highlight the current month
function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  if (!payload?.isCurrent) return null;
  return <circle cx={cx} cy={cy} r={5} fill="#1A5276" stroke="#fff" strokeWidth={2} />;
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs shadow-sm">
      <p className="text-gray-400 mb-0.5">{label}</p>
      <p className="font-semibold text-[#1a1a2e]">${payload[0].value}k</p>
    </div>
  );
}

export default function RevenueChart() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [range, setRange] = useState<Range>("1Y");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Booking[]>("/bookings")
      .then((r) => setBookings(r.data))
      .finally(() => setLoading(false));
  }, []);

  const data = buildChartData(bookings, range);
  const currentMonth = data.find((d) => d.isCurrent);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-playfair text-lg font-medium text-[#1a1a2e]">
            Revenue overview
          </h2>
          {currentMonth && (
            <p className="text-xs text-gray-400 mt-0.5">
              This month: <span className="font-medium text-gray-600">${currentMonth.revenue}k</span>
            </p>
          )}
        </div>
        <div className="flex gap-1.5">
          {(["6M", "1Y", "All"] as Range[]).map((t) => (
            <button
              key={t}
              onClick={() => setRange(t)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                t === range
                  ? "bg-[#1A5276] text-white border-[#1A5276]"
                  : "text-gray-400 border-gray-200 hover:border-gray-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
          Loading…
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1A5276" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#1A5276" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
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
            <Tooltip content={<CustomTooltip />} />
            {currentMonth && (
              <ReferenceLine
                x={currentMonth.month}
                stroke="#1A5276"
                strokeDasharray="3 3"
                strokeOpacity={0.3}
              />
            )}
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#1A5276"
              strokeWidth={2}
              fill="url(#revGrad)"
              dot={<CustomDot />}
              activeDot={{ r: 5, fill: "#1A5276", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
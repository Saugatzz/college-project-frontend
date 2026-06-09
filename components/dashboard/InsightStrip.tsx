"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api/api";

interface Booking {
  totalAmount: number;
  status: string;
  createdAt: string;
  tour?: { title?: string; name?: string };
}

interface Insight {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
}

export default function InsightStrip() {
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    api.get<Booking[]>("/bookings").then((r) => {
      const bookings = r.data;
      const now = new Date();
      const thisMonth = bookings.filter((b) => {
        const d = new Date(b.createdAt);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear() &&
          b.status !== "cancelled"
        );
      });
      const monthRev = thisMonth.reduce((s, b) => s + Number(b.totalAmount), 0);

      // Top tour by revenue
      const tourMap: Record<string, number> = {};
      bookings.forEach((b) => {
        if (b.status === "cancelled") return;
        const name = b.tour?.title ?? b.tour?.name ?? "Unknown";
        tourMap[name] = (tourMap[name] ?? 0) + Number(b.totalAmount);
      });
      const topTour = Object.entries(tourMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

      const pending = bookings.filter((b) => b.status === "pending").length;

      setInsights([
        {
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ),
          iconBg: "bg-blue-50",
          iconColor: "text-[#185FA5]",
          value: `$${monthRev.toLocaleString()} this month`,
          label: "Revenue generated in the current month",
        },
        {
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          iconBg: "bg-green-50",
          iconColor: "text-green-700",
          value: topTour,
          label: "Top revenue tour this period",
        },
        {
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          iconBg: "bg-amber-50",
          iconColor: "text-amber-700",
          value: `${pending} pending review${pending !== 1 ? "s" : ""}`,
          label: "Confirm or cancel to keep guests informed",
        },
      ]);
    });
  }, []);

  if (insights.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {insights.map((ins, i) => (
        <div
          key={i}
          className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ins.iconBg} ${ins.iconColor}`}
          >
            {ins.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#1a1a2e] truncate">{ins.value}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-snug">{ins.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
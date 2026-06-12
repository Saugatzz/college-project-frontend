"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api/api";

interface Booking {
  id: number;
  totalAmount: number | string;
  status: string;
  createdAt: string;
}

interface Package {
  id: number;
  isActive: boolean;
}

interface StatConfig {
  label: string;
  value: string | number;
  sub: string;
  change: string;
  trend: "up" | "down" | "neutral";
  accent: string;
}

export default function StatsGrid() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Booking[]>("/bookings"),
      api.get<Package[]>("/packages/admin/all"),
    ])
      .then(([b, p]) => {
        setBookings(b.data);
        setPackages(p.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Only count non-cancelled bookings toward revenue ──────────────────────
  const billable     = bookings.filter((b) => b.status !== "cancelled");
  const totalRevenue = billable.reduce((s, b) => s + Number(b.totalAmount), 0);
  const confirmed    = bookings.filter((b) => b.status === "confirmed").length;
  const activeTours  = packages.filter((p) => p.isActive).length;
  const pending      = bookings.filter((b) => b.status === "pending").length;

  const now  = Date.now();
  const MS30 = 30 * 24 * 60 * 60 * 1000;

  // Recent / prior windows — also exclude cancelled
  const recent = billable.filter((b) => now - new Date(b.createdAt).getTime() < MS30);
  const prior  = billable.filter((b) => {
    const age = now - new Date(b.createdAt).getTime();
    return age >= MS30 && age < MS30 * 2;
  });

  const recentRev = recent.reduce((s, b) => s + Number(b.totalAmount), 0);
  const priorRev  = prior.reduce((s, b) => s + Number(b.totalAmount), 0);

  // Booking count trend also excludes cancelled
  const recentBookings = bookings.filter((b) => {
    const age = now - new Date(b.createdAt).getTime();
    return age < MS30 && b.status !== "cancelled";
  });
  const priorBookings = bookings.filter((b) => {
    const age = now - new Date(b.createdAt).getTime();
    return age >= MS30 && age < MS30 * 2 && b.status !== "cancelled";
  });

  const calcChange = (curr: number, prev: number) =>
    prev > 0 ? Math.abs(Math.round(((curr - prev) / prev) * 100)) + "%" : "—";

  const revChange    = calcChange(recentRev, priorRev);
  const revTrend: "up" | "down" | "neutral" =
    revChange === "—" ? "neutral" : recentRev >= priorRev ? "up" : "down";

  const bookingChange = calcChange(recentBookings.length, priorBookings.length);
  const bookingTrend: "up" | "down" | "neutral" =
    bookingChange === "—" ? "neutral" : recentBookings.length >= priorBookings.length ? "up" : "down";

  const stats: StatConfig[] = [
    {
      label:  "Total Revenue",
      value:  loading ? "…" : `$${totalRevenue.toLocaleString()}`,
      sub:    "Confirmed + pending bookings",
      change: revChange,
      trend:  revTrend,
      accent: "from-[#1A5276] to-[#2980B9]",
    },
    {
      label:  "Total Bookings",
      value:  loading ? "…" : bookings.length,
      sub:    `${confirmed} confirmed`,
      change: bookingChange,
      trend:  bookingTrend,
      accent: "from-[#3B6D11] to-[#97C459]",
    },
    {
      label:  "Active Tours",
      value:  loading ? "…" : activeTours,
      sub:    `${packages.length} total packages`,
      change: "—",
      trend:  "neutral",
      accent: "from-[#854F0B] to-[#EF9F27]",
    },
    {
      label:  "Pending",
      value:  loading ? "…" : pending,
      sub:    "Awaiting confirmation",
      change: "—",
      trend:  "neutral",
      accent: "from-[#A32D2D] to-[#F09595]",
    },
  ];

  const badgeStyles = {
    up:      "bg-green-50 text-green-700",
    down:    "bg-red-50 text-red-600",
    neutral: "bg-gray-100 text-gray-500",
  };

  const badgeIcon = { up: "↑", down: "↓", neutral: "" };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-2xl border border-gray-100 pt-5 px-5 pb-0 hover:shadow-sm transition-shadow overflow-hidden relative"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              {stat.label}
            </p>
            {stat.change !== "—" ? (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeStyles[stat.trend]}`}>
                {badgeIcon[stat.trend]} {stat.change}
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">—</span>
            )}
          </div>

          <p className="font-playfair text-3xl font-semibold text-[#1a1a2e]">{stat.value}</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">{stat.sub}</p>

          <div
            className={`h-[3px] w-full bg-gradient-to-r ${stat.accent}`}
            style={{ width: "calc(100% + 2.5rem)", marginLeft: "-1.25rem" }}
          />
        </div>
      ))}
    </div>
  );
}
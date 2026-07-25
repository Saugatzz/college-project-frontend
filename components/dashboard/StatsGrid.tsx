"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api/api";

interface Booking {
  id: number;
  totalAmount: number | string;
  status: string;
  createdAt: string;
  tour?: { title?: string; name?: string };
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

interface BookingNotification {
  id: number;
  message: string;
  createdAt: string;
  read: boolean;
}

const POLL_INTERVAL = 15000;
const SEEN_KEY = "booking_notifications_seen_ids";

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`;
}

export default function StatsGrid() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading,  setLoading]  = useState(true);

  // ── Notifications ──────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [toast, setToast] = useState<BookingNotification | null>(null);
  const [bellOpen, setBellOpen] = useState(false);
  const seenIds = useRef<Set<number>>(new Set());
  const initialized = useRef(false);
  const nextNotifId = useRef(1);
  const bellRef = useRef<HTMLDivElement>(null);

  // Initial fetch — also seeds the notification baseline immediately so
  // detection of new bookings starts from the first poll tick, not the
  // second one.
  useEffect(() => {
    Promise.all([
      api.get<Booking[]>("/bookings"),
      api.get<Package[]>("/packages/admin/all"),
    ])
      .then(([b, p]) => {
        setBookings(b.data);
        setPackages(p.data);

        const stored = localStorage.getItem(SEEN_KEY);
        if (stored) {
          try { seenIds.current = new Set(JSON.parse(stored)); } catch { /* ignore */ }
        }
        b.data.forEach((bk) => seenIds.current.add(bk.id));
        localStorage.setItem(SEEN_KEY, JSON.stringify([...seenIds.current]));
        initialized.current = true;
      })
      .finally(() => setLoading(false));
  }, []);

  // Poll for new bookings → drive notifications
  useEffect(() => {
    const poll = () => {
      api.get<Booking[]>("/bookings").then((r) => {
        const data = r.data;
        setBookings(data); // keep stats live too

        if (!initialized.current) return; // baseline not ready yet, skip this tick

        const fresh = data.filter((b) => !seenIds.current.has(b.id));
        if (fresh.length === 0) return;

        fresh.forEach((b) => seenIds.current.add(b.id));
        localStorage.setItem(SEEN_KEY, JSON.stringify([...seenIds.current]));

        const newNotifs: BookingNotification[] = fresh.map((b) => ({
          id: nextNotifId.current++,
          message: `New booking for ${b.tour?.title ?? b.tour?.name ?? "a tour"} — $${Number(b.totalAmount).toLocaleString()}`,
          createdAt: new Date().toISOString(),
          read: false,
        }));

        setNotifications((prev) => [...newNotifs, ...prev].slice(0, 30));
        setToast(newNotifs[newNotifs.length - 1]);
      });
    };

    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: number) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  // ── Stats ──────────────────────────────────────────────────────────────
  const billable     = bookings.filter((b) => b.status !== "cancelled");
  const totalRevenue = billable.reduce((s, b) => s + Number(b.totalAmount), 0);
  const confirmed    = bookings.filter((b) => b.status === "confirmed").length;
  const cancelled    = bookings.filter((b) => b.status === "cancelled").length;
  const activeTours  = packages.filter((p) => p.isActive).length;
  const pending      = bookings.filter((b) => b.status === "pending").length;
  const totalCount   = confirmed + pending + cancelled;

  const now  = Date.now();
  const MS30 = 30 * 24 * 60 * 60 * 1000;

  const recent = billable.filter((b) => now - new Date(b.createdAt).getTime() < MS30);
  const prior  = billable.filter((b) => {
    const age = now - new Date(b.createdAt).getTime();
    return age >= MS30 && age < MS30 * 2;
  });

  const recentRev = recent.reduce((s, b) => s + Number(b.totalAmount), 0);
  const priorRev  = prior.reduce((s, b) => s + Number(b.totalAmount), 0);

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

  const revChange = calcChange(recentRev, priorRev);
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

  const statusItems = [
    { key: "confirmed", count: confirmed, label: "Confirmed", text: "text-green-700", chip: "bg-green-50", dot: "bg-green-500" },
    { key: "pending",   count: pending,   label: "Pending",   text: "text-amber-700", chip: "bg-amber-50", dot: "bg-amber-500" },
    { key: "cancelled", count: cancelled, label: "Cancelled", text: "text-red-600",   chip: "bg-red-50",   dot: "bg-red-500" },
  ] as const;

  return (
    <div className="space-y-4">
      {/* ── Header row: title + notification bell ───────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-lg font-medium text-[#1a1a2e]">Overview</h2>

        <div className="relative" ref={bellRef}>
          <button
            onClick={() => { setBellOpen((o) => !o); if (!bellOpen) markAllRead(); }}
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <h3 className="font-playfair text-sm font-medium text-[#1a1a2e]">Notifications</h3>
                {notifications.length > 0 && (
                  <button onClick={markAllRead} className="text-xs text-[#1A5276] hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${!n.read ? "bg-blue-50/40" : ""}`}
                    >
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${!n.read ? "bg-[#1A5276]" : "bg-transparent"}`} />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
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

      {/* ── Booking status breakdown ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-playfair text-base font-medium text-[#1a1a2e] mb-4">Booking Status</h3>

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-4">Loading…</p>
        ) : totalCount === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No bookings yet</p>
        ) : (
          <>
            <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-gray-100 mb-4">
              {statusItems.map((it) =>
                it.count > 0 ? (
                  <div key={it.key} className={it.dot} style={{ width: `${(it.count / totalCount) * 100}%` }} title={`${it.label}: ${it.count}`} />
                ) : null
              )}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {statusItems.map((it) => (
                <div key={it.key} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${it.dot}`} />
                  <span className="text-sm text-gray-600">{it.label}</span>
                  <span className="text-sm font-semibold text-[#1a1a2e]">{it.count}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${it.chip} ${it.text}`}>
                    {Math.round((it.count / totalCount) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100]">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg px-4 py-3 flex items-start gap-3 max-w-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#185FA5] flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#1a1a2e]">New booking</p>
              <p className="text-xs text-gray-500 mt-0.5">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
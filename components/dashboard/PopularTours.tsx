"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api/api";

interface Booking {
  totalAmount: number | string;
  status: string;
  tour?: { id?: number; title?: string; name?: string };
}

interface TourStat {
  name: string;
  bookings: number;
  revenue: number; // keep as number, format on render
  rating: number;
}

interface Package {
  id: number;
  name: string; // ← fix: backend returns 'name' not 'title'
  rating: number | string;
}

export default function PopularTours() {
  const [tours,   setTours]   = useState<TourStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Booking[]>("/bookings"),
      api.get<Package[]>("/packages/admin/all"),
    ]).then(([bRes, pRes]) => {
      const bookings = bRes.data;
      const packages = pRes.data;

      const map: Record<string, { bookings: number; revenue: number; id?: number }> = {};
      bookings.forEach((b) => {
        if (b.status === "cancelled") return;
        const name = b.tour?.title ?? b.tour?.name ?? "Unknown";
        if (!map[name]) map[name] = { bookings: 0, revenue: 0, id: b.tour?.id };
        map[name].bookings += 1;
        map[name].revenue  += Number(b.totalAmount); // ← fix: was string concat
      });

      // key by id, use 'name' field
      const pkgRatings: Record<number, number> = {};
      packages.forEach((p) => { pkgRatings[p.id] = Number(p.rating); }); // ← fix: Number() cast

      const sorted = Object.entries(map)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5)
        .map(([name, stats]) => ({
          name,
          bookings: stats.bookings,
          revenue:  stats.revenue, // raw number
          rating:   stats.id ? (pkgRatings[stats.id] ?? 0) : 0,
        }));

      setTours(sorted);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <h2 className="font-playfair text-lg font-medium text-[#1a1a2e]">Top Tours</h2>
      </div>
      <div className="p-4 space-y-3">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-6">Loading…</p>
        ) : tours.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No data yet</p>
        ) : (
          tours.map((tour, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <span className="text-lg font-playfair font-semibold text-gray-200 w-5 text-center">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{tour.name}</p>
                <p className="text-xs text-gray-400">{tour.bookings} bookings</p>
              </div>
              <div className="text-right shrink-0">
                {/* ← fix: format number properly, never shows "$1200300" string concat */}
                <p className="text-sm font-medium text-gray-700">
                  ${tour.revenue.toLocaleString()}
                </p>
                {tour.rating > 0 && (
                  <div className="flex items-center gap-0.5 justify-end">
                    <svg className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-[10px] text-gray-500">{tour.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
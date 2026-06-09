import StatsGrid from "@/components/dashboard/StatsGrid";
import PopularTours from "@/components/dashboard/PopularTours";
import RevenueChart from "@/components/dashboard/RevenueChart";
import InsightStrip from "@/components/dashboard/InsightStrip";

export default function DashboardPage() {
  const now = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-semibold text-[#1a1a2e]">
            Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">{now} · Good morning, Admin</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <StatsGrid />

      {/* Insight strip */}
      <InsightStrip />

      {/* Chart + Top Tours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <PopularTours />
        </div>
      </div>
      
    </div>
  );
}
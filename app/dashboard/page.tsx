import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentBookings from "@/components/dashboard/RecentBookings";
import PopularTours from "@/components/dashboard/PopularTours";
import RevenueChart from "@/components/dashboard/RevenueChart";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium tracking-widest text-[#C9963B] uppercase mb-1">
          ✦ Welcome back
        </p>
        <h1 className="font-playfair text-3xl font-semibold text-[#1a1a2e]">
          Dashboard Overview
        </h1>
      </div>

      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <PopularTours />
        </div>
      </div>

      <RecentBookings />
    </div>
  );
}

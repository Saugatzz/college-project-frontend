import { STATS } from "@/lib/constant";


export default function StatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              {stat.label}
            </p>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                stat.trend === "up"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {stat.trend === "up" ? "↑" : "↓"} {stat.change}
            </span>
          </div>
          <p className="font-playfair text-3xl font-semibold text-[#1a1a2e]">
            {stat.value}
          </p>
          <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}

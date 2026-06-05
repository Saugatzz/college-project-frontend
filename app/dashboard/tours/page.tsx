import TourTable from "@/components/dashboard/TourTable";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function ToursPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest text-[#C9963B] uppercase mb-1">
            ✦ Manage
          </p>
          <h1 className="font-playfair text-3xl font-semibold text-[#1a1a2e]">
            All Tours
          </h1>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            {["All", "Trekking", "Culture", "Adventure"].map((f) => (
              <button
                key={f}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  f === "All"
                    ? "bg-[#1A5276] text-white border-[#1A5276]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <Button variant="primary">+ Add Tour</Button>
        </div>
      </div>
      <TourTable />
    </div>
  );
}

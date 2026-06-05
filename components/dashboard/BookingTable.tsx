import Badge from "@/components/ui/Badge";
import { BOOKINGS } from "@/lib/constant";


export default function BookingTable() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div className="flex gap-2">
          {["All", "Confirmed", "Pending", "Cancelled"].map((f) => (
            <button
              key={f}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                f === "All"
                  ? "bg-[#1A5276] text-white border-[#1A5276]"
                  : "text-gray-400 border-gray-200 hover:border-gray-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search bookings..."
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#1A5276] w-48"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              {["#", "Customer", "Tour", "Date", "People", "Amount", "Status"].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BOOKINGS.map((b, i) => (
              <tr
                key={i}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-3 text-xs text-gray-400 font-mono">#{String(i + 1001)}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#EAF3DE] flex items-center justify-center text-[10px] font-semibold text-[#3B6D11]">
                      {b.customer.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{b.customer}</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">{b.tour}</td>
                <td className="px-6 py-3 text-sm text-gray-500">{b.date}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{b.people}</td>
                <td className="px-6 py-3 text-sm font-medium text-gray-800">{b.amount}</td>
                <td className="px-6 py-3">
                  <Badge variant={b.statusVariant}>{b.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

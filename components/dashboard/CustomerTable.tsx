import { CUSTOMERS } from "@/lib/constant";


export default function CustomerTable() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {["Customer", "Email", "Country", "Bookings", "Total Spent", "Joined"].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-4"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CUSTOMERS.map((c, i) => (
              <tr
                key={i}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EAF3DE] flex items-center justify-center text-xs font-semibold text-[#3B6D11]">
                      {c.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{c.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{c.country}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{c.bookings}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{c.spent}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{c.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

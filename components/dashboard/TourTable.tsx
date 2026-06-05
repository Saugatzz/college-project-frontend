import Badge from "@/components/ui/Badge";
import { TOURS } from "@/lib/constant";


export default function TourTable() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {["Tour Name", "Category", "Duration", "Difficulty", "Price", "Rating", "Status", ""].map((h) => (
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
            {TOURS.map((tour, i) => (
              <tr
                key={i}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-800">{tour.name}</p>
                  <p className="text-xs text-gray-400">{tour.location}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{tour.category}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{tour.duration}</td>
                <td className="px-6 py-4">
                  <Badge variant={tour.difficultyVariant}>{tour.difficulty}</Badge>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{tour.price}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-sm text-gray-700">{tour.rating}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={tour.statusVariant}>{tour.status}</Badge>
                </td>
                <td className="px-6 py-4">
                  <button className="text-xs text-[#1A5276] hover:underline font-medium">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

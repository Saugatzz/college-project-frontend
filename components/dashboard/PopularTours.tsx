import { POPULAR_TOURS } from "@/lib/constant";


export default function PopularTours() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <h2 className="font-playfair text-lg font-medium text-[#1a1a2e]">
          Top Tours
        </h2>
      </div>
      <div className="p-4 space-y-3">
        {POPULAR_TOURS.map((tour, i) => (
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
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{tour.revenue}</p>
              <div className="flex items-center gap-0.5 justify-end">
                <svg className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-[10px] text-gray-500">{tour.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

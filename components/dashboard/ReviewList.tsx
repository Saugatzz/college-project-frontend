import { REVIEWS } from "@/lib/constants";

export default function ReviewList() {
  return (
    <div className="space-y-4">
      {REVIEWS.map((r, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#EAF3DE] flex items-center justify-center text-xs font-semibold text-[#3B6D11]">
                {r.author.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{r.author}</p>
                <p className="text-xs text-gray-400">{r.tour} · {r.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <svg
                  key={j}
                  className={`w-3.5 h-3.5 ${j < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
        </div>
      ))}
    </div>
  );
}

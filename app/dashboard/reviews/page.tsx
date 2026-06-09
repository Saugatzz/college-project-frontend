import ReviewList from "@/components/dashboard/ReviewList";

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-semibold text-[#1a1a2e]">
          Reviews
        </h1>
      </div>
      <ReviewList />
    </div>
  );
}

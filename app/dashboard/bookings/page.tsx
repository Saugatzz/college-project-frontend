import BookingTable from "@/components/dashboard/BookingTable";

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium tracking-widest text-[#C9963B] uppercase mb-1">
          ✦ Reservations
        </p>
        <h1 className="font-playfair text-3xl font-semibold text-[#1a1a2e]">
          Bookings
        </h1>
      </div>
      <BookingTable />
    </div>
  );
}

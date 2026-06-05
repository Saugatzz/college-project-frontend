import CustomerTable from "@/components/dashboard/CustomerTable";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium tracking-widest text-[#C9963B] uppercase mb-1">
          ✦ People
        </p>
        <h1 className="font-playfair text-3xl font-semibold text-[#1a1a2e]">
          Customers
        </h1>
      </div>
      <CustomerTable />
    </div>
  );
}

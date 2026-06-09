import CustomerTable from "@/components/dashboard/CustomerTable";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-semibold text-[#1a1a2e]">
          Customers
        </h1>
      </div>
      <CustomerTable />
    </div>
  );
}

import CustomerTable from "@/components/dashboard/CustomerTable";

export default function CustomersPage() {
  return (
   <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
        <div className="mb-6">
          <h1 className="font-playfair text-[1.6rem] font-light text-[#1a1a2e] leading-none">Customers</h1>
          <p className="text-[0.82rem] text-gray-400 font-light mt-1">Manage and view customer information.</p>
        </div>
        <CustomerTable />
      </div>
  );
}

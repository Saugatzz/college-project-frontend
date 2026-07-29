import UsersTable from "@/components/dashboard/UsersTable";

export default function UsersPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="font-playfair text-[1.6rem] font-light text-[#1a1a2e] leading-none">Accounts</h1>
        <p className="text-[0.82rem] text-gray-400 font-light mt-1">
          Registered user accounts — ban an email to block sign-in, or restore access anytime.
        </p>
      </div>
      <UsersTable />
    </div>
  );
}

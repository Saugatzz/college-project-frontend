import Sidebar from "@/components/sidebar/Sidebar";


export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-3">{children}</main>
    </div>
  );
}
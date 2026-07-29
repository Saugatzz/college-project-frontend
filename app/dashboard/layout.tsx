'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar/Sidebar';
import { getAdminToken, getAdminUser, clearAdminAuth } from '@/lib/auth/tokenStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    const user = getAdminUser();
    // Belt-and-suspenders: even if a token exists in the admin slot, only
    // trust it here if the cached account is actually an admin. Backend
    // guards (RolesGuard) are still the real enforcement — this just
    // avoids flashing dashboard UI at a non-admin session.
    if (!token || !user || user.role !== 'admin') {
      clearAdminAuth();
      router.replace('/auth/login');
    } else {
      setVerified(true);
    }
  }, [router]);

  // Prevent flash of dashboard content before redirect
  if (!verified) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#2E86C1] border-t-transparent animate-spin" />
          <p className="text-[0.75rem] text-gray-400 tracking-wide">Verifying session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-3">{children}</main>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarItem from "./SidebarItem";
import SidebarGroup from "./SidebarGroup";
import api from "@/lib/api/api";
import { clearAuth, getUser, AuthUser } from "@/lib/auth/tokenStore";

interface ContactMessage { id: number; read: boolean; }
interface Booking { id: number; }
interface Tour { id: number; }

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const [user,         setUser]         = useState<AuthUser | null>(null);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [tourCount,    setTourCount]    = useState(0);

  useEffect(() => {
    // Runs only after hydration — no more "?"
    setUser(getUser());
  }, []);

  useEffect(() => {
    api.get<ContactMessage[]>('/contacts')
      .then(({ data }) => setUnreadCount(data.filter(c => !c.read).length))
      .catch(() => {});

    api.get<Booking[]>('/bookings')
      .then(({ data }) => setBookingCount(data.length))
      .catch(() => {});

    api.get<Tour[]>('/packages/admin/all')
      .then(({ data }) => setTourCount(data.length))
      .catch(() => {});
  }, [pathname]);

  function handleLogout() {
    clearAuth();
    router.push('/auth/login');
  }

  function getInitials(user: AuthUser): string {
    if (user.name) {
      return user.name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    return user.email[0].toUpperCase();
  }

  const navGroups = [
    {
      label: "Main",
      items: [
        { href: "/dashboard",           icon: "grid",           label: "Overview" },
        {
          href: "/dashboard/tours",
          icon: "map-2",
          label: "Tours",
          badge: tourCount > 0 ? String(tourCount) : undefined,
          badgeVariant: "blue" as const,
        },
        {
          href: "/dashboard/bookings",
          icon: "calendar-check",
          label: "Bookings",
          badge: bookingCount > 0 ? String(bookingCount) : undefined,
          badgeVariant: "blue" as const,
        },
        { href: "/dashboard/customers", icon: "users",          label: "Customers" },
        {
          href: "/dashboard/messages",
          icon: "message-square",
          label: "Messages",
          badge: unreadCount > 0 ? String(unreadCount) : undefined,
          badgeVariant: "blue" as const,
        },
      ],
    },
    {
      label: "Insights",
      items: [
        { href: "/dashboard/analytics", icon: "chart-bar", label: "Analytics" },
        { href: "/dashboard/reviews",   icon: "star",      label: "Reviews" },
      ],
    },
    {
      label: "Config",
      items: [
        { href: "/dashboard/settings",  icon: "settings",  label: "Settings" },
      ],
    },
  ];

  return (
    <aside className="w-[230px] min-w-[230px] bg-gray-300 border-r border-gray-100 shadow-[2px_0_12px_0_rgba(0,0,0,0.04)] flex flex-col h-full">

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} label={group.label}>
            {group.items.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
                badgeVariant={item.badgeVariant}
                active={
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href)
                }
              />
            ))}
          </SidebarGroup>
        ))}
      </nav>

      {/* User footer — sits above the bottom edge with clear padding */}
      <div className="shrink-0 px-3 pt-3 pb-4 border-t border-gray-200 bg-gray-300">

        {/* User info row */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div className="w-9 h-9 shrink-0 rounded-full bg-[#EAF3DE] flex items-center justify-center text-xs font-semibold text-[#3B6D11]">
            {user ? getInitials(user) : (
              <span className="w-4 h-4 rounded-full bg-gray-200 animate-pulse block" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate leading-tight">
              {user?.name ?? <span className="w-20 h-3 bg-gray-200 rounded animate-pulse block" />}
            </p>
            <p className="text-xs text-gray-500 truncate leading-tight mt-0.5">
              {user?.email ?? ''}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-2 my-1 border-t border-gray-200" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors group"
        >
          <svg
            className="w-4 h-4 shrink-0 text-gray-400 group-hover:text-red-400 transition-colors"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
          <span className="text-sm">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
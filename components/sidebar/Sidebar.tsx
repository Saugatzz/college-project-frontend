"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SidebarItem from "./SidebarItem";
import SidebarGroup from "./SidebarGroup";
import api from "@/lib/api/api";

interface ContactMessage { id: number; read: boolean; }
interface Booking { id: number; }
interface Tour { id: number; }

export default function Sidebar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount]   = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [tourCount, setTourCount]       = useState(0);

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
          icon: "mail",
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
      {/* Brand */}
      

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

      {/* User footer */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-[#EAF3DE] flex items-center justify-center text-xs font-medium text-[#3B6D11]">
            RK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">Raj Kumar</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
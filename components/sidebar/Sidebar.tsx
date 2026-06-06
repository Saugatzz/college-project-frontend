"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SidebarItem from "./SidebarItem";
import SidebarGroup from "./SidebarGroup";
import api from "@/lib/api/api";

interface ContactMessage { id: number; read: boolean; }
interface Booking { id: number; }

export default function Sidebar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    api.get<ContactMessage[]>('/contacts')
      .then(({ data }) => setUnreadCount(data.filter(c => !c.read).length))
      .catch(() => {});

    api.get<Booking[]>('/bookings')
      .then(({ data }) => setBookingCount(data.length))
      .catch(() => {});
  }, [pathname]);

  const navGroups = [
    {
      label: "Main",
      items: [
        { href: "/dashboard",           icon: "grid",           label: "Overview" },
        { href: "/dashboard/tours",     icon: "map-2",          label: "Tours",    badge: "24" },
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
        { href: "/dashboard/reviews",   icon: "star",      label: "Reviews",  badge: "3" },
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
    <aside className="w-[230px] min-w-[230px] bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9963B]" />
          <span className="text-[10px] font-medium tracking-widest text-[#C9963B] uppercase">
            Admin Panel
          </span>
        </div>
        <h1 className="font-playfair text-xl font-semibold text-[#1a1a2e]">
          Nepal Treks
        </h1>
      </div>

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
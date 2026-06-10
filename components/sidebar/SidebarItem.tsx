import Link from "next/link";
import {
  IconLayoutGrid,
  IconMap2,
  IconCalendarCheck,
  IconUsers,
  IconChartBar,
  IconStar,
  IconSettings,
  IconMessage,
} from "@tabler/icons-react";

interface SidebarItemProps {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
  badge?: string;
  badgeVariant?: "amber" | "blue";
}

const icons: Record<string, React.ReactNode> = {
  grid:             <IconLayoutGrid    size={18} stroke={1.6} />,
  "map-2":          <IconMap2          size={18} stroke={1.6} />,
  "calendar-check": <IconCalendarCheck size={18} stroke={1.6} />,
  users:            <IconUsers         size={18} stroke={1.6} />,
  "chart-bar":      <IconChartBar      size={18} stroke={1.6} />,
  star:             <IconStar          size={18} stroke={1.6} />,
  settings:         <IconSettings      size={18} stroke={1.6} />,
  "message-square": <IconMessage size={18} stroke={1.6} />,
};

export default function SidebarItem({
  href,
  icon,
  label,
  active = false,
  badge,
  badgeVariant = "amber",
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 mx-2 rounded-xl text-sm font-medium transition-all group ${
        active
          ? "bg-[#EAF3DE] text-[#3B6D11]"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
      }`}
    >
      <span
        className={`flex-shrink-0 transition-colors ${
          active ? "text-[#639922]" : "text-gray-400 group-hover:text-gray-600"
        }`}
      >
        {icons[icon]}
      </span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            badgeVariant === "blue"
              ? "bg-blue-100 text-blue-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
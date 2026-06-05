interface SidebarGroupProps {
  label: string;
  children: React.ReactNode;
}

export default function SidebarGroup({ label, children }: SidebarGroupProps) {
  return (
    <div className="mb-1">
      <p className="text-[10px] font-medium tracking-widest text-gray-400 uppercase px-5 py-2">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

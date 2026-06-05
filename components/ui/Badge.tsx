interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "amber" | "red" | "blue" | "gray";
}

const variants = {
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-600",
  blue: "bg-blue-50 text-blue-700",
  gray: "bg-gray-100 text-gray-600",
};

export default function Badge({ children, variant = "gray" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

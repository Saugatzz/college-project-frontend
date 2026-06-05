interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export default function Button({
  variant = "secondary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-1.5 font-medium rounded-lg transition-all cursor-pointer";

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
  };

  const variants = {
    primary: "bg-[#1A5276] text-white hover:bg-[#154360] border border-[#1A5276]",
    secondary:
      "bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-800",
    ghost: "text-gray-500 hover:bg-gray-100 border border-transparent",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

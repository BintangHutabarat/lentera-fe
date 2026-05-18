import { cn } from "@/lib/utils";

interface ChipProps {
  children: React.ReactNode;
  variant?: "blue" | "teal" | "yellow" | "mint" | "red" | "purple" | "soft";
  className?: string;
}

const variantStyles = {
  blue:   "bg-blue-light   text-blue-dark",
  teal:   "bg-teal-light   text-teal-dark",
  yellow: "bg-yellow-light text-yellow-dark",
  mint:   "bg-mint-light   text-mint-dark",
  red:    "bg-red-light    text-red-dark",
  purple: "bg-[#EDF3FF]    text-[#3d5af1]",
  soft:   "bg-surface-soft text-ink-muted",
};

export function Chip({ children, variant = "soft", className }: ChipProps) {
  return (
    <span className={cn("chip", variantStyles[variant], className)}>
      {children}
    </span>
  );
}

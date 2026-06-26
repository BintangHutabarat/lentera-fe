import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  value: string | number;
  valueColor: string;
  label: string;
  badge?: string;
  badgeVariant?: "up" | "warn" | "danger" | "neutral";
  className?: string;
}

const badgeStyles = {
  up:      "bg-teal-light   text-teal-dark",
  warn:    "bg-yellow-light text-yellow-dark",
  danger:  "bg-red-light    text-red-dark",
  neutral: "bg-surface-soft text-ink-muted",
};

export function StatCard({
  icon, iconBg, value, valueColor, label, badge, badgeVariant = "up", className,
}: StatCardProps) {
  return (
    <div className={cn("card p-4 lg:p-5", className)}>
      <div
        className="w-9 h-9 lg:w-11 lg:h-11 rounded-[10px] flex items-center justify-center mb-2 lg:mb-2.5"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div className="text-[22px] lg:text-[28px] font-extrabold leading-none mb-0.5" style={{ color: valueColor }}>
        {value}
      </div>
      <div className="text-[11px] lg:text-[13px] text-ink-muted">{label}</div>
      {badge && (
        <span className={cn("inline-flex mt-1.5 px-2 py-0.5 rounded-full text-[10px] lg:text-[11px] font-bold", badgeStyles[badgeVariant])}>
          {badge}
        </span>
      )}
    </div>
  );
}

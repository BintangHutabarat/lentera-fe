import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  value: string | number;
  valueColor: string;
  label: string;
  badge?: string;
  badgeVariant?: "up" | "warn" | "danger";
  className?: string;
}

const badgeStyles = {
  up:     "bg-teal-light   text-teal-dark",
  warn:   "bg-yellow-light text-yellow-dark",
  danger: "bg-red-light    text-red-dark",
};

export function StatCard({
  icon, iconBg, value, valueColor, label, badge, badgeVariant = "up", className,
}: StatCardProps) {
  return (
    <div className={cn("card p-4", className)}>
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-2"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div className="text-[22px] font-extrabold leading-none mb-0.5" style={{ color: valueColor }}>
        {value}
      </div>
      <div className="text-[11px] text-ink-muted">{label}</div>
      {badge && (
        <span className={cn("inline-flex mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold", badgeStyles[badgeVariant])}>
          {badge}
        </span>
      )}
    </div>
  );
}

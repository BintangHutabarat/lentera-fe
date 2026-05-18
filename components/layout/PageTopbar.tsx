import { cn } from "@/lib/utils";

interface PageTopbarProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
}

export function PageTopbar({ title, subtitle, right, className }: PageTopbarProps) {
  return (
    <header className={cn(
      "bg-surface-card border-b border-border px-[18px] py-[13px]",
      "flex items-center gap-3 sticky top-0 z-10",
      className
    )}>
      <div className="flex-1">
        <h3 className="text-[15px] font-extrabold text-ink">{title}</h3>
        {subtitle && <p className="text-[11px] text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

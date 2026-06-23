"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface PageTopbarProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  back?: boolean;
  className?: string;
}

export function PageTopbar({ title, subtitle, right, back, className }: PageTopbarProps) {
  const router = useRouter();
  return (
    <header className={cn(
      "bg-surface-card border-b border-border px-[18px] py-[13px]",
      "flex items-center gap-3 sticky top-0 z-10",
      className
    )}>
      {back && (
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          className="w-8 h-8 -ml-1 rounded-[9px] flex items-center justify-center text-ink-muted hover:bg-surface-soft transition-colors cursor-pointer flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-extrabold text-ink">{title}</h3>
        {subtitle && <p className="text-[11px] text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

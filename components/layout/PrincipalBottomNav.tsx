"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { principalNav } from "@/lib/nav-config";

export function PrincipalBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-card border-t border-border flex z-20"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {principalNav.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center pt-2.5 pb-2 transition-colors",
              active ? "text-brand-blue" : "text-ink-muted"
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} className="mb-1" />
            <span className={cn("text-[9px] font-bold tracking-wide", active && "text-brand-blue")}>
              {label}
            </span>
            <div className={cn("mt-0.5 h-0.5 w-5 rounded-full transition-colors", active ? "bg-brand-blue" : "bg-transparent")} />
          </Link>
        );
      })}
    </nav>
  );
}

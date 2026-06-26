"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { navByRole, type NavRole } from "@/lib/nav-config";

interface AppSidebarProps {
  role: NavRole;
  /** Short role label shown under the logo (e.g. "Santri", "Guru"). */
  roleLabel?: string;
}

/**
 * Desktop primary navigation (>= lg). Replaces the mobile bottom bar with a
 * fixed left rail so the wide desktop viewport is used for content instead of
 * stretching a phone layout edge-to-edge. Hidden below lg — there the
 * role-specific BottomNav takes over.
 */
export function AppSidebar({ role, roleLabel }: AppSidebarProps) {
  const pathname = usePathname();
  const items = navByRole[role];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-surface-card border-r border-border z-30">
      <div className="px-5 py-5 border-b border-border">
        <BrandLogo size={36} />
        {roleLabel && (
          <span className="mt-3 inline-flex items-center px-2.5 py-1 rounded-full bg-surface-soft text-[11px] font-bold text-ink-secondary">
            {roleLabel}
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {items.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-[14px] font-bold transition-colors",
                active
                  ? "bg-surface-soft text-brand-blue"
                  : "text-ink-secondary hover:bg-surface-soft/60 hover:text-ink",
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} className="flex-shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-border">
        <p className="text-[11px] text-ink-muted leading-snug">
          Lentera — platform belajar
          <br />
          Darul Itqon Al Hakim
        </p>
      </div>
    </aside>
  );
}

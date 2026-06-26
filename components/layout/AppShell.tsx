import { AppSidebar } from "@/components/layout/AppSidebar";
import type { NavRole } from "@/lib/nav-config";

interface AppShellProps {
  role: NavRole;
  roleLabel?: string;
  /** Mobile bottom navigation (role-specific). Hidden at >= lg via its own class. */
  bottomNav: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Responsive app frame shared by every role.
 *
 * - Mobile (< lg): unchanged — full-bleed content + fixed bottom nav.
 * - Desktop (>= lg): a fixed 256px left sidebar replaces the bottom nav, and
 *   page content is shifted clear of it and centred in a max-width column so it
 *   no longer stretches edge-to-edge (the "components look tiny" complaint).
 *
 * Pages keep their own internal padding; this only owns width + the rail.
 */
export function AppShell({ role, roleLabel, bottomNav, children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-surface-page">
      <AppSidebar role={role} roleLabel={roleLabel} />
      <main className="pb-safe lg:pb-14 lg:pl-64">
        <div className="w-full lg:mx-auto lg:max-w-[1120px] lg:px-8 lg:pt-6">
          {children}
        </div>
      </main>
      {bottomNav}
    </div>
  );
}

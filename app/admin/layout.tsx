import { AdminBottomNav } from "@/components/layout/AdminBottomNav";
import { AppShell } from "@/components/layout/AppShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="admin" roleLabel="Admin" bottomNav={<AdminBottomNav />}>
      {children}
    </AppShell>
  );
}

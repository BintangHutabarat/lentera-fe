import { BottomNav } from "@/components/layout/BottomNav";
import { AppShell } from "@/components/layout/AppShell";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="student" roleLabel="Santri" bottomNav={<BottomNav />}>
      {children}
    </AppShell>
  );
}

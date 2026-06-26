import { PrincipalBottomNav } from "@/components/layout/PrincipalBottomNav";
import { AppShell } from "@/components/layout/AppShell";

export default function PrincipalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="principal" roleLabel="Kepala Sekolah" bottomNav={<PrincipalBottomNav />}>
      {children}
    </AppShell>
  );
}

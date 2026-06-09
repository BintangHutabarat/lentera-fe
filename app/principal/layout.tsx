import { PrincipalBottomNav } from "@/components/layout/PrincipalBottomNav";

export default function PrincipalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-page">
      <main className="pb-safe">{children}</main>
      <PrincipalBottomNav />
    </div>
  );
}

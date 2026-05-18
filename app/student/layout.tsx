import { BottomNav } from "@/components/layout/BottomNav";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-page">
      <main className="pb-safe">{children}</main>
      <BottomNav />
    </div>
  );
}

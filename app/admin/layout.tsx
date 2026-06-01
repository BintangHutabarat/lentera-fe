import { AdminBottomNav } from "@/components/layout/AdminBottomNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-page">
      <main className="pb-safe">{children}</main>
      <AdminBottomNav />
    </div>
  );
}

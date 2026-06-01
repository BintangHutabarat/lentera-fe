import { TeacherBottomNav } from "@/components/layout/TeacherBottomNav";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-page">
      <main className="pb-safe">{children}</main>
      <TeacherBottomNav />
    </div>
  );
}

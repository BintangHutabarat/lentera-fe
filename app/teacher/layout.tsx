import { TeacherBottomNav } from "@/components/layout/TeacherBottomNav";
import { AppShell } from "@/components/layout/AppShell";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="teacher" roleLabel="Guru" bottomNav={<TeacherBottomNav />}>
      {children}
    </AppShell>
  );
}

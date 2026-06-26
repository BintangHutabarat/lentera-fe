import {
  Home, BookOpen, ClipboardList, Brain, MessageCircle, User,
  GraduationCap, Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
}

/**
 * Single source of truth for primary navigation per role.
 * Shared by the mobile bottom bar (BottomNav, < lg) and the desktop
 * sidebar (AppSidebar, >= lg) so the two never drift apart.
 */
export const studentNav: NavItem[] = [
  { href: "/student/beranda",   label: "Beranda",   Icon: Home },
  { href: "/student/pelajaran", label: "Pelajaran", Icon: BookOpen },
  { href: "/student/tugas",     label: "Tugas",     Icon: ClipboardList },
  { href: "/student/quiz",      label: "Quiz",      Icon: Brain },
  { href: "/student/forum",     label: "Forum",     Icon: MessageCircle },
  { href: "/student/profil",    label: "Profil",    Icon: User },
];

export const teacherNav: NavItem[] = [
  { href: "/teacher/beranda", label: "Beranda", Icon: Home },
  { href: "/teacher/kelas",   label: "Kelas",   Icon: BookOpen },
  { href: "/teacher/tugas",   label: "Tugas",   Icon: ClipboardList },
  { href: "/teacher/quiz",    label: "Quiz",    Icon: Brain },
  { href: "/teacher/profil",  label: "Profil",  Icon: User },
];

export const adminNav: NavItem[] = [
  { href: "/admin/beranda", label: "Beranda", Icon: Home },
  { href: "/admin/guru",    label: "Guru",    Icon: GraduationCap },
  { href: "/admin/siswa",   label: "Siswa",   Icon: Users },
  { href: "/admin/kelas",   label: "Kelas",   Icon: BookOpen },
  { href: "/admin/profil",  label: "Profil",  Icon: User },
];

export const principalNav: NavItem[] = [
  { href: "/principal/beranda",  label: "Beranda",  Icon: Home },
  { href: "/principal/kelas",    label: "Kelas",    Icon: BookOpen },
  { href: "/principal/pengguna", label: "Pengguna", Icon: Users },
  { href: "/principal/profil",   label: "Profil",   Icon: User },
];

export type NavRole = "student" | "teacher" | "admin" | "principal";

/**
 * Lookup by role. Server Components pass only the `NavRole` string across the
 * server→client boundary; the client sidebar resolves the array here. This
 * avoids serialising the Icon component functions (which Server Components may
 * not pass to Client Components — it breaks the production build).
 */
export const navByRole: Record<NavRole, NavItem[]> = {
  student: studentNav,
  teacher: teacherNav,
  admin: adminNav,
  principal: principalNav,
};

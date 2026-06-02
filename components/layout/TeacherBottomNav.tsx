"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Brain, User, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const NAV_ITEMS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/teacher/beranda", label: "Beranda",  Icon: Home },
  { href: "/teacher/kelas",   label: "Kelas",    Icon: BookOpen },
  { href: "/teacher/tugas",   label: "Tugas",    Icon: ClipboardList },
  { href: "/teacher/quiz",    label: "Quiz",     Icon: Brain },
  { href: "/teacher/profil",  label: "Profil",   Icon: User },
];

export function TeacherBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-border flex z-20"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center pt-2.5 pb-2 transition-colors",
              active ? "text-brand-blue" : "text-ink-muted"
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} className="mb-1" />
            <span className={cn("text-[9px] font-bold tracking-wide", active && "text-brand-blue")}>
              {label}
            </span>
            <div className={cn("mt-0.5 h-0.5 w-5 rounded-full transition-colors", active ? "bg-brand-blue" : "bg-transparent")} />
          </Link>
        );
      })}
    </nav>
  );
}

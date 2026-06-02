"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, HelpCircle, LogOut, Loader2, Bell, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { logout } from "@/lib/services/auth";
import { getTeacherMe } from "@/lib/services/teacher";
import { Avatar } from "@/components/ui/Avatar";
import type { TeacherMe } from "@/lib/services/teacher";

interface MenuItem {
  Icon: LucideIcon;
  bg: string;
  label: string;
  danger: boolean;
  href?: string;
  onClick?: () => void;
}

export default function TeacherProfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<TeacherMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    getTeacherMe()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    router.push("/auth/login/staff");
  };

  const MENU_ITEMS: MenuItem[] = [
    { Icon: Bell,       bg: "#FEF9E7", label: "Notifikasi",    danger: false },
    { Icon: Lock,       bg: "#E3FBF5", label: "Ubah Password", danger: false, href: "/auth/change-password" },
    { Icon: HelpCircle, bg: "#EAFBF2", label: "Bantuan & FAQ", danger: false },
    { Icon: LogOut,     bg: "#FEF0EF", label: "Keluar",        danger: true, onClick: handleLogout },
  ];

  const initials = profile?.name
    ? profile.name.split(" ").slice(0, 2).map((n) => n[0]).join("")
    : "GR";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
        Memuat...
      </div>
    );
  }

  return (
    <>
      <div
        className="relative overflow-hidden px-[18px] pb-14 pt-[26px] text-center"
        style={{ background: "linear-gradient(135deg,#2B9FD8 0%,#3DD6B5 60%,#7EEFC7 100%)" }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/8" />
        <Avatar
          initials={initials}
          bgColor="rgba(255,255,255,0.22)"
          textColor="#ffffff"
          size="lg"
          className="border-[3px] border-white/40 mx-auto mb-2.5"
        />
        <div className="text-[18px] font-extrabold text-white">{profile?.name ?? "—"}</div>
        <div className="text-[12px] text-white/80 mt-1">
          {profile?.title ? `${profile.title} • ` : ""}{profile?.school.name ?? ""}
        </div>
      </div>

      <div className="px-3.5">
        <div className="card -mt-7 relative z-10 mb-3.5">
          <div className="grid grid-cols-2 text-center divide-x divide-border">
            <div className="py-3">
              <div className="text-[13px] font-extrabold truncate px-2" style={{ color: "#2B9FD8" }}>
                {profile?.nip ?? "—"}
              </div>
              <div className="text-[10px] text-ink-muted mt-0.5">NIP</div>
            </div>
            <div className="py-3">
              <div className="text-[13px] font-extrabold truncate px-2" style={{ color: "#3DD6B5" }}>
                Guru
              </div>
              <div className="text-[10px] text-ink-muted mt-0.5">Role</div>
            </div>
          </div>
        </div>

        {profile?.email && (
          <div className="card p-3.5 flex items-center gap-2.5 mb-3.5">
            <div className="w-9 h-9 rounded-[10px] bg-blue-light flex items-center justify-center flex-shrink-0">
              <Mail size={16} className="text-brand-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-ink-muted">Email</div>
              <div className="text-[12px] font-bold text-ink truncate">{profile.email}</div>
            </div>
          </div>
        )}

        <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Pengaturan Akun</h3>
        <div className="card mb-3.5">
          {MENU_ITEMS.map(({ Icon, bg, label, danger, href, onClick }, i) => {
            const body = (
              <>
                <div
                  className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-shrink-0"
                  style={{ background: bg }}
                >
                  {loggingOut && danger ? (
                    <Loader2 size={17} style={{ color: "#b83232" }} className="animate-spin" />
                  ) : (
                    <Icon size={17} style={{ color: danger ? "#b83232" : "#1C3B4A" }} strokeWidth={1.8} />
                  )}
                </div>
                <div className={`flex-1 text-[13px] font-semibold ${danger ? "text-red-dark" : "text-ink"}`}>
                  {label}
                </div>
                {!danger && <div className="text-ink-muted text-sm">›</div>}
              </>
            );
            const classes = `w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-soft transition-colors cursor-pointer ${
              i < MENU_ITEMS.length - 1 ? "border-b border-surface-soft" : ""
            } disabled:opacity-60`;
            if (href) {
              return (
                <Link key={label} href={href} className={classes}>
                  {body}
                </Link>
              );
            }
            return (
              <button
                key={label}
                onClick={onClick}
                disabled={loggingOut && danger}
                className={classes}
              >
                {body}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Lightbulb, GraduationCap, Users, BookOpen, LogOut, BookMarked, CalendarDays } from "lucide-react";
import { getAdminMe, getAdminClasses } from "@/lib/services/admin";
import { logout } from "@/lib/services/auth";
import { Avatar } from "@/components/ui/Avatar";
import type { AdminMe, AdminClass } from "@/lib/services/admin";

const QUICK_ACTIONS = [
  { label: "Data Guru",  Icon: GraduationCap, href: "/admin/guru",   color: "#2B9FD8", bg: "#E6F6FD" },
  { label: "Data Siswa", Icon: Users,          href: "/admin/siswa",  color: "#3DD6B5", bg: "#E3FBF5" },
  { label: "Kelas",      Icon: BookOpen,       href: "/admin/kelas",  color: "#F5C518", bg: "#FEF9E7" },
  { label: "Mapel",      Icon: BookMarked,     href: "/admin/mapel",  color: "#7a5cf1", bg: "#EDF3FF" },
  { label: "Jadwal",     Icon: CalendarDays,   href: "/admin/jadwal", color: "#1a8a75", bg: "#E3FBF5" },
];

export default function AdminBerandaPage() {
  const router = useRouter();
  const [me, setMe] = useState<AdminMe | null>(null);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminMe(), getAdminClasses()])
      .then(([adminMe, cls]) => { setMe(adminMe); setClasses(cls); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login/staff");
  };

  const initials = me?.name
    ? me.name.split(" ").slice(0, 2).map((n) => n[0]).join("")
    : "AD";

  const totalStudents = 0;
  const classCount = classes.length;

  return (
    <>
      <div
        className="relative overflow-hidden px-[18px] pb-6 pt-[18px]"
        style={{ background: "linear-gradient(135deg,#4361EE 0%,#2B9FD8 60%,#3DD6B5 100%)" }}
      >
        <div className="absolute -top-12 -right-10 w-44 h-44 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 left-[5%] w-36 h-36 rounded-full bg-white/7" />

        <div className="relative flex items-center justify-between mb-[18px]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/20 rounded-[10px] flex items-center justify-center">
              <Lightbulb size={18} className="text-white" fill="rgba(255,255,255,0.9)" />
            </div>
            <span className="text-[18px] font-extrabold text-white tracking-tight">Lentera Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-[34px] h-[34px] bg-white/18 rounded-[9px] flex items-center justify-center cursor-pointer">
              <Bell size={16} className="text-white" />
            </button>
            <button
              onClick={handleLogout}
              className="w-[34px] h-[34px] bg-white/18 rounded-[9px] flex items-center justify-center cursor-pointer"
              aria-label="Keluar"
            >
              <LogOut size={15} className="text-white" />
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-[19px] font-extrabold text-white mb-1">
              {loading ? "Memuat..." : `Halo, ${me?.name?.split(" ")[0] ?? "Admin"}!`}
            </h2>
            <p className="text-[12px] text-white/80">
              {me?.school?.name ?? ""}
              {me?.scope === "SUPER" ? " • Super Admin" : ""}
            </p>
          </div>
          <Avatar
            initials={initials}
            bgColor="rgba(255,255,255,0.22)"
            textColor="#ffffff"
            size="lg"
            className="w-12 h-12 border-2 border-white/35 text-[15px]"
          />
        </div>
      </div>

      <div className="px-3.5 pt-3.5 pb-24">
        {/* Profile summary card */}
        {!loading && me && (
          <div className="card p-4 mb-3.5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#EDF3FF] flex items-center justify-center text-[15px] font-extrabold text-[#4361EE] flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-extrabold text-ink truncate">{me.name}</div>
              <div className="text-[11px] text-ink-muted mt-0.5 truncate">{me.email}</div>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#EDF3FF] text-[#3d5af1] flex-shrink-0">
              {me.scope}
            </span>
          </div>
        )}

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 gap-2.5 mb-3.5">
            <div className="card p-3.5">
              <div className="text-[22px] font-extrabold text-brand-blue">{classCount}</div>
              <div className="text-[11px] text-ink-muted mt-0.5">Total Kelas</div>
            </div>
            <div className="card p-3.5">
              <div className="text-[22px] font-extrabold text-brand-teal">{totalStudents}</div>
              <div className="text-[11px] text-ink-muted mt-0.5">Total Siswa</div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Menu Utama</h3>
        <div className="card mb-3.5">
          {QUICK_ACTIONS.map(({ label, Icon, href, color, bg }, i) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-surface-soft transition-colors ${
                i < QUICK_ACTIONS.length - 1 ? "border-b border-surface-soft" : ""
              }`}
            >
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}
              >
                <Icon size={20} strokeWidth={1.8} style={{ color }} />
              </div>
              <div className="flex-1 text-[13px] font-extrabold text-ink">{label}</div>
              <span className="text-ink-muted text-sm">›</span>
            </Link>
          ))}
        </div>

        {/* Classes preview */}
        {classes.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[14px] font-extrabold text-ink">Kelas Aktif</h3>
              <Link href="/admin/kelas" className="text-[12px] font-bold text-brand-blue">Lihat semua</Link>
            </div>
            <div className="card">
              {classes.slice(0, 4).map((cls, i) => (
                <Link
                  key={cls.id}
                  href={`/admin/kelas/${cls.id}`}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-surface-soft transition-colors ${
                    i < Math.min(classes.length, 4) - 1 ? "border-b border-surface-soft" : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-[10px] bg-yellow-light flex items-center justify-center flex-shrink-0">
                    <BookOpen size={17} className="text-yellow-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-extrabold text-ink">{cls.name}</div>
                    <div className="text-[11px] text-ink-muted mt-0.5">
                      {cls.studentCount} siswa · {cls.subjectCount} mapel
                    </div>
                  </div>
                  <span className="text-ink-muted text-sm">›</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

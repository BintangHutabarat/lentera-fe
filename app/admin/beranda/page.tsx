"use client";
import { useEffect, useState } from "react";
import { Bell, Lightbulb, GraduationCap, Users, BookOpen, Settings, LogOut, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getMe, logout } from "@/lib/services/auth";
import { Avatar } from "@/components/ui/Avatar";
import type { AdminProfile } from "@/lib/services/auth";

const MENU_SECTIONS = [
  {
    title: "Manajemen Pengguna",
    items: [
      { label: "Data Guru",  Icon: GraduationCap, desc: "Kelola akun dan data guru",         href: "/admin/guru",   color: "#2B9FD8", bg: "#E6F6FD" },
      { label: "Data Siswa", Icon: Users,          desc: "Kelola akun dan data siswa",         href: "/admin/siswa",  color: "#3DD6B5", bg: "#E3FBF5" },
      { label: "Data Kelas", Icon: BookOpen,       desc: "Buat dan atur kelas, jurusan",       href: "/admin/kelas",  color: "#F5C518", bg: "#FEF9E7" },
    ],
  },
  {
    title: "Laporan & Analitik",
    items: [
      { label: "Statistik Sekolah", Icon: BarChart3, desc: "Ringkasan aktivitas belajar",     href: "/admin/statistik", color: "#7a5c00", bg: "#FEF9E7" },
      { label: "Pengaturan",        Icon: Settings,  desc: "Konfigurasi platform sekolah",    href: "/admin/pengaturan", color: "#4361EE", bg: "#EDF3FF" },
    ],
  },
];

export default function AdminBerandaPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((user) => setProfile(user.profile as AdminProfile))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login/staff");
  };

  const initials = profile?.name
    ? profile.name.split(" ").slice(0, 2).map((n) => n[0]).join("")
    : "AD";

  return (
    <>
      {/* Header */}
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
              {loading ? "Memuat..." : `Halo, ${profile?.name?.split(" ")[0] ?? "Admin"}!`}
            </h2>
            <p className="text-[12px] text-white/80">
              {profile?.school ?? ""}{profile?.scope ? ` • ${profile.scope}` : ""}
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

      <div className="px-3.5 pt-3.5">
        {/* Profile card */}
        {!loading && profile && (
          <div className="card p-4 mb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#EDF3FF] flex items-center justify-center text-[15px] font-extrabold text-[#4361EE] flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-extrabold text-ink">{profile.name}</div>
                <div className="text-[11px] text-ink-muted mt-0.5">{profile.school}</div>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#EDF3FF] text-[#3d5af1]">
                Admin
              </span>
            </div>
          </div>
        )}

        {/* Menu sections */}
        {MENU_SECTIONS.map((section) => (
          <div key={section.title} className="mb-3.5">
            <h3 className="text-[14px] font-extrabold text-ink mb-2.5">{section.title}</h3>
            <div className="card">
              {section.items.map(({ label, Icon, desc, bg, color }, i) => (
                <div
                  key={label}
                  className={`flex gap-3 items-center px-4 py-3 opacity-60 ${
                    i < section.items.length - 1 ? "border-b border-surface-soft" : ""
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                    style={{ background: bg }}
                  >
                    <Icon size={20} strokeWidth={1.8} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-extrabold text-ink">{label}</div>
                    <div className="text-[11px] text-ink-muted mt-0.5">{desc}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-soft text-ink-muted whitespace-nowrap">
                    Segera
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-card p-4 text-center mb-4" style={{ background: "linear-gradient(135deg,#4361EE 0%,#2B9FD8 100%)" }}>
          <p className="text-[13px] font-extrabold text-white mb-1">Portal Admin sedang dikembangkan</p>
          <p className="text-[11px] text-white/80">Fitur lengkap akan segera tersedia. Terima kasih atas kesabarannya!</p>
        </div>
      </div>
    </>
  );
}

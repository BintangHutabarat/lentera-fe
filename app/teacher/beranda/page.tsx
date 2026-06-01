"use client";
import { useEffect, useState } from "react";
import { Bell, Lightbulb, ClipboardList, Brain, MessageCircle, Users, BookOpen, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { getMe, logout } from "@/lib/services/auth";
import { Avatar } from "@/components/ui/Avatar";
import type { TeacherProfile } from "@/lib/services/auth";

const QUICK_ACTIONS = [
  { label: "Kelas",   Icon: BookOpen,      href: "/teacher/kelas" },
  { label: "Tugas",   Icon: ClipboardList, href: "/teacher/tugas" },
  { label: "Siswa",   Icon: Users,         href: "/teacher/siswa" },
  { label: "Forum",   Icon: MessageCircle, href: "/teacher/forum" },
];

const COMING_SOON = [
  { label: "Buat Tugas",   Icon: ClipboardList, desc: "Buat dan bagikan tugas ke kelas" },
  { label: "Buat Quiz",    Icon: Brain,          desc: "Buat soal latihan interaktif" },
  { label: "Kelola Kelas", Icon: Users,          desc: "Lihat daftar siswa per kelas" },
  { label: "Nilai",        Icon: BookOpen,       desc: "Rekap dan input nilai siswa" },
];

export default function TeacherBerandaPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((user) => setProfile(user.profile as TeacherProfile))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login/staff");
  };

  const initials = profile?.name
    ? profile.name.split(" ").slice(0, 2).map((n) => n[0]).join("")
    : "GR";

  return (
    <>
      {/* Header */}
      <div
        className="relative overflow-hidden px-[18px] pb-6 pt-[18px]"
        style={{ background: "linear-gradient(135deg,#2B9FD8 0%,#3DD6B5 60%,#7EEFC7 100%)" }}
      >
        <div className="absolute -top-12 -right-10 w-44 h-44 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 left-[5%] w-36 h-36 rounded-full bg-white/7" />

        <div className="relative flex items-center justify-between mb-[18px]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/20 rounded-[10px] flex items-center justify-center">
              <Lightbulb size={18} className="text-white" fill="rgba(255,255,255,0.9)" />
            </div>
            <span className="text-[18px] font-extrabold text-white tracking-tight">Lentera</span>
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
              {loading ? "Memuat..." : `Selamat datang, ${profile?.name?.split(" ")[0] ?? "Guru"}!`}
            </h2>
            <p className="text-[12px] text-white/80">
              {profile?.title ? `${profile.title} • ` : ""}{profile?.school ?? ""}
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
              <div className="w-11 h-11 rounded-full bg-blue-light flex items-center justify-center text-[15px] font-extrabold text-brand-blue flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-extrabold text-ink">{profile.name}</div>
                <div className="text-[11px] text-ink-muted mt-0.5">NIP: {profile.nip}</div>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-light text-blue-dark">
                Guru
              </span>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2.5 mb-3.5">
          {QUICK_ACTIONS.map(({ label, Icon }) => (
            <div
              key={label}
              className="bg-surface-card border border-border rounded-[9px] py-3.5 px-2 text-center opacity-50"
            >
              <div className="flex justify-center mb-1.5">
                <Icon size={20} className="text-brand-blue" strokeWidth={2} />
              </div>
              <div className="text-[11px] font-bold text-ink">{label}</div>
            </div>
          ))}
        </div>

        {/* Coming soon */}
        <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Fitur Tersedia</h3>
        <div className="flex flex-col gap-2.5 mb-4">
          {COMING_SOON.map(({ label, Icon, desc }) => (
            <div
              key={label}
              className="card p-4 flex gap-3 items-center opacity-60"
            >
              <div className="w-10 h-10 rounded-[10px] bg-blue-light flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-brand-blue" strokeWidth={1.8} />
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

        <div className="rounded-card p-4 text-center" style={{ background: "linear-gradient(135deg,#2B9FD8 0%,#3DD6B5 100%)" }}>
          <p className="text-[13px] font-extrabold text-white mb-1">Portal Guru sedang dikembangkan</p>
          <p className="text-[11px] text-white/80">Fitur lengkap akan segera tersedia. Terima kasih atas kesabarannya!</p>
        </div>
      </div>
    </>
  );
}

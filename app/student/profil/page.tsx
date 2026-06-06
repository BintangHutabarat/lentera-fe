"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCog, Bell, Lock, HelpCircle, LogOut, Loader2, X, Camera } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getStudentProfile, getStudentStats, getStudentBadges, updateAvatar } from "@/lib/services/student";
import { logout } from "@/lib/services/auth";
import { presignUpload, uploadFile } from "@/lib/services/uploads";
import { Avatar } from "@/components/ui/Avatar";
import type { StudentProfile, StudentStats, Badge } from "@/lib/services/student";

interface MenuItem {
  Icon: LucideIcon;
  bg: string;
  label: string;
  danger: boolean;
  onClick?: () => void;
}

export default function ProfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getStudentProfile(), getStudentStats(), getStudentBadges()])
      .then(([p, s, b]) => {
        setProfile(p);
        setStats(s);
        setBadges(b);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    router.push("/auth/login/siswa");
  };

  const handleAvatarFile = async (file: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Ukuran foto maks 2 MB.");
      return;
    }
    setUploadingAvatar(true);
    setAvatarError(null);
    try {
      const { uploadUrl, fileKey } = await presignUpload("avatar", file.name, file.size, file.type);
      await uploadFile(uploadUrl, file);
      const avatarUrl = uploadUrl.split("?")[0];
      await updateAvatar(avatarUrl || fileKey);
      setProfile((prev) => prev ? { ...prev, avatar: avatarUrl || fileKey } : prev);
      setEditingAvatar(false);
    } catch {
      setAvatarError("Gagal upload foto.");
    }
    setUploadingAvatar(false);
  };

  const MENU_ITEMS: MenuItem[] = [
    { Icon: UserCog,    bg: "#E6F6FD", label: "Edit Profil",   danger: false, onClick: () => setEditingAvatar(true) },
    { Icon: Bell,       bg: "#FEF9E7", label: "Notifikasi",    danger: false },
    { Icon: Lock,       bg: "#E3FBF5", label: "Keamanan Akun", danger: false },
    { Icon: HelpCircle, bg: "#EAFBF2", label: "Bantuan & FAQ", danger: false },
    { Icon: LogOut,     bg: "#FEF0EF", label: "Keluar",        danger: true, onClick: handleLogout },
  ];

  if (loading || !profile || !stats) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
        Memuat...
      </div>
    );
  }

  const initials = profile.name.split(" ").slice(0, 2).map((n) => n[0]).join("");

  return (
    <>
      {/* Hero */}
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
        <div className="text-[18px] font-extrabold text-white">{profile.name}</div>
        <div className="text-[12px] text-white/80 mt-1">{profile.class.name} • {profile.school.name}</div>
      </div>

      <div className="px-3.5">
        {/* Stats float card */}
        <div className="card -mt-7 relative z-10 mb-3.5">
          <div className="grid grid-cols-3 text-center divide-x divide-border">
            {[
              { val: profile.level,               color: "#2B9FD8", label: "Level" },
              { val: profile.xp.toLocaleString(), color: "#7a5c00", label: "Total XP" },
              { val: `${stats.attendance}%`,       color: "#3DD6B5", label: "Kehadiran" },
            ].map((item) => (
              <div key={item.label} className="py-3">
                <div className="text-[19px] font-extrabold" style={{ color: item.color }}>{item.val}</div>
                <div className="text-[10px] text-ink-muted mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Lencana Saya</h3>
        <div className="card p-4 mb-3.5">
          <div className="flex gap-1.5 flex-wrap">
            {badges.map((b) => (
              <span
                key={b.id}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  b.earned
                    ? "bg-yellow-light text-yellow-dark"
                    : "bg-surface-soft text-ink-muted"
                }`}
              >
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* Menu */}
        <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Pengaturan Akun</h3>
        <div className="card mb-3.5">
          {MENU_ITEMS.map(({ Icon, bg, label, danger, onClick }, i) => (
            <button
              key={label}
              onClick={onClick}
              disabled={loggingOut && danger}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-soft transition-colors cursor-pointer ${
                i < MENU_ITEMS.length - 1 ? "border-b border-surface-soft" : ""
              } disabled:opacity-60`}
            >
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
            </button>
          ))}
        </div>
      </div>

      {/* Avatar upload modal */}
      {editingAvatar && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end" onClick={() => setEditingAvatar(false)}>
          <div
            className="w-full bg-surface-card rounded-t-[20px] p-5 flex flex-col gap-4"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-extrabold text-ink">Ganti Foto Profil</h3>
              <button
                onClick={() => setEditingAvatar(false)}
                className="w-7 h-7 rounded-full bg-surface-soft flex items-center justify-center cursor-pointer"
              >
                <X size={14} className="text-ink-muted" />
              </button>
            </div>

            {avatarError && (
              <div className="text-[12px] text-red-dark bg-red-light rounded-[10px] px-3 py-2">{avatarError}</div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarFile(file);
              }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-opacity"
            >
              {uploadingAvatar ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
              {uploadingAvatar ? "Mengupload..." : "Pilih Foto"}
            </button>
            <p className="text-[11px] text-ink-muted text-center">Format: JPG, PNG, WebP. Maks 2 MB.</p>
          </div>
        </div>
      )}
    </>
  );
}

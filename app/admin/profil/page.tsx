"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, LogOut, Loader2, Mail, ShieldCheck } from "lucide-react";
import { getAdminMe } from "@/lib/services/admin";
import { logout } from "@/lib/services/auth";
import { Avatar } from "@/components/ui/Avatar";
import type { AdminMe } from "@/lib/services/admin";

export default function AdminProfilPage() {
  const router = useRouter();
  const [me, setMe] = useState<AdminMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    getAdminMe()
      .then(setMe)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    router.push("/auth/login/staff");
  };

  const initials = me?.name
    ? me.name.split(" ").slice(0, 2).map((n) => n[0]).join("")
    : "AD";

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>;
  }

  return (
    <>
      <div
        className="relative overflow-hidden px-[18px] pb-14 pt-[26px] text-center"
        style={{ background: "linear-gradient(135deg,#1a7a45 0%,#22A96C 60%,#3DD6B5 100%)" }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/8" />
        <Avatar
          initials={initials}
          bgColor="rgba(255,255,255,0.22)"
          textColor="#ffffff"
          size="lg"
          className="border-[3px] border-white/40 mx-auto mb-2.5"
        />
        <div className="text-[18px] font-extrabold text-white">{me?.name ?? "—"}</div>
        <div className="text-[12px] text-white/80 mt-1">{me?.school?.name ?? ""}</div>
      </div>

      <div className="px-3.5 pb-24">
        {/* Stats card */}
        <div className="card -mt-7 relative z-10 mb-3.5">
          <div className="grid grid-cols-2 text-center divide-x divide-border">
            {[
              { val: me?.scope ?? "SCHOOL", color: "#1a7a45", label: "Scope" },
              { val: "Admin", color: "#22A96C", label: "Role" },
            ].map((item) => (
              <div key={item.label} className="py-3">
                <div className="text-[13px] font-extrabold truncate px-2" style={{ color: item.color }}>{item.val}</div>
                <div className="text-[10px] text-ink-muted mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Informasi Akun</h3>
        <div className="card mb-3.5">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-soft">
            <div className="w-[34px] h-[34px] rounded-[9px] bg-[#EDF3FF] flex items-center justify-center flex-shrink-0">
              <Mail size={16} style={{ color: "#1a7a45" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-ink-muted">Email</div>
              <div className="text-[13px] font-semibold text-ink truncate">{me?.email ?? "—"}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-[34px] h-[34px] rounded-[9px] bg-teal-light flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={16} className="text-teal-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-ink-muted">Sekolah</div>
              <div className="text-[13px] font-semibold text-ink">{me?.school?.name ?? "—"}</div>
            </div>
          </div>
        </div>

        <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Pengaturan</h3>
        <div className="card mb-3.5">
          <Link
            href="/auth/change-password"
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-soft transition-colors border-b border-surface-soft"
          >
            <div className="w-[34px] h-[34px] rounded-[9px] bg-[#E3FBF5] flex items-center justify-center flex-shrink-0">
              <Lock size={16} style={{ color: "#1a8a75" }} />
            </div>
            <div className="flex-1 text-[13px] font-semibold text-ink">Ubah Password</div>
            <span className="text-ink-muted text-sm">›</span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-soft transition-colors cursor-pointer disabled:opacity-60"
          >
            <div className="w-[34px] h-[34px] rounded-[9px] bg-[#FEF0EF] flex items-center justify-center flex-shrink-0">
              {loggingOut
                ? <Loader2 size={16} style={{ color: "#b83232" }} className="animate-spin" />
                : <LogOut size={16} style={{ color: "#b83232" }} />}
            </div>
            <div className="flex-1 text-[13px] font-semibold text-red-dark text-left">Keluar</div>
          </button>
        </div>
      </div>
    </>
  );
}

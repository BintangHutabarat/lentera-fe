"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, LogOut, School } from "lucide-react";
import { PageTopbar } from "@/components/layout/PageTopbar";
import { getPrincipalMe } from "@/lib/services/principal";
import { logout } from "@/lib/services/auth";
import { Avatar } from "@/components/ui/Avatar";
import type { PrincipalMe } from "@/lib/services/principal";

export default function PrincipalProfilPage() {
  const router = useRouter();
  const [me, setMe] = useState<PrincipalMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrincipalMe()
      .then(setMe)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login/staff");
  };

  const initials = me?.name.split(" ").slice(0, 2).map((n) => n[0]).join("") ?? "KS";

  return (
    <>
      <PageTopbar title="Profil" subtitle="Kepala Sekolah" />

      <div className="px-3.5 pt-3.5 pb-24">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>
        ) : !me ? null : (
          <>
            <div className="card p-5 mb-3.5 flex flex-col items-center text-center gap-2">
              <Avatar initials={initials} size="lg" className="w-16 h-16 text-[20px]" />
              <div>
                <div className="text-[15px] font-extrabold text-ink">{me.name}</div>
                <div className="text-[12px] text-ink-muted mt-0.5">{me.email}</div>
                <div className="flex items-center justify-center gap-1 mt-1.5">
                  <Crown size={12} className="text-brand-blue" />
                  <span className="text-[11px] font-bold text-brand-blue">Kepala Sekolah</span>
                </div>
              </div>
            </div>

            <div className="card mb-3.5">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-[10px] bg-surface-soft flex items-center justify-center flex-shrink-0">
                  <School size={16} className="text-brand-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-ink-muted">Sekolah</div>
                  <div className="text-[13px] font-bold text-ink">{me.school.name}</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full h-12 rounded-[12px] border border-red-dark/30 text-red-dark text-[14px] font-extrabold flex items-center justify-center gap-2 cursor-pointer hover:bg-red-light transition-colors"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </>
        )}
      </div>
    </>
  );
}

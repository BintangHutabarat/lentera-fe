"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, GraduationCap } from "lucide-react";
import { PageTopbar } from "@/components/layout/PageTopbar";
import { getAdminUsers } from "@/lib/services/admin";
import type { AdminUser } from "@/lib/services/admin";

export default function AdminGuruPage() {
  const [teachers, setTeachers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminUsers({ role: "TEACHER" })
      .then(setTeachers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? teachers.filter((t) =>
        t.profile.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (t.profile.nip ?? "").includes(search))
    : teachers;

  const initials = (name: string) => name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  return (
    <>
      <PageTopbar
        title="Data Guru"
        subtitle={`${teachers.length} guru terdaftar`}
        right={
          <Link
            href="/admin/guru/buat"
            className="w-9 h-9 rounded-[10px] bg-brand-blue flex items-center justify-center cursor-pointer"
          >
            <Plus size={18} className="text-white" />
          </Link>
        }
      />

      <div className="px-3.5 pt-3.5 pb-24 flex flex-col gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau NIP..."
            className="w-full h-10 rounded-[10px] border border-border bg-surface-card pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-muted outline-none focus:border-brand-blue"
          />
        </div>

        {loading ? (
          <div className="text-center text-[13px] text-ink-muted py-10">Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-light flex items-center justify-center mb-3">
              <GraduationCap size={24} className="text-brand-blue" />
            </div>
            <p className="text-[13px] font-bold text-ink">Tidak ada guru</p>
            <p className="text-[11px] text-ink-muted mt-1">
              {search ? "Coba kata kunci lain." : "Belum ada guru terdaftar."}
            </p>
          </div>
        ) : (
          <div className="card">
            {filtered.map((t, i) => (
              <Link
                key={t.id}
                href={`/admin/guru/${t.id}`}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-surface-soft transition-colors ${
                  i < filtered.length - 1 ? "border-b border-surface-soft" : ""
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-blue-light flex items-center justify-center text-[12px] font-extrabold text-brand-blue flex-shrink-0">
                  {initials(t.profile.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-extrabold text-ink truncate">
                    {t.profile.title ? `${t.profile.name}, ${t.profile.title}` : t.profile.name}
                  </div>
                  <div className="text-[11px] text-ink-muted mt-0.5 truncate">
                    {t.email ?? "—"}
                    {t.profile.nip ? ` · NIP ${t.profile.nip}` : ""}
                  </div>
                </div>
                {!t.isActive && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-light text-red-dark">
                    Nonaktif
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

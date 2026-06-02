"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";
import { PageTopbar } from "@/components/layout/PageTopbar";
import { getAdminUsers, getAdminClasses } from "@/lib/services/admin";
import type { AdminUser, AdminClass } from "@/lib/services/admin";

export default function AdminSiswaPage() {
  const [students, setStudents] = useState<AdminUser[]>([]);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [classFilter, setClassFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminUsers({ role: "STUDENT" }),
      getAdminClasses(),
    ])
      .then(([s, c]) => { setStudents(s); setClasses(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    getAdminUsers({ role: "STUDENT", classId: classFilter || undefined })
      .then(setStudents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [classFilter]);

  const filtered = search.trim()
    ? students.filter((s) => s.profile.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.profile.nis ?? "").includes(search))
    : students;

  const initials = (name: string) => name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  return (
    <>
      <PageTopbar
        title="Data Siswa"
        subtitle={`${students.length} siswa terdaftar`}
        right={
          <Link
            href="/admin/siswa/buat"
            className="w-9 h-9 rounded-[10px] bg-brand-blue flex items-center justify-center cursor-pointer"
          >
            <Plus size={18} className="text-white" />
          </Link>
        }
      />

      <div className="px-3.5 pt-3.5 pb-24 flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau NIS..."
            className="w-full h-10 rounded-[10px] border border-border bg-surface-card pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-muted outline-none focus:border-brand-blue"
          />
        </div>

        {/* Class filter */}
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="w-full h-10 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue cursor-pointer"
        >
          <option value="">Semua Kelas</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* List */}
        {loading ? (
          <div className="text-center text-[13px] text-ink-muted py-10">Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 rounded-full bg-teal-light flex items-center justify-center mb-3">
              <Users size={24} className="text-brand-teal" />
            </div>
            <p className="text-[13px] font-bold text-ink">Tidak ada siswa</p>
            <p className="text-[11px] text-ink-muted mt-1">
              {search ? "Coba kata kunci lain." : "Belum ada siswa terdaftar."}
            </p>
          </div>
        ) : (
          <div className="card">
            {filtered.map((s, i) => (
              <Link
                key={s.id}
                href={`/admin/siswa/${s.id}`}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-surface-soft transition-colors ${
                  i < filtered.length - 1 ? "border-b border-surface-soft" : ""
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-teal-light flex items-center justify-center text-[12px] font-extrabold text-teal-dark flex-shrink-0">
                  {initials(s.profile.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-extrabold text-ink truncate">{s.profile.name}</div>
                  <div className="text-[11px] text-ink-muted mt-0.5">
                    NIS {s.profile.nis ?? "—"} · {s.profile.class ?? "—"}
                  </div>
                </div>
                {!s.isActive && (
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

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { PageTopbar } from "@/components/layout/PageTopbar";
import { getAdminClasses } from "@/lib/services/admin";
import type { AdminClass } from "@/lib/services/admin";

export default function AdminKelasPage() {
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminClasses()
      .then(setClasses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageTopbar
        title="Data Kelas"
        subtitle={`${classes.length} kelas terdaftar`}
        right={
          <Link
            href="/admin/kelas/buat"
            className="w-9 h-9 rounded-[10px] bg-brand-blue flex items-center justify-center cursor-pointer"
          >
            <Plus size={18} className="text-white" />
          </Link>
        }
      />

      <div className="px-3.5 pt-3.5 pb-24 flex flex-col gap-3.5">
        {loading ? (
          <div className="text-center text-[13px] text-ink-muted py-10">Memuat...</div>
        ) : classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 rounded-full bg-yellow-light flex items-center justify-center mb-3">
              <BookOpen size={24} className="text-yellow-dark" />
            </div>
            <p className="text-[13px] font-bold text-ink">Belum ada kelas</p>
            <p className="text-[11px] text-ink-muted mt-1">Tambah kelas baru dengan tombol + di atas.</p>
          </div>
        ) : (
          <div className="card">
            {classes.map((c, i) => (
              <Link
                key={c.id}
                href={`/admin/kelas/${c.id}`}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-surface-soft transition-colors ${
                  i < classes.length - 1 ? "border-b border-surface-soft" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-[10px] bg-yellow-light flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-yellow-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-extrabold text-ink">{c.name}</div>
                  <div className="text-[11px] text-ink-muted mt-0.5">
                    {c.studentCount} siswa · {c.subjectCount} mapel
                  </div>
                </div>
                <span className="text-ink-muted text-sm">›</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

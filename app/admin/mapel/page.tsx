"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, BookMarked, Trash2, ChevronRight } from "lucide-react";
import { PageTopbar } from "@/components/layout/PageTopbar";
import { getAdminSubjects, deleteSubject } from "@/lib/services/admin";
import { subjectColorMap } from "@/lib/utils";
import { isApiError } from "@/lib/api";
import type { AdminSubject } from "@/lib/services/admin";

export default function AdminMapelPage() {
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminSubjects()
      .then(setSubjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (sub: AdminSubject) => {
    if (!confirm(`Hapus mapel "${sub.name}"?`)) return;
    try {
      await deleteSubject(sub.id);
      setSubjects((prev) => prev.filter((s) => s.id !== sub.id));
    } catch (e) {
      const msg = isApiError(e) && e.code === "SUBJECT_IN_USE"
        ? "Tidak bisa dihapus: mapel masih digunakan di kelas."
        : "Gagal menghapus mapel.";
      setError(msg);
    }
  };

  return (
    <>
      <PageTopbar
        title="Data Mapel"
        subtitle={`${subjects.length} mata pelajaran`}
        right={
          <Link
            href="/admin/mapel/buat"
            className="w-9 h-9 rounded-[10px] bg-brand-blue flex items-center justify-center cursor-pointer"
          >
            <Plus size={18} className="text-white" />
          </Link>
        }
      />

      <div className="px-3.5 pt-3.5 pb-24 flex flex-col gap-3">
        {error && (
          <div className="text-[12px] text-red-dark bg-red-light rounded-[10px] px-3 py-2">{error}</div>
        )}

        {loading ? (
          <div className="text-center text-[13px] text-ink-muted py-10">Memuat...</div>
        ) : subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 rounded-full bg-[#EDF3FF] flex items-center justify-center mb-3">
              <BookMarked size={24} style={{ color: "#7a5cf1" }} />
            </div>
            <p className="text-[13px] font-bold text-ink">Belum ada mapel</p>
            <p className="text-[11px] text-ink-muted mt-1">Tambah mata pelajaran dengan tombol + di atas.</p>
          </div>
        ) : (
          <div className="card">
            {subjects.map((sub, i) => {
              const colorKey = sub.color.toLowerCase() as keyof typeof subjectColorMap;
              const colors = subjectColorMap[colorKey] ?? subjectColorMap.blue;
              return (
                <div
                  key={sub.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i < subjects.length - 1 ? "border-b border-surface-soft" : ""
                  }`}
                >
                  <Link href={`/admin/mapel/${sub.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                      <BookMarked size={18} className={colors.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-extrabold text-ink">{sub.name}</div>
                      <div className="text-[11px] text-ink-muted mt-0.5">
                        {sub.shortName} · {sub.classCount} kelas
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-ink-muted flex-shrink-0 mr-1" />
                  </Link>
                  <button
                    onClick={() => handleDelete(sub)}
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center text-ink-muted hover:text-red-dark hover:bg-red-light transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

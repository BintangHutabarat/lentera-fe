"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Paperclip, Plus } from "lucide-react";
import { getTeacherClassSubjects, getTeacherMateri } from "@/lib/services/teacher";
import type { TeacherClassSubject, MateriListItem } from "@/lib/services/teacher";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function TeacherMateriPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [classSubject, setClassSubject] = useState<TeacherClassSubject | null>(null);
  const [materi, setMateri] = useState<MateriListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getTeacherClassSubjects(), getTeacherMateri(id)])
      .then(([all, items]) => {
        const found = all.find((cs) => cs.id === id) ?? null;
        if (!found) setError("Kelas-mapel tidak ditemukan.");
        setClassSubject(found);
        setMateri(items);
      })
      .catch((e) => setError(e?.message ?? "Gagal memuat materi."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>;
  }
  if (error || !classSubject) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-[13px] text-ink-muted">
        <p className="mb-3">{error ?? "Tidak ada data."}</p>
        <button onClick={() => router.back()} className="text-brand-blue font-bold cursor-pointer">Kembali</button>
      </div>
    );
  }

  return (
    <>
      <header className="bg-surface-card border-b border-border px-3.5 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} aria-label="Kembali" className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer flex-shrink-0">
          <ArrowLeft size={18} className="text-ink" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-extrabold text-ink truncate">
            Materi Pelajaran <span className="text-ink-muted font-bold">({materi.length})</span>
          </h3>
          <p className="text-[11px] text-ink-muted truncate">{classSubject.subject.name} • {classSubject.class.name}</p>
        </div>
        <button onClick={() => router.push(`/teacher/kelas/${id}/materi/buat`)} aria-label="Tambah materi" className="w-9 h-9 rounded-[10px] bg-brand-blue text-white flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform cursor-pointer">
          <Plus size={18} />
        </button>
      </header>

      <div className="px-3.5 pt-3 pb-8">
        {materi.length === 0 ? (
          <div className="card p-8 flex flex-col items-center text-center gap-2 mt-2">
            <div className="w-14 h-14 rounded-2xl bg-surface-soft flex items-center justify-center mb-1">
              <FileText size={24} className="text-ink-muted" />
            </div>
            <p className="text-[14px] font-extrabold text-ink">Belum ada materi</p>
            <p className="text-[12px] text-ink-muted max-w-[240px] leading-relaxed">
              Ketuk tombol <span className="font-bold text-brand-blue">+</span> untuk membuat materi pelajaran.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {materi.map((m) => (
              <button key={m.id} onClick={() => router.push(`/teacher/kelas/${id}/materi/${m.id}`)} className="card p-3.5 text-left hover:bg-surface-soft/50 transition-colors cursor-pointer">
                <div className="text-[14px] font-extrabold text-ink leading-snug">{m.title}</div>
                {m.excerpt && <p className="text-[12px] text-ink-muted mt-1 line-clamp-2">{m.excerpt}</p>}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-ink-muted">
                  {m.attachmentCount > 0 && (
                    <span className="flex items-center gap-1"><Paperclip size={11} /> {m.attachmentCount} lampiran</span>
                  )}
                  <span>{formatDate(m.createdAt)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

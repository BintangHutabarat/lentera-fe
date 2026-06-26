"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Loader2, Trash2 } from "lucide-react";
import { getTeacherMateriDetail, deleteTeacherMateri } from "@/lib/services/teacher";
import type { MateriItem } from "@/lib/services/teacher";
import { RichContent } from "@/components/materi/RichContent";
import { FilePreviewModal, type PreviewFile } from "@/components/ui/FilePreviewModal";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function TeacherMateriDetailPage() {
  const { id, materiId } = useParams<{ id: string; materiId: string }>();
  const router = useRouter();

  const [materi, setMateri] = useState<MateriItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<PreviewFile | null>(null);

  useEffect(() => {
    getTeacherMateriDetail(id, materiId)
      .then(setMateri)
      .catch(() => setError("Gagal memuat materi."))
      .finally(() => setLoading(false));
  }, [id, materiId]);

  const handleDelete = async () => {
    if (deleting || !confirm("Hapus materi ini?")) return;
    setDeleting(true);
    try {
      await deleteTeacherMateri(id, materiId);
      router.push(`/teacher/kelas/${id}/materi`);
    } catch {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>;
  }
  if (error || !materi) {
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
        <h3 className="text-[14px] font-extrabold text-ink flex-1 truncate">Detail Materi</h3>
        <button onClick={handleDelete} disabled={deleting} aria-label="Hapus materi" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-ink-muted hover:text-red-dark hover:bg-red-light transition-colors cursor-pointer flex-shrink-0 disabled:opacity-50">
          {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
        </button>
      </header>

      <div className="px-3.5 pt-4 pb-10">
        <h1 className="text-[19px] font-extrabold text-ink leading-snug">{materi.title}</h1>
        <p className="text-[11px] text-ink-muted mt-1 mb-4">{formatDate(materi.createdAt)}</p>

        <RichContent html={materi.body} />

        {materi.attachments.length > 0 && (
          <div className="mt-6">
            <h2 className="text-[13px] font-extrabold text-ink mb-2.5">Lampiran ({materi.attachments.length})</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
              {materi.attachments.map((a) =>
                a.type === "IMAGE" ? (
                  <button key={a.id ?? a.fileName} type="button" onClick={() => setPreview({ url: a.content, fileName: a.fileName, type: "IMAGE" })} className="block rounded-[12px] overflow-hidden border border-border aspect-square cursor-pointer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.content} alt={a.fileName} loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <button key={a.id ?? a.fileName} type="button" onClick={() => setPreview({ url: a.content, fileName: a.fileName, type: "PDF" })} className="flex items-center gap-2.5 rounded-[12px] border border-border bg-surface-card px-3 py-3 hover:bg-surface-soft transition-colors text-left cursor-pointer">
                    <span className="w-9 h-9 rounded-[8px] bg-red-light flex items-center justify-center flex-shrink-0">
                      <FileText size={17} className="text-red-dark" />
                    </span>
                    <span className="text-[12px] font-bold text-ink truncate">{a.fileName}</span>
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      <FilePreviewModal file={preview} onClose={() => setPreview(null)} />
    </>
  );
}

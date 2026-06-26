"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { createTeacherMateri } from "@/lib/services/teacher";
import { isApiError } from "@/lib/api";
import { readAsDataUrl } from "@/lib/files";
import { RichTextEditor } from "@/components/materi/RichTextEditor";
import { AttachmentPicker, attachTypeOf } from "@/components/materi/AttachmentPicker";

/** Anggap body kosong bila tidak ada teks setelah tag dilucuti. */
function htmlIsEmpty(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim() === "";
}

export default function TeacherMateriBuatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = title.trim() !== "" && !htmlIsEmpty(body) && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const attachments = await Promise.all(
        files.map(async (f) => ({
          type: attachTypeOf(f) as "IMAGE" | "PDF",
          content: await readAsDataUrl(f),
          fileName: f.name,
        })),
      );
      await createTeacherMateri(id, { title: title.trim(), body, attachments });
      router.push(`/teacher/kelas/${id}/materi`);
    } catch (err) {
      const codeMap: Record<string, string> = {
        FILE_TOO_LARGE: "Ada lampiran melebihi 3 MB.",
        INVALID_FILE_TYPE: "Ada lampiran dengan tipe tidak didukung.",
        PAYLOAD_TOO_LARGE: "Total lampiran terlalu besar.",
      };
      setError(isApiError(err) ? (codeMap[err.code] ?? err.message) : "Gagal menyimpan materi.");
      setSaving(false);
    }
  };

  return (
    <>
      <header className="bg-surface-card border-b border-border px-3.5 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} aria-label="Kembali" className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer flex-shrink-0">
          <ArrowLeft size={18} className="text-ink" />
        </button>
        <h3 className="text-[14px] font-extrabold text-ink flex-1">Materi Baru</h3>
      </header>

      <div className="px-3.5 pt-3.5 pb-28 flex flex-col gap-3.5">
        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Judul *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Bab 3 — Tata Cara Wudhu" className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue" autoFocus />
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Isi *</label>
          <RichTextEditor value={body} onChange={setBody} />
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Lampiran (opsional)</label>
          <AttachmentPicker files={files} onChange={setFiles} onError={setAttachError} />
          {attachError && <p className="text-[11px] font-bold text-red-dark mt-1.5">{attachError}</p>}
        </div>

        {error && <div className="text-[12px] text-red-dark bg-red-light rounded-[10px] px-3 py-2">{error}</div>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:pl-64 bg-surface-card border-t border-border px-3.5 py-3" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
        <div className="lg:max-w-[1120px] lg:mx-auto">
          <button onClick={handleSave} disabled={!canSave} className="w-full h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Menyimpan..." : "Simpan Materi"}
          </button>
        </div>
      </div>
    </>
  );
}

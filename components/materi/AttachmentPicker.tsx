"use client";
import { useRef } from "react";
import { FileText, ImagePlus, X } from "lucide-react";

export const ATTACH_MAX_FILES = 5;
export const ATTACH_MAX_BYTES = 3 * 1024 * 1024;
export const ATTACH_IMG_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ATTACH_PDF_TYPE = "application/pdf";

/** Tentukan tipe materi dari mime; null jika tidak didukung. */
export function attachTypeOf(file: File): "IMAGE" | "PDF" | null {
  if (ATTACH_IMG_TYPES.includes(file.type)) return "IMAGE";
  if (file.type === ATTACH_PDF_TYPE) return "PDF";
  return null;
}

interface AttachmentPickerProps {
  files: File[];
  onChange: (files: File[]) => void;
  onError: (msg: string | null) => void;
}

export function AttachmentPicker({ files, onChange, onError }: AttachmentPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    onError(null);
    const next = [...files];
    for (const f of Array.from(incoming)) {
      if (next.length >= ATTACH_MAX_FILES) { onError(`Maksimal ${ATTACH_MAX_FILES} lampiran.`); break; }
      if (!attachTypeOf(f)) { onError("Hanya gambar (JPG/PNG/WebP) atau PDF."); continue; }
      if (f.size > ATTACH_MAX_BYTES) { onError("Ukuran tiap file maks 3 MB."); continue; }
      next.push(f);
    }
    onChange(next);
  };

  const removeAt = (i: number) => onChange(files.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-2">
      {files.map((f, i) => {
        const kind = attachTypeOf(f);
        return (
          <div key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-[10px] border border-border bg-surface-card px-3 py-2">
            <span className={`w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0 ${kind === "IMAGE" ? "bg-teal-light" : "bg-red-light"}`}>
              {kind === "IMAGE" ? <ImagePlus size={16} className="text-teal-dark" /> : <FileText size={16} className="text-red-dark" />}
            </span>
            <span className="flex-1 min-w-0 text-[12px] text-ink truncate">{f.name}</span>
            <button type="button" aria-label="Hapus lampiran" onClick={() => removeAt(i)} className="w-7 h-7 rounded-[8px] flex items-center justify-center text-ink-muted hover:text-red-dark hover:bg-red-light transition-colors cursor-pointer flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        );
      })}
      {files.length < ATTACH_MAX_FILES && (
        <button type="button" onClick={() => inputRef.current?.click()} className="h-10 rounded-[10px] border border-dashed border-border text-[12px] font-bold text-ink-secondary hover:bg-surface-soft transition-colors cursor-pointer">
          + Tambah lampiran ({files.length}/{ATTACH_MAX_FILES})
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
      />
    </div>
  );
}

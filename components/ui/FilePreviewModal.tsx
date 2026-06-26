"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Download, ExternalLink, FileText, X } from "lucide-react";

export type PreviewType = "IMAGE" | "PDF" | "OTHER";

export interface PreviewFile {
  /** URL file: bisa data URL base64 atau URL http biasa. */
  url: string;
  fileName?: string | null;
  /** Opsional. Kalau tak diisi, tipe ditebak dari url/fileName. */
  type?: PreviewType;
}

/** Tebak tipe preview dari data URL prefix, nama file, atau ekstensi di url. */
export function inferPreviewType(file: { url?: string | null; fileName?: string | null }): PreviewType {
  const url = file.url ?? "";
  if (url.startsWith("data:image/")) return "IMAGE";
  if (url.startsWith("data:application/pdf")) return "PDF";
  const hay = `${file.fileName ?? ""} ${url.split("?")[0]}`.toLowerCase();
  if (/\.(png|jpe?g|webp|gif|bmp|svg)$/.test(hay) || /\.(png|jpe?g|webp|gif|bmp|svg)[\s]/.test(hay)) return "IMAGE";
  if (/\.pdf$/.test(hay) || /\.pdf[\s]/.test(hay)) return "PDF";
  return "OTHER";
}

/**
 * Modal preview file layar penuh. Gambar tampil via <img>, PDF via <iframe>
 * dengan fallback "buka di tab baru" untuk browser (terutama mobile) yang tak
 * bisa merender PDF data URL inline. Selalu tersedia tombol Unduh.
 *
 * Controlled: render dengan `file` non-null untuk membuka, `onClose` untuk menutup.
 */
export function FilePreviewModal({ file, onClose }: { file: PreviewFile | null; onClose: () => void }) {
  useEffect(() => {
    if (!file) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [file, onClose]);

  // Modal hanya terbuka via interaksi user (pasca-hydration), jadi tidak ada
  // risiko mismatch SSR — cukup pastikan document tersedia sebelum portal.
  if (!file || typeof document === "undefined") return null;

  const type = file.type ?? inferPreviewType(file);
  const name = file.fileName || "File";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ink/85 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Pratinjau ${name}`}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-3.5 py-3 bg-surface-card border-b border-border flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-extrabold text-ink truncate">{name}</div>
        </div>
        <a
          href={file.url}
          download={file.fileName ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-brand-blue hover:bg-blue-light transition-colors"
          aria-label="Unduh file"
        >
          <Download size={18} />
        </a>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-ink hover:bg-surface-soft transition-colors cursor-pointer"
          aria-label="Tutup pratinjau"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div
        className="flex-1 min-h-0 overflow-auto flex items-center justify-center p-3"
        onClick={(e) => e.stopPropagation()}
      >
        {type === "IMAGE" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.url}
            alt={name}
            className="max-w-full max-h-full object-contain rounded-[10px] shadow-lg"
          />
        ) : type === "PDF" ? (
          <div className="w-full h-full flex flex-col gap-2">
            <iframe
              src={file.url}
              title={name}
              className="flex-1 w-full rounded-[10px] bg-white border-0"
            />
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-[11px] text-white/80 hover:text-white underline flex items-center justify-center gap-1.5"
            >
              <ExternalLink size={12} /> PDF tidak tampil? Buka di tab baru
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-surface-card flex items-center justify-center">
              <FileText size={26} className="text-ink-muted" />
            </div>
            <p className="text-[13px] font-bold text-white">{name}</p>
            <p className="text-[11px] text-white/70 max-w-[260px]">
              Tipe file ini tidak bisa dipratinjau di web.
            </p>
            <a
              href={file.url}
              download={file.fileName ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-brand-blue text-white text-[12px] font-extrabold"
            >
              <Download size={14} /> Unduh file
            </a>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

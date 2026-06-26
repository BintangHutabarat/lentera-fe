"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle, ArrowLeft, CalendarClock, CheckCircle2, Download,
  Eye, FileCheck2, FileText, GraduationCap, ListChecks, Loader2,
  MessageSquareText, Paperclip, Star, Upload, X,
} from "lucide-react";
import { getAssignment, submitAssignment } from "@/lib/services/assignments";
import { readAsDataUrl } from "@/lib/files";
import { isApiError } from "@/lib/api";
import { Chip } from "@/components/ui/Chip";
import { FilePreviewModal, type PreviewFile } from "@/components/ui/FilePreviewModal";
import { cn, dueUrgencyStyles, getDueUrgency, getDueLabel, subjectColorMap } from "@/lib/utils";
import { subjectIcons } from "@/lib/icons";
import type { AssignmentDetail } from "@/lib/services/assignments";

function fmtKB(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

function fmtBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function wordCount(s: string) {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

// File dikirim inline sebagai base64 di body JSON; BE membatasi body 10 MB,
// base64 menggembungkan ~1.33x, jadi batasi file mentah ~7 MB.
const MAX_SUBMIT_BYTES = 7 * 1024 * 1024;

export default function TugasDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [essayText, setEssayText] = useState("");
  const [note, setNote] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [justSubmittedAt, setJustSubmittedAt] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewFile | null>(null);

  useEffect(() => {
    getAssignment(params.id)
      .then(setAssignment)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
        Memuat...
      </div>
    );
  }

  if (notFound || !assignment) {
    return (
      <div className="px-3.5 pt-10 text-center">
        <p className="text-[14px] text-ink-muted">Tugas tidak ditemukan.</p>
        <button
          onClick={() => router.push("/student/tugas")}
          className="mt-3 text-[12px] font-bold text-brand-blue cursor-pointer"
        >
          Kembali ke daftar tugas
        </button>
      </div>
    );
  }

  const c = subjectColorMap[assignment.subject.color];
  const SubjIcon = subjectIcons[assignment.subject.color];
  const derivedStatus = assignment.submission ? "selesai" : "belum";
  const urgency = getDueUrgency(assignment.dueAt, derivedStatus);
  const due = dueUrgencyStyles[urgency];
  const dueLabel = getDueLabel(assignment.dueAt, derivedStatus);

  const isSubmitted = derivedStatus === "selesai" || !!justSubmittedAt;
  const submission = justSubmittedAt ? null : assignment.submission;
  const submittedAt = justSubmittedAt ?? assignment.submission?.submittedAt ?? null;

  const isEssay = assignment.type === "ESSAY";
  const isFile = assignment.type === "UPLOAD_FILE";
  const isOnline = assignment.type === "ONLINE";

  const totalRubric = assignment.rubric.reduce((s, r) => s + r.max, 0);

  const words = wordCount(essayText);
  const wordsOK = assignment.minWords ? words >= assignment.minWords : true;
  const canSubmit = isEssay
    ? essayText.trim().length > 0 && wordsOK
    : isFile
    ? !!selectedFile
    : false;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (isFile && selectedFile) {
        const dataUrl = await readAsDataUrl(selectedFile);
        await submitAssignment(params.id, {
          fileUrl: dataUrl,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          note: note || undefined,
        });
      } else if (isEssay) {
        await submitAssignment(params.id, {
          essayText,
          note: note || undefined,
        });
      }
      setShowConfirm(false);
      setJustSubmittedAt(new Date().toISOString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg = isApiError(err) ? err.message : "Gagal mengumpulkan tugas, coba lagi.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface-page">
      <header className="bg-surface-card border-b border-border px-3.5 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer"
          aria-label="Kembali"
        >
          <ArrowLeft size={18} className="text-ink" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-extrabold text-ink truncate">Detail Tugas</h3>
          <p className="text-[11px] text-ink-muted truncate">{assignment.subject.name} • {assignment.teacher.name}</p>
        </div>
      </header>

      <div className={cn("px-3.5 pt-3.5 flex flex-col gap-3", isSubmitted ? "pb-8" : "pb-40")}>
        {/* Header card */}
        <div className="card p-4">
          <div className="flex gap-3 items-start mb-3">
            <div
              className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0"
              style={{ background: `${c.bar}22` }}
            >
              <SubjIcon size={22} strokeWidth={1.5} style={{ color: c.bar }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[15px] font-extrabold text-ink leading-snug">{assignment.title}</h2>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Chip variant={assignment.subject.color}>{assignment.subject.name}</Chip>
                <Chip variant="teal">{assignment.type}</Chip>
                <span
                  className="chip text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                  style={{ background: due.bg, color: due.color }}
                >
                  <CalendarClock size={10} /> {dueLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-3 border-t border-surface-soft text-[11px] text-ink-muted">
            <span className="flex items-center gap-1"><GraduationCap size={12} /> {assignment.teacher.name}</span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1"><Star size={11} /> Max {assignment.maxScore}</span>
            {assignment.totalItems && (
              <>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1"><Paperclip size={11} /> {assignment.totalItems}</span>
              </>
            )}
          </div>
        </div>

        {/* Score */}
        {isSubmitted && submission?.score !== null && submission?.score !== undefined && (
          <div
            className="rounded-card p-4 text-white"
            style={{ background: "linear-gradient(135deg,#3DD6B5 0%,#5FE0A0 100%)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={16} />
              <span className="text-[11px] font-extrabold uppercase tracking-wide">Sudah Dinilai</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[40px] font-extrabold leading-none">{submission.score}</span>
              <span className="text-[14px] font-bold text-white/85">/ {assignment.maxScore}</span>
            </div>
            {submittedAt && (
              <p className="text-[11px] text-white/85 mt-1">
                Dikumpulkan {new Date(submittedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </div>
        )}

        {/* Waiting for grade */}
        {isSubmitted && (!submission?.score) && (
          <div className="rounded-card p-4 flex gap-2.5 items-center bg-yellow-light">
            <div className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center flex-shrink-0">
              <FileCheck2 size={18} className="text-yellow-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-extrabold text-yellow-dark">Menunggu penilaian</div>
              <div className="text-[11px] text-yellow-dark/80 mt-0.5">
                Sudah dikumpulkan. Nilai akan keluar setelah dikoreksi guru.
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {assignment.description && (
          <div className="card p-4">
            <h3 className="text-[13px] font-extrabold text-ink mb-2 flex items-center gap-1.5">
              <FileText size={14} className="text-brand-blue" /> Deskripsi
            </h3>
            <p className="text-[12px] text-ink-secondary leading-relaxed">{assignment.description}</p>
          </div>
        )}

        {/* Instructions */}
        {assignment.instructions.length > 0 && (
          <div className="card p-4">
            <h3 className="text-[13px] font-extrabold text-ink mb-2 flex items-center gap-1.5">
              <ListChecks size={14} className="text-brand-blue" /> Petunjuk
            </h3>
            <ul className="flex flex-col gap-1.5">
              {assignment.instructions.map((inst, i) => (
                <li key={i} className="text-[12px] text-ink-secondary leading-relaxed flex gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-light text-blue-dark text-[10px] font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="flex-1">{inst}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Attachment */}
        {assignment.attachment && (
          <div className="card p-4">
            <h3 className="text-[13px] font-extrabold text-ink mb-2 flex items-center gap-1.5">
              <Paperclip size={14} className="text-brand-blue" /> Lampiran dari guru
            </h3>
            <a
              href={assignment.attachment.url}
              target="_blank"
              rel="noreferrer"
              className="w-full flex gap-3 items-center px-3 py-2.5 rounded-[10px] bg-surface-soft hover:bg-blue-light transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-[8px] bg-red-light flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-red-dark" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-ink truncate">{assignment.attachment.name}</div>
                <div className="text-[10px] text-ink-muted">{fmtKB(assignment.attachment.sizeKB)}</div>
              </div>
              <Download size={16} className="text-brand-blue flex-shrink-0" />
            </a>
          </div>
        )}

        {/* Rubric */}
        {assignment.rubric.length > 0 && (
          <div className="card p-4">
            <h3 className="text-[13px] font-extrabold text-ink mb-2.5 flex items-center gap-1.5">
              <Star size={14} className="text-brand-yellow fill-brand-yellow" /> Kriteria Penilaian
            </h3>
            <div className="flex flex-col gap-2">
              {assignment.rubric.map((r, i) => (
                <div key={i} className="flex justify-between text-[11px]">
                  <span className="font-semibold text-ink">{r.label}</span>
                  <span className="font-extrabold tabular-nums text-ink">{r.max} poin</span>
                </div>
              ))}
              <div className="flex justify-between text-[12px] font-extrabold text-brand-blue pt-2 border-t border-surface-soft mt-1">
                <span>Total</span>
                <span className="tabular-nums">{totalRubric} poin</span>
              </div>
            </div>
          </div>
        )}

        {/* Submitted content */}
        {isSubmitted && submission && (
          <div className="card p-4">
            <h3 className="text-[13px] font-extrabold text-ink mb-2.5 flex items-center gap-1.5">
              <FileCheck2 size={14} className="text-brand-teal" /> Yang kamu kumpulkan
            </h3>
            {submission.kind === "FILE" && submission.fileName ? (
              <button
                type="button"
                disabled={!submission.fileUrl}
                onClick={() => submission.fileUrl && setPreview({ url: submission.fileUrl, fileName: submission.fileName })}
                className="w-full flex gap-3 items-center px-3 py-2.5 rounded-[10px] bg-teal-light mb-2.5 text-left disabled:cursor-default enabled:cursor-pointer"
              >
                <div className="w-9 h-9 rounded-[8px] bg-white flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-teal-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-ink truncate">{submission.fileName}</div>
                  <div className="text-[10px] text-ink-muted">
                    {submission.fileSizeKB !== null && `${fmtKB(submission.fileSizeKB)} • `}
                    {submission.fileUrl ? "Ketuk untuk pratinjau" : new Date(submission.submittedAt).toLocaleDateString("id-ID")}
                  </div>
                </div>
                {submission.fileUrl && <Eye size={16} className="text-teal-dark flex-shrink-0" />}
              </button>
            ) : submission.kind === "ESSAY" && submission.essayText ? (
              <div className="bg-teal-light rounded-[10px] p-3 mb-2.5">
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="font-extrabold text-teal-dark uppercase">Esai</span>
                  <span className="text-ink-muted">
                    {wordCount(submission.essayText)} kata • {new Date(submission.submittedAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <p className="text-[12px] text-ink-secondary leading-relaxed whitespace-pre-wrap">
                  {submission.essayText}
                </p>
              </div>
            ) : null}
            {submission.note && (
              <div className="text-[11px] text-ink-secondary leading-relaxed bg-surface-soft rounded-[10px] p-2.5">
                <div className="text-[10px] font-extrabold text-ink-muted uppercase mb-0.5">Catatan kamu</div>
                {submission.note}
              </div>
            )}
          </div>
        )}

        {/* Feedback */}
        {isSubmitted && submission?.feedback && (
          <div className="card p-4">
            <h3 className="text-[13px] font-extrabold text-ink mb-2 flex items-center gap-1.5">
              <MessageSquareText size={14} className="text-brand-blue" /> Feedback Guru
            </h3>
            <div className="bg-blue-light rounded-[10px] p-3">
              <p className="text-[12px] text-ink-secondary leading-relaxed">{submission.feedback}</p>
              {submission.feedbackFrom && (
                <div className="text-[10px] text-blue-dark font-bold mt-2 flex items-center gap-1">
                  <GraduationCap size={11} /> {submission.feedbackFrom}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit form */}
        {!isSubmitted && !isOnline && (
          <div className="card p-4">
            <h3 className="text-[13px] font-extrabold text-ink mb-3 flex items-center gap-1.5">
              <Upload size={14} className="text-brand-blue" /> Kumpulkan Tugas
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > MAX_SUBMIT_BYTES) {
                  setSubmitError("Ukuran file maks 7 MB.");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  return;
                }
                setSubmitError(null);
                setSelectedFile(f);
              }}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />

            {isFile && (
              selectedFile ? (
                <div className="flex gap-3 items-center px-3 py-2.5 rounded-[10px] bg-blue-light">
                  <div className="w-9 h-9 rounded-[8px] bg-white flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-brand-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-ink truncate">{selectedFile.name}</div>
                    <div className="text-[10px] text-ink-muted">{fmtBytes(selectedFile.size)}</div>
                  </div>
                  <button
                    onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-ink-muted hover:text-red-dark transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center gap-1.5 py-6 rounded-[12px] border-2 border-dashed border-border bg-surface-soft hover:border-brand-blue hover:bg-blue-light transition-colors cursor-pointer"
                >
                  <Upload size={20} className="text-brand-blue" />
                  <span className="text-[12px] font-extrabold text-ink">Pilih file untuk diunggah</span>
                  <span className="text-[10px] text-ink-muted">PDF, DOC, atau gambar — maks 10 MB</span>
                </button>
              )
            )}

            {isEssay && (
              <div>
                <textarea
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  placeholder="Mulai tulis esai kamu di sini..."
                  rows={10}
                  className="w-full rounded-[10px] border border-border bg-surface-card px-3 py-2.5 text-[12px] text-ink placeholder:text-ink-muted focus:border-brand-blue outline-none resize-y leading-relaxed"
                />
                <div className="flex justify-between text-[10px] mt-1 tabular-nums">
                  <span className={cn(wordsOK ? "text-ink-muted" : "text-red-dark font-bold")}>
                    {assignment.minWords ? `Min ${assignment.minWords} kata` : ""}
                  </span>
                  <span className={cn(wordsOK ? "text-ink-muted" : "text-red-dark font-bold")}>{words} kata</span>
                </div>
              </div>
            )}

            <label className="block mt-3">
              <span className="text-[11px] font-extrabold text-ink">Catatan untuk guru (opsional)</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tulis catatan singkat..."
                rows={2}
                className="mt-1.5 w-full rounded-[10px] border border-border bg-surface-card px-3 py-2 text-[12px] text-ink placeholder:text-ink-muted focus:border-brand-blue outline-none resize-none"
              />
            </label>
          </div>
        )}

        {!isSubmitted && isOnline && (
          <div className="card p-4 text-center">
            <p className="text-[12px] text-ink-muted">Tugas ini dikerjakan melalui sistem online di platform quiz.</p>
          </div>
        )}
      </div>

      {!isSubmitted && !isOnline && (
        <div
          className="fixed left-0 right-0 z-10 bg-surface-card border-t border-border px-3.5 py-3"
          style={{ bottom: "calc(64px + env(safe-area-inset-bottom))" }}
        >
          {submitError && (
            <p className="text-[11px] text-red-dark font-bold mb-2 text-center">{submitError}</p>
          )}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!canSubmit}
            className="w-full h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all cursor-pointer"
          >
            {canSubmit
              ? "Kumpulkan Tugas"
              : isFile
              ? "Pilih file dulu"
              : assignment.minWords && words < assignment.minWords
              ? `Min ${assignment.minWords} kata`
              : "Isi esai dulu"}
          </button>
        </div>
      )}

      {showConfirm && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center p-5"
          onClick={() => !submitting && setShowConfirm(false)}
        >
          <div className="absolute inset-0 bg-ink/50" />
          <div
            className="relative bg-surface-card rounded-[16px] p-5 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-yellow-light flex items-center justify-center">
                <AlertCircle size={24} className="text-yellow-dark" />
              </div>
            </div>
            <h3 className="text-[15px] font-extrabold text-ink text-center mb-1">Kumpulkan sekarang?</h3>
            <p className="text-[12px] text-ink-muted text-center mb-4">
              Setelah dikumpulkan kamu tidak bisa mengubah jawaban tanpa izin guru.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-[12px] bg-surface-soft text-[12px] font-extrabold text-ink disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-[12px] bg-brand-blue text-white text-[12px] font-extrabold disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? "Mengirim..." : "Ya, Kumpulkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <FilePreviewModal file={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

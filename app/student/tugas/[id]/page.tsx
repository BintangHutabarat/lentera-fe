"use client";
import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle, ArrowLeft, CalendarClock, CheckCircle2, Download,
  FileCheck2, FileText, GraduationCap, ListChecks, MessageSquareText,
  Paperclip, Star, Upload, X,
} from "lucide-react";
import { mockAssignments } from "@/lib/mock-data";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn, dueUrgencyStyles, subjectColorMap } from "@/lib/utils";
import { subjectIcons } from "@/lib/icons";

interface AssignmentDetail {
  description: string;
  instructions: string[];
  attachment?: { name: string; sizeKB: number };
  rubric: { label: string; max: number; earned?: number }[];
  minWords?: number;
  submission?: {
    kind: "file" | "text";
    fileName?: string;
    fileSizeKB?: number;
    text?: string;
    note?: string;
    submittedAt: string;
  };
  feedback?: string;
  feedbackFrom?: string;
}

const DETAILS: Record<string, AssignmentDetail> = {
  a1: {
    description:
      "Kerjakan 20 soal pilihan ganda tentang penerapan integral tertentu. Soal dikumpulkan online melalui platform ini sebelum pukul 23:59 hari ini.",
    instructions: [
      "Baca soal dengan teliti sebelum menjawab.",
      "Boleh menggunakan kalkulator non-grafik.",
      "Jawaban yang sudah dikumpulkan tidak bisa diubah.",
      "Nilai akan keluar maksimal 1 hari setelah deadline.",
    ],
    rubric: [{ label: "Jawaban benar (20 soal × 5 poin)", max: 100 }],
  },
  a2: {
    description:
      "Buat laporan praktikum gelombang yang sudah dilakukan di Lab IPA. Format: PDF, font Times New Roman 12, spasi 1.5.",
    instructions: [
      "Sertakan: tujuan, alat & bahan, prosedur, data pengamatan, pembahasan, kesimpulan.",
      "Lampirkan minimal 3 dokumentasi foto kegiatan praktikum.",
      "Cantumkan referensi minimal 2 sumber.",
      "Ukuran file maksimal 10 MB.",
    ],
    attachment: { name: "Template-Laporan-Praktikum.pdf", sizeKB: 248 },
    rubric: [
      { label: "Kelengkapan isi", max: 30 },
      { label: "Analisis & pembahasan", max: 30 },
      { label: "Kerapian & format", max: 20 },
      { label: "Referensi", max: 20 },
    ],
  },
  a3: {
    description:
      "Tulis esai kritis yang menganalisis tema, tokoh, dan amanat dari novel 'Laskar Pelangi' karya Andrea Hirata. Minimal 800 kata.",
    instructions: [
      "Tulis esai dalam Bahasa Indonesia yang baik dan benar.",
      "Strukturkan: pendahuluan, isi (analisis tema/tokoh/amanat), penutup.",
      "Sertakan minimal 3 kutipan langsung dari novel sebagai bukti analisis.",
      "Boleh tulis langsung di sini atau lampirkan file (PDF/DOC).",
    ],
    minWords: 800,
    rubric: [
      { label: "Kedalaman analisis", max: 35 },
      { label: "Struktur & koherensi", max: 25 },
      { label: "Penggunaan bukti", max: 20 },
      { label: "Tata bahasa & ejaan", max: 20 },
    ],
  },
  a4: {
    description:
      "Kerjakan 15 soal latihan tentang sistem reproduksi manusia (organ, hormon, dan proses).",
    instructions: [
      "Kerjakan secara mandiri.",
      "Sertakan penjelasan singkat untuk soal essay.",
    ],
    rubric: [
      { label: "Pilihan ganda (10 soal × 5)", max: 50, earned: 45 },
      { label: "Essay singkat (5 soal × 10)", max: 50, earned: 45 },
    ],
    submission: {
      kind: "file",
      fileName: "tugas-biologi-rizky.pdf",
      fileSizeKB: 1240,
      note: "Mohon koreksi soal essay no. 3 ya bu, saya ragu antara dua hormon.",
      submittedAt: "2 hari lalu",
    },
    feedback:
      "Kerja bagus! Pemahaman organ reproduksi sudah kuat. Untuk hormon pada siklus menstruasi masih ada sedikit kebingungan, coba review ulang materi LH dan FSH ya.",
    feedbackFrom: "Bu Wati Rahayu",
  },
  a5: {
    description:
      "Buat laporan praktikum titrasi asam-basa yang sudah dilakukan di Lab Kimia.",
    instructions: [
      "Sertakan: tujuan, hipotesis, data titrasi, perhitungan molaritas, kesimpulan.",
      "Tabel data minimal 3 kali pengulangan.",
    ],
    rubric: [
      { label: "Data & perhitungan", max: 40, earned: 35 },
      { label: "Pembahasan", max: 30, earned: 25 },
      { label: "Kerapian & dokumentasi", max: 30, earned: 25 },
    ],
    submission: {
      kind: "file",
      fileName: "laporan-titrasi-rizky.pdf",
      fileSizeKB: 2150,
      submittedAt: "5 hari lalu",
    },
    feedback:
      "Laporan rapi dan perhitungan benar. Bagian pembahasan masih bisa diperdalam, kaitkan dengan teori indikator pH.",
    feedbackFrom: "Bu Rina Susanti",
  },
};

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

export default function TugasDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const assignment = mockAssignments.find((a) => a.id === params.id);
  const detail = assignment ? DETAILS[assignment.id] : undefined;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitMode, setSubmitMode] = useState<"file" | "text">(
    assignment?.type === "Esai" ? "text" : "file",
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [essayText, setEssayText] = useState("");
  const [note, setNote] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  if (!assignment) {
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

  const c = subjectColorMap[assignment.subjectColor];
  const SubjIcon = subjectIcons[assignment.subjectColor];
  const due = dueUrgencyStyles[assignment.dueUrgency];
  const isSubmitted = assignment.status === "selesai" || justSubmitted;

  const submission = detail?.submission ?? (justSubmitted
    ? submitMode === "file" && selectedFile
      ? {
          kind: "file" as const,
          fileName: selectedFile.name,
          fileSizeKB: Math.round(selectedFile.size / 1024),
          note: note || undefined,
          submittedAt: "Baru saja",
        }
      : submitMode === "text"
      ? {
          kind: "text" as const,
          text: essayText,
          note: note || undefined,
          submittedAt: "Baru saja",
        }
      : undefined
    : undefined);

  const totalRubric = detail?.rubric.reduce((s, r) => s + r.max, 0) ?? 100;
  const earnedRubric = detail?.rubric.reduce((s, r) => s + (r.earned ?? 0), 0) ?? 0;
  const showRubricTotal = (detail?.rubric ?? []).some((r) => r.earned !== undefined);

  const words = wordCount(essayText);
  const wordsOK = detail?.minWords ? words >= detail.minWords : true;
  const canSubmit = submitMode === "file" ? !!selectedFile : essayText.trim().length > 0 && wordsOK;

  const onPickFile = () => fileInputRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setSelectedFile(f);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setShowConfirm(false);
    setJustSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          <p className="text-[11px] text-ink-muted truncate">{assignment.subject} • {assignment.teacher}</p>
        </div>
      </header>

      <div className={cn("px-3.5 pt-3.5 flex flex-col gap-3", isSubmitted ? "pb-8" : "pb-40")}>
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
                <Chip variant={assignment.subjectColor}>{assignment.subject}</Chip>
                <Chip variant="teal">{assignment.type}</Chip>
                <span
                  className="chip text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                  style={{ background: due.bg, color: due.color }}
                >
                  <CalendarClock size={10} /> {assignment.dueLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-3 border-t border-surface-soft text-[11px] text-ink-muted">
            <span className="flex items-center gap-1"><GraduationCap size={12} /> {assignment.teacher}</span>
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

        {isSubmitted && assignment.score !== undefined && (
          <div
            className="rounded-card p-4 text-white"
            style={{ background: "linear-gradient(135deg,#3DD6B5 0%,#5FE0A0 100%)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={16} />
              <span className="text-[11px] font-extrabold uppercase tracking-wide">Sudah Dinilai</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[40px] font-extrabold leading-none">{assignment.score}</span>
              <span className="text-[14px] font-bold text-white/85">/ {assignment.maxScore}</span>
            </div>
            <p className="text-[11px] text-white/85 mt-1">
              Dikumpulkan {submission?.submittedAt ?? "—"}
            </p>
          </div>
        )}

        {isSubmitted && assignment.score === undefined && (
          <div className="rounded-card p-4 flex gap-2.5 items-center bg-yellow-light">
            <div className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center flex-shrink-0">
              <FileCheck2 size={18} className="text-yellow-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-extrabold text-yellow-dark">Menunggu penilaian</div>
              <div className="text-[11px] text-yellow-dark/80 mt-0.5">
                Sudah dikumpulkan {submission?.submittedAt ?? "baru saja"}. Nilai akan keluar setelah dikoreksi guru.
              </div>
            </div>
          </div>
        )}

        {detail?.description && (
          <div className="card p-4">
            <h3 className="text-[13px] font-extrabold text-ink mb-2 flex items-center gap-1.5">
              <FileText size={14} className="text-brand-blue" /> Deskripsi
            </h3>
            <p className="text-[12px] text-ink-secondary leading-relaxed">{detail.description}</p>
          </div>
        )}

        {detail && detail.instructions.length > 0 && (
          <div className="card p-4">
            <h3 className="text-[13px] font-extrabold text-ink mb-2 flex items-center gap-1.5">
              <ListChecks size={14} className="text-brand-blue" /> Petunjuk
            </h3>
            <ul className="flex flex-col gap-1.5">
              {detail.instructions.map((inst, i) => (
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

        {detail?.attachment && (
          <div className="card p-4">
            <h3 className="text-[13px] font-extrabold text-ink mb-2 flex items-center gap-1.5">
              <Paperclip size={14} className="text-brand-blue" /> Lampiran dari guru
            </h3>
            <button className="w-full flex gap-3 items-center px-3 py-2.5 rounded-[10px] bg-surface-soft hover:bg-blue-light transition-colors text-left cursor-pointer">
              <div className="w-9 h-9 rounded-[8px] bg-red-light flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-red-dark" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-ink truncate">{detail.attachment.name}</div>
                <div className="text-[10px] text-ink-muted">{fmtKB(detail.attachment.sizeKB)}</div>
              </div>
              <Download size={16} className="text-brand-blue flex-shrink-0" />
            </button>
          </div>
        )}

        {detail && detail.rubric.length > 0 && (
          <div className="card p-4">
            <h3 className="text-[13px] font-extrabold text-ink mb-2.5 flex items-center gap-1.5">
              <Star size={14} className="text-brand-yellow fill-brand-yellow" /> Kriteria Penilaian
            </h3>
            <div className="flex flex-col gap-2">
              {detail.rubric.map((r, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-ink">{r.label}</span>
                    <span className="font-extrabold tabular-nums text-ink">
                      {r.earned !== undefined ? `${r.earned}/${r.max}` : `${r.max}`}
                    </span>
                  </div>
                  {r.earned !== undefined && (
                    <ProgressBar value={(r.earned / r.max) * 100} height="sm" color={c.bar} />
                  )}
                </div>
              ))}
              {showRubricTotal && (
                <div className="flex justify-between text-[12px] font-extrabold text-brand-blue pt-2 border-t border-surface-soft mt-1">
                  <span>Total</span>
                  <span className="tabular-nums">{earnedRubric}/{totalRubric}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {isSubmitted && submission && (
          <div className="card p-4">
            <h3 className="text-[13px] font-extrabold text-ink mb-2.5 flex items-center gap-1.5">
              <FileCheck2 size={14} className="text-brand-teal" /> Yang kamu kumpulkan
            </h3>

            {submission.kind === "file" ? (
              <div className="flex gap-3 items-center px-3 py-2.5 rounded-[10px] bg-teal-light mb-2.5">
                <div className="w-9 h-9 rounded-[8px] bg-white flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-teal-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-ink truncate">{submission.fileName}</div>
                  <div className="text-[10px] text-ink-muted">
                    {submission.fileSizeKB !== undefined && `${fmtKB(submission.fileSizeKB)} • `}
                    {submission.submittedAt}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-teal-light rounded-[10px] p-3 mb-2.5">
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="font-extrabold text-teal-dark uppercase">Esai</span>
                  <span className="text-ink-muted">
                    {submission.text ? wordCount(submission.text) : 0} kata • {submission.submittedAt}
                  </span>
                </div>
                <p className="text-[12px] text-ink-secondary leading-relaxed whitespace-pre-wrap">
                  {submission.text}
                </p>
              </div>
            )}

            {submission.note && (
              <div className="text-[11px] text-ink-secondary leading-relaxed bg-surface-soft rounded-[10px] p-2.5">
                <div className="text-[10px] font-extrabold text-ink-muted uppercase mb-0.5">Catatan kamu</div>
                {submission.note}
              </div>
            )}
          </div>
        )}

        {isSubmitted && detail?.feedback && (
          <div className="card p-4">
            <h3 className="text-[13px] font-extrabold text-ink mb-2 flex items-center gap-1.5">
              <MessageSquareText size={14} className="text-brand-blue" /> Feedback Guru
            </h3>
            <div className="bg-blue-light rounded-[10px] p-3">
              <p className="text-[12px] text-ink-secondary leading-relaxed">{detail.feedback}</p>
              {detail.feedbackFrom && (
                <div className="text-[10px] text-blue-dark font-bold mt-2 flex items-center gap-1">
                  <GraduationCap size={11} /> {detail.feedbackFrom}
                </div>
              )}
            </div>
          </div>
        )}

        {!isSubmitted && (
          <div className="card p-4">
            <h3 className="text-[13px] font-extrabold text-ink mb-3 flex items-center gap-1.5">
              <Upload size={14} className="text-brand-blue" /> Kumpulkan Tugas
            </h3>

            <div className="flex gap-2 mb-3 p-1 bg-surface-soft rounded-[10px]">
              {([
                { mode: "file" as const, label: "File", Icon: Upload },
                { mode: "text" as const, label: "Tulis Esai", Icon: FileText },
              ]).map(({ mode, label, Icon }) => (
                <button
                  key={mode}
                  onClick={() => setSubmitMode(mode)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[8px] text-[12px] font-extrabold transition-all cursor-pointer",
                    submitMode === mode
                      ? "bg-surface-card text-brand-blue shadow-sm"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={onFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />

            {submitMode === "file" ? (
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
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-ink-muted hover:text-red-dark transition-colors cursor-pointer"
                    aria-label="Hapus file"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onPickFile}
                  className="w-full flex flex-col items-center gap-1.5 py-6 rounded-[12px] border-2 border-dashed border-border bg-surface-soft hover:border-brand-blue hover:bg-blue-light transition-colors cursor-pointer"
                >
                  <Upload size={20} className="text-brand-blue" />
                  <span className="text-[12px] font-extrabold text-ink">Pilih file untuk diunggah</span>
                  <span className="text-[10px] text-ink-muted">PDF, DOC, atau gambar — maks 10 MB</span>
                </button>
              )
            ) : (
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
                    {detail?.minWords ? `Min ${detail.minWords} kata` : ""}
                  </span>
                  <span className={cn(wordsOK ? "text-ink-muted" : "text-red-dark font-bold")}>
                    {words} kata
                  </span>
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
      </div>

      {!isSubmitted && (
        <div
          className="fixed left-0 right-0 z-10 bg-surface-card border-t border-border px-3.5 py-3"
          style={{ bottom: "calc(64px + env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!canSubmit}
            className="w-full h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all cursor-pointer"
          >
            {canSubmit
              ? "Kumpulkan Tugas"
              : submitMode === "file"
              ? "Pilih file dulu"
              : detail?.minWords && words < detail.minWords
              ? `Min ${detail.minWords} kata`
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
            <h3 className="text-[15px] font-extrabold text-ink text-center mb-1">
              Kumpulkan sekarang?
            </h3>
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
                className="flex-1 py-2.5 rounded-[12px] bg-brand-blue text-white text-[12px] font-extrabold disabled:opacity-60 cursor-pointer"
              >
                {submitting ? "Mengirim..." : "Ya, Kumpulkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

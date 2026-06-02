"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, Loader2, Trash2, CheckCircle2, Clock } from "lucide-react";
import {
  getTeacherAssignment,
  getAssignmentSubmissions,
  deleteAssignment,
} from "@/lib/services/teacher";
import { Avatar } from "@/components/ui/Avatar";
import { isApiError } from "@/lib/api";
import { subjectColorMap } from "@/lib/utils";
import type { TeacherAssignmentDetail, SubmissionEntry } from "@/lib/services/teacher";

const TYPE_LABEL: Record<string, string> = {
  ONLINE: "Online",
  UPLOAD_FILE: "Upload File",
  ESSAY: "Esai",
};

export default function TeacherTugasDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [assignment, setAssignment] = useState<TeacherAssignmentDetail | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([getTeacherAssignment(id), getAssignmentSubmissions(id)])
      .then(([a, subs]) => {
        setAssignment(a);
        setSubmissions(subs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Hapus tugas ini? Tidak bisa dibatalkan.")) return;
    setDeleting(true);
    try {
      await deleteAssignment(id);
      router.push("/teacher/tugas");
    } catch (e) {
      alert(isApiError(e) ? e.message : "Gagal hapus.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
        Tugas tidak ditemukan.
      </div>
    );
  }

  const c = subjectColorMap[assignment.classSubject.subject.color];
  const submittedCount = submissions.filter((s) => s.submitted).length;
  const gradedCount = submissions.filter((s) => s.graded).length;

  return (
    <>
      <header className="bg-surface-card border-b border-border px-3.5 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="text-ink" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-extrabold text-ink truncate">{assignment.title}</h3>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-red-dark hover:bg-red-light transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Hapus tugas"
        >
          {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        </button>
      </header>

      <div className="px-3.5 pt-3.5 pb-8">
        <div className="card p-4 mb-3.5">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${c.bar}22`, color: c.bar }}
            >
              {assignment.classSubject.subject.name}
            </span>
            <span className="text-[10px] text-ink-muted">
              {assignment.classSubject.class}
            </span>
          </div>
          <h2 className="text-[16px] font-extrabold text-ink mb-2">{assignment.title}</h2>
          {assignment.description && (
            <p className="text-[12px] text-ink-secondary leading-relaxed mb-3">{assignment.description}</p>
          )}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-full bg-surface-soft text-ink-muted font-bold">
              {TYPE_LABEL[assignment.type]}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-soft text-ink-muted font-bold flex items-center gap-1">
              <Calendar size={11} />
              {new Date(assignment.dueAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-soft text-ink-muted font-bold">
              Maks {assignment.maxScore}
            </span>
            {assignment.minWords && (
              <span className="px-2 py-0.5 rounded-full bg-surface-soft text-ink-muted font-bold">
                Min {assignment.minWords} kata
              </span>
            )}
          </div>
        </div>

        {assignment.instructions.length > 0 && (
          <div className="card p-4 mb-3.5">
            <h4 className="text-[12px] font-extrabold text-ink mb-2">Instruksi</h4>
            <ol className="list-decimal pl-5 text-[12px] text-ink-secondary leading-relaxed">
              {assignment.instructions.map((ins, i) => (
                <li key={i} className="mb-1">{ins}</li>
              ))}
            </ol>
          </div>
        )}

        {assignment.attachment && (
          <a
            href={assignment.attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card p-3.5 mb-3.5 flex items-center gap-2.5 cursor-pointer hover:border-brand-teal transition-all"
          >
            <div className="w-9 h-9 rounded-[10px] bg-blue-light flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-brand-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold text-ink truncate">{assignment.attachment.name}</div>
              <div className="text-[10px] text-ink-muted">{assignment.attachment.sizeKB} KB</div>
            </div>
          </a>
        )}

        <div className="grid grid-cols-3 gap-2.5 mb-3.5">
          <div className="card p-3 text-center">
            <div className="text-[16px] font-extrabold text-ink">{submissions.length}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">Total Siswa</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-[16px] font-extrabold text-teal-dark">{submittedCount}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">Terkumpul</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-[16px] font-extrabold text-brand-blue">{gradedCount}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">Dinilai</div>
          </div>
        </div>

        <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Pengumpulan Siswa</h3>
        <div className="card mb-3.5">
          {submissions.map((s, i) => {
            const initials = s.student.name.split(" ").slice(0, 2).map((n) => n[0]).join("");
            const StatusIcon = s.graded ? CheckCircle2 : s.submitted ? Clock : null;
            const statusColor = s.graded ? "#1a9c87" : s.submitted ? "#c09000" : "#9CA3AF";
            const statusLabel = s.graded ? "Dinilai" : s.submitted ? "Terkumpul" : "Belum";
            const content = (
              <>
                <Avatar initials={initials} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-ink truncate">{s.student.name}</div>
                  <div className="text-[10px] text-ink-muted mt-0.5">NIS: {s.student.nis}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  {s.score !== null ? (
                    <div className="text-[14px] font-extrabold text-brand-blue">{s.score}</div>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: statusColor }}>
                      {StatusIcon && <StatusIcon size={12} />}
                      {statusLabel}
                    </div>
                  )}
                  {s.score !== null && (
                    <div className="text-[10px]" style={{ color: statusColor }}>{statusLabel}</div>
                  )}
                </div>
              </>
            );
            const classes = `flex gap-2.5 items-center px-4 py-2.5 hover:bg-surface-soft transition-colors ${
              i < submissions.length - 1 ? "border-b border-surface-soft" : ""
            }`;
            return s.submitted ? (
              <Link
                key={s.student.id}
                href={`/teacher/tugas/${id}/${s.student.id}`}
                className={`${classes} cursor-pointer`}
              >
                {content}
              </Link>
            ) : (
              <div key={s.student.id} className={classes}>{content}</div>
            );
          })}
        </div>
      </div>
    </>
  );
}

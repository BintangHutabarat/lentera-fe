"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import {
  getSubmissionDetail,
  getTeacherAssignment,
  gradeSubmission,
} from "@/lib/services/teacher";
import { Avatar } from "@/components/ui/Avatar";
import { isApiError } from "@/lib/api";
import type { SubmissionDetail, TeacherAssignmentDetail } from "@/lib/services/teacher";

interface RubricInput {
  label: string;
  max: number;
  score: number;
}

export default function TeacherSubmissionDetailPage() {
  const { id, studentId } = useParams<{ id: string; studentId: string }>();
  const router = useRouter();
  const [assignment, setAssignment] = useState<TeacherAssignmentDetail | null>(null);
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [rubric, setRubric] = useState<RubricInput[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([getTeacherAssignment(id), getSubmissionDetail(id, studentId)])
      .then(([a, sub]) => {
        setAssignment(a);
        setSubmission(sub);
        if (sub.score !== null) setScore(String(sub.score));
        if (sub.feedback) setFeedback(sub.feedback);
        const initialRubric: RubricInput[] = a.rubric.map((r) => {
          const breakdown = sub.rubricBreakdown?.find((b) => b.label === r.label);
          return { label: r.label, max: r.max, score: breakdown?.score ?? 0 };
        });
        setRubric(initialRubric);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, studentId]);

  const updateRubricScore = (i: number, v: string) =>
    setRubric((r) => r.map((x, idx) => (idx === i ? { ...x, score: Number(v) } : x)));

  const handleGrade = async () => {
    const num = Number(score);
    if (!score || isNaN(num)) {
      setError("Masukkan nilai yang valid.");
      return;
    }
    if (assignment && num > assignment.maxScore) {
      setError(`Nilai tidak boleh melebihi ${assignment.maxScore}.`);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await gradeSubmission(id, studentId, {
        score: num,
        feedback: feedback.trim() || undefined,
        rubricBreakdown: rubric.length > 0
          ? rubric.map((r) => ({ label: r.label, score: r.score }))
          : undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      setError(isApiError(e) ? e.message : "Gagal menilai.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>
    );
  }

  if (!submission || !assignment) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
        Pengumpulan tidak ditemukan.
      </div>
    );
  }

  const initials = submission.student.name.split(" ").slice(0, 2).map((n) => n[0]).join("");

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
          <h3 className="text-[14px] font-extrabold text-ink">Penilaian</h3>
        </div>
      </header>

      <div className="px-3.5 pt-3.5 pb-8">
        <div className="card p-4 mb-3.5 flex items-center gap-3">
          <Avatar initials={initials} size="md" />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-extrabold text-ink truncate">{submission.student.name}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">NIS: {submission.student.nis}</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] text-ink-muted">Dikumpul</div>
            <div className="text-[11px] font-bold text-ink">
              {new Date(submission.submittedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
            </div>
          </div>
        </div>

        <h4 className="text-[12px] font-extrabold text-ink mb-2">Jawaban Siswa</h4>
        <div className="card p-4 mb-3.5">
          {submission.kind === "FILE" && submission.fileUrl && (
            <a
              href={submission.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-[10px] bg-blue-light flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-brand-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-ink truncate">{submission.fileName}</div>
                <div className="text-[10px] text-ink-muted">{submission.fileSizeKB} KB • Klik untuk lihat</div>
              </div>
            </a>
          )}
          {submission.kind === "ESSAY" && (
            <p className="text-[12px] text-ink-secondary whitespace-pre-wrap leading-relaxed">
              {submission.essayText}
            </p>
          )}
          {submission.kind === "ONLINE_ANSWERS" && submission.answers && (
            <div className="flex flex-col gap-2">
              {Object.entries(submission.answers).map(([q, a]) => (
                <div key={q} className="flex justify-between text-[12px]">
                  <span className="text-ink-muted">{q}</span>
                  <span className="font-bold text-ink">{a}</span>
                </div>
              ))}
            </div>
          )}
          {submission.note && (
            <div className="mt-3 pt-3 border-t border-surface-soft">
              <div className="text-[10px] font-bold text-ink-muted mb-1">Catatan siswa</div>
              <p className="text-[11px] text-ink-secondary">{submission.note}</p>
            </div>
          )}
        </div>

        <h4 className="text-[12px] font-extrabold text-ink mb-2">Berikan Nilai</h4>
        <div className="card p-4 flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-extrabold text-ink mb-1.5">
              Nilai (maks {assignment.maxScore})
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              max={assignment.maxScore}
              className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
            />
          </div>

          {rubric.length > 0 && (
            <div>
              <label className="block text-[11px] font-extrabold text-ink mb-1.5">Rubrik</label>
              <div className="flex flex-col gap-2">
                {rubric.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex-1 text-[12px] text-ink">{r.label}</span>
                    <input
                      type="number"
                      value={r.score}
                      onChange={(e) => updateRubricScore(i, e.target.value)}
                      max={r.max}
                      className="w-20 h-9 rounded-[10px] border border-border bg-surface-card px-3 text-[12px] text-ink outline-none focus:border-brand-blue text-right"
                    />
                    <span className="text-[11px] text-ink-muted w-8">/{r.max}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-extrabold text-ink mb-1.5">Feedback (opsional)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              placeholder="Catatan untuk siswa..."
              className="w-full rounded-[10px] border border-border bg-surface-card px-3 py-2.5 text-[13px] text-ink outline-none focus:border-brand-blue resize-none"
            />
          </div>

          {error && (
            <div className="text-[12px] text-red-dark bg-red-light rounded-[10px] px-3 py-2">{error}</div>
          )}
          {success && (
            <div className="text-[12px] text-teal-dark bg-teal-light rounded-[10px] px-3 py-2">
              Nilai berhasil disimpan.
            </div>
          )}

          <button
            onClick={handleGrade}
            disabled={saving}
            className="h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-opacity"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Menyimpan..." : "Simpan Nilai"}
          </button>
        </div>
      </div>
    </>
  );
}

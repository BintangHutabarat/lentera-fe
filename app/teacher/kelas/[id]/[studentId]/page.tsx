"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Brain, CheckCircle2, ClipboardList, Clock, XCircle } from "lucide-react";
import { getStudentProgress, getClassSubjectStudents } from "@/lib/services/teacher";
import type { StudentProgress, TeacherStudent } from "@/lib/services/teacher";

export default function TeacherStudentProgressPage() {
  const { id: classSubjectId, studentId } = useParams<{ id: string; studentId: string }>();
  const router = useRouter();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [student, setStudent] = useState<TeacherStudent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getStudentProgress(classSubjectId, studentId),
      getClassSubjectStudents(classSubjectId),
    ])
      .then(([prog, students]) => {
        setProgress(prog);
        setStudent(students.find((s) => s.id === studentId) ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [classSubjectId, studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>
    );
  }

  if (!progress) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-[13px] text-ink-muted">
        <p className="mb-3">Gagal memuat progres.</p>
        <button onClick={() => router.back()} className="text-brand-blue font-bold cursor-pointer">Kembali</button>
      </div>
    );
  }

  const submittedCount = progress.assignments.filter((a) => a.submitted).length;
  const gradedCount = progress.assignments.filter((a) => a.graded).length;
  const avgScore = gradedCount > 0
    ? Math.round(progress.assignments.filter((a) => a.score !== null).reduce((s, a) => s + (a.score ?? 0), 0) / gradedCount)
    : null;
  const attemptedQuizzes = progress.quizzes.filter((q) => q.attempted).length;
  const completedChapters = progress.chapters.filter((c) => c.completed).length;

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
          <h3 className="text-[14px] font-extrabold text-ink truncate">
            {student?.name ?? "Siswa"}
          </h3>
          <p className="text-[11px] text-ink-muted">Laporan Kemajuan</p>
        </div>
      </header>

      <div className="px-3.5 pt-3.5 pb-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2.5 mb-3.5">
          <div className="card p-3 text-center">
            <div className="text-[16px] font-extrabold text-brand-blue">{submittedCount}/{progress.assignments.length}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">Tugas Kumpul</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-[16px] font-extrabold text-teal-dark">{avgScore !== null ? avgScore : "—"}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">Rata-rata Nilai</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-[16px] font-extrabold text-yellow-dark">{completedChapters}/{progress.chapters.length}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">Bab Selesai</div>
          </div>
        </div>

        {/* Assignments */}
        {progress.assignments.length > 0 && (
          <>
            <h3 className="text-[13px] font-extrabold text-ink mb-2.5 flex items-center gap-1.5">
              <ClipboardList size={14} /> Tugas ({submittedCount}/{progress.assignments.length})
            </h3>
            <div className="card mb-3.5">
              {progress.assignments.map((a, i) => (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 px-4 py-3 ${i < progress.assignments.length - 1 ? "border-b border-surface-soft" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-ink truncate">{a.title}</div>
                    <div className="text-[10px] text-ink-muted mt-0.5">
                      Due {new Date(a.dueAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {a.graded && a.score !== null ? (
                      <div className="text-[14px] font-extrabold text-brand-blue">{a.score}</div>
                    ) : a.submitted ? (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-dark">
                        <Clock size={11} /> Terkumpul
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-ink-muted">
                        <XCircle size={11} /> Belum
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Quizzes */}
        {progress.quizzes.length > 0 && (
          <>
            <h3 className="text-[13px] font-extrabold text-ink mb-2.5 flex items-center gap-1.5">
              <Brain size={14} /> Quiz ({attemptedQuizzes}/{progress.quizzes.length})
            </h3>
            <div className="card mb-3.5">
              {progress.quizzes.map((q, i) => (
                <div
                  key={q.id}
                  className={`flex items-center gap-3 px-4 py-3 ${i < progress.quizzes.length - 1 ? "border-b border-surface-soft" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-ink truncate">{q.title}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {q.attempted && q.bestScore !== null ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] font-extrabold text-teal-dark">{q.bestScore}</span>
                        {q.bestStars !== null && (
                          <span className="text-[10px] text-yellow-dark">{"★".repeat(q.bestStars)}</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-[10px] font-bold text-ink-muted">Belum dicoba</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Chapters */}
        {progress.chapters.length > 0 && (
          <>
            <h3 className="text-[13px] font-extrabold text-ink mb-2.5 flex items-center gap-1.5">
              <BookOpen size={14} /> Bab ({completedChapters}/{progress.chapters.length})
            </h3>
            <div className="card mb-3.5">
              {progress.chapters.map((ch, i) => (
                <div
                  key={ch.id}
                  className={`flex items-center gap-3 px-4 py-3 ${i < progress.chapters.length - 1 ? "border-b border-surface-soft" : ""}`}
                >
                  <div className="text-[10px] font-extrabold text-ink-muted w-5 text-center flex-shrink-0">
                    {ch.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-ink truncate">{ch.title}</div>
                  </div>
                  {ch.completed ? (
                    <CheckCircle2 size={16} className="text-brand-teal flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-border flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

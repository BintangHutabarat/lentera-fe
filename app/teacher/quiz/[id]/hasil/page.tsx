"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getQuizSessions, getTeacherQuiz } from "@/lib/services/teacher";
import { Avatar } from "@/components/ui/Avatar";
import type { QuizSessionResult, TeacherQuizDetail } from "@/lib/services/teacher";

export default function TeacherQuizHasilPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<TeacherQuizDetail | null>(null);
  const [sessions, setSessions] = useState<QuizSessionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTeacherQuiz(id), getQuizSessions(id)])
      .then(([q, s]) => {
        setQuiz(q);
        setSessions(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
        Quiz tidak ditemukan.
      </div>
    );
  }

  const attempted = sessions.filter((s) => s.attempted);
  const avgScore = attempted.length > 0
    ? Math.round(attempted.reduce((acc, s) => acc + (s.score ?? 0), 0) / attempted.length)
    : 0;

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
          <h3 className="text-[14px] font-extrabold text-ink truncate">Hasil • {quiz.title}</h3>
        </div>
      </header>

      <div className="px-3.5 pt-3.5 pb-8">
        <div className="grid grid-cols-3 gap-2.5 mb-3.5">
          <div className="card p-3 text-center">
            <div className="text-[16px] font-extrabold text-ink">{sessions.length}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">Total Siswa</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-[16px] font-extrabold text-teal-dark">{attempted.length}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">Mengerjakan</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-[16px] font-extrabold text-brand-blue">{avgScore}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">Rata-rata</div>
          </div>
        </div>

        <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Detail per Siswa</h3>
        <div className="card mb-3.5">
          {sessions.map((s, i) => {
            const initials = s.student.name.split(" ").slice(0, 2).map((n) => n[0]).join("");
            return (
              <div
                key={s.student.id}
                className={`flex gap-2.5 items-center px-4 py-2.5 ${
                  i < sessions.length - 1 ? "border-b border-surface-soft" : ""
                }`}
              >
                <Avatar initials={initials} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-ink truncate">{s.student.name}</div>
                  <div className="text-[10px] text-ink-muted mt-0.5">NIS: {s.student.nis}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  {s.attempted && s.score !== null ? (
                    <>
                      <div className="text-[14px] font-extrabold text-brand-blue">{s.score}</div>
                      <div className="text-[10px] text-ink-muted">
                        {s.correctCount}/{quiz.totalQuestions} • {s.stars}★
                      </div>
                    </>
                  ) : (
                    <div className="text-[11px] font-bold text-ink-muted">Belum</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

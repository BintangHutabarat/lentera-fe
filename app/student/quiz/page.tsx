"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Gamepad2 } from "lucide-react";
import { getQuizzes } from "@/lib/services/quizzes";
import { PageTopbar } from "@/components/layout/PageTopbar";
import { subjectColorMap } from "@/lib/utils";
import { subjectIcons } from "@/lib/icons";
import type { QuizListItem } from "@/lib/services/quizzes";

function Stars({ count }: { count: number }) {
  return (
    <div className="text-[11px] mt-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < count ? "#F5C518" : "#C8E8EF" }}>★</span>
      ))}
    </div>
  );
}

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedSessions, setSavedSessions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getQuizzes()
      .then((data) => {
        setQuizzes(data);
        const sessions: Record<string, boolean> = {};
        data.forEach((q) => {
          if (q.completed && localStorage.getItem(`quiz_session_${q.id}`)) {
            sessions[q.id] = true;
          }
        });
        setSavedSessions(sessions);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending   = quizzes.filter((q) => !q.completed);
  const completed = quizzes.filter((q) => q.completed);

  return (
    <>
      <PageTopbar title="Quiz & Latihan" subtitle="Asah kemampuan kamu!" />
      <div className="px-3.5 pt-3.5">

        <div
          className="relative overflow-hidden rounded-card p-[18px] mb-3.5"
          style={{ background: "linear-gradient(135deg,#2B9FD8 0%,#3DD6B5 60%,#7EEFC7 100%)" }}
        >
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
            <Gamepad2 size={52} className="text-white" />
          </div>
          <h3 className="text-[16px] font-extrabold text-white mb-1 flex items-center gap-1.5">
            Daily Challenge!
            <Flame size={16} className="text-white fill-white" />
          </h3>
          <p className="text-[12px] text-white/82 mb-3">Pertahankan streak 7 harimu dengan quiz harian!</p>
          <button className="px-4 py-2 rounded-[9px] bg-white/20 border border-white/35 text-white text-[12px] font-extrabold active:scale-95 transition-transform cursor-pointer">
            Mulai Sekarang ↗
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
            Memuat...
          </div>
        ) : (
          <>
            <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Quiz Tersedia</h3>
            <div className="flex flex-col gap-2.5 mb-3.5">
              {pending.length === 0 && (
                <div className="card p-4 text-center text-[12px] text-ink-muted">
                  Semua quiz sudah dikerjakan!
                </div>
              )}
              {pending.map((q) => {
                const c = subjectColorMap[q.subject.color];
                const SubjIcon = subjectIcons[q.subject.color];
                return (
                  <Link
                    key={q.id}
                    href={`/student/quiz/${q.id}`}
                    className="card p-3.5 flex gap-3 items-center cursor-pointer hover:border-brand-teal transition-all active:scale-[0.99]"
                  >
                    <div
                      className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center flex-shrink-0"
                      style={{ background: `${c.bar}22` }}
                    >
                      <SubjIcon size={22} strokeWidth={1.5} style={{ color: c.bar }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-extrabold text-ink">{q.title} — {q.subject.name}</div>
                      <div className="text-[11px] text-ink-muted mt-1">
                        {q.totalQuestions} soal • {q.durationMinutes} menit • {q.chapter}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[13px] font-extrabold" style={{ color: c.bar }}>Mulai</div>
                      <div className="text-[10px] text-ink-muted">Belum dikerjakan</div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Sudah Dikerjakan</h3>
            <div className="flex flex-col gap-2.5 mb-3.5">
              {completed.length === 0 && (
                <div className="card p-4 text-center text-[12px] text-ink-muted">
                  Belum ada quiz yang selesai.
                </div>
              )}
              {completed.map((q) => {
                const c = subjectColorMap[q.subject.color];
                const SubjIcon = subjectIcons[q.subject.color];
                const hasResult = !!savedSessions[q.id];
                return (
                  <div key={q.id} className="card p-3.5 flex gap-3 items-center">
                    <div
                      className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center flex-shrink-0"
                      style={{ background: `${c.bar}22` }}
                    >
                      <SubjIcon size={22} strokeWidth={1.5} style={{ color: c.bar }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-extrabold text-ink">{q.title} — {q.subject.name}</div>
                      <div className="text-[11px] text-ink-muted mt-0.5">{q.totalQuestions} soal • {q.chapter}</div>
                      {q.lastStars && <Stars count={q.lastStars} />}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[18px] font-extrabold" style={{ color: c.bar }}>{q.lastScore}</div>
                      <div className="text-[10px] text-ink-muted mb-1">Nilai kamu</div>
                      {hasResult && (
                        <Link
                          href={`/student/quiz/${q.id}/hasil`}
                          className="text-[10px] font-bold text-brand-blue hover:underline"
                        >
                          Review →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}

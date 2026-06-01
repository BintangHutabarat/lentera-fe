"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle, ArrowLeft, Check, ChevronLeft, ChevronRight,
  Clock, Grid3x3, Loader2, Sparkles, Trophy, X,
} from "lucide-react";
import { getQuizzes, startQuiz, saveAnswer, submitQuiz } from "@/lib/services/quizzes";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Chip";
import { cn, subjectColorMap } from "@/lib/utils";
import type { QuizListItem, QuizSession, QuizResult } from "@/lib/services/quizzes";

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type ViewMode = "loading" | "quiz" | "result" | "review";

export default function QuizDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [quiz, setQuiz] = useState<QuizListItem | null>(null);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [view, setView] = useState<ViewMode>("loading");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    Promise.all([getQuizzes(), startQuiz(params.id)])
      .then(([quizzes, sess]) => {
        setQuiz(quizzes.find((q) => q.id === params.id) ?? null);
        setSession(sess);
        setAnswers(sess.existingAnswers ?? {});
        const remaining = Math.max(0, Math.floor((new Date(sess.expiresAt).getTime() - Date.now()) / 1000));
        setTimeLeft(remaining);
        setView("quiz");
      })
      .catch((err) => {
        setLoadError(err?.message ?? "Gagal memuat quiz.");
        setView("quiz");
      });
  }, [params.id]);

  // Timer
  useEffect(() => {
    if (view !== "quiz" || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [view, timeLeft]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (view === "quiz" && timeLeft === 0 && session) {
      handleSubmit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    if (session) {
      saveAnswer(session.sessionId, questionId, optionId).catch(() => {});
    }
  };

  const handleSubmit = async () => {
    if (!session) return;
    setSubmitting(true);
    setShowSubmitConfirm(false);
    setShowPalette(false);
    try {
      const res = await submitQuiz(session.sessionId, answers);
      localStorage.setItem(`quiz_session_${params.id}`, session.sessionId);
      setResult(res);
      setView("result");
    } catch {
      setSubmitting(false);
    }
  };

  if (view === "loading") {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-brand-blue" />
      </div>
    );
  }

  if (loadError || !session || !quiz) {
    return (
      <div className="px-3.5 pt-10 text-center">
        <p className="text-[14px] text-ink-muted">{loadError ?? "Quiz tidak ditemukan."}</p>
        <button
          onClick={() => router.push("/student/quiz")}
          className="mt-3 text-[12px] font-bold text-brand-blue cursor-pointer"
        >
          Kembali ke daftar quiz
        </button>
      </div>
    );
  }

  const subjectColor = quiz.subject.color;
  const c = subjectColorMap[subjectColor];
  const questions = session.questions;
  const total = questions.length;
  const current = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isLast = currentIndex === total - 1;
  const selectedOption = answers[current?.id ?? ""];
  const allAnswered = answeredCount === total;
  const lowTime = timeLeft < 60;
  const progress = ((currentIndex + 1) / total) * 100;

  if (view === "result" && result) {
    return (
      <div className="min-h-dvh flex flex-col bg-surface-page">
        <div
          className="px-5 pt-10 pb-8 text-center text-white"
          style={{ background: "linear-gradient(135deg,#2B9FD8 0%,#3DD6B5 60%,#7EEFC7 100%)" }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-3">
            <Trophy size={32} className="text-white" />
          </div>
          <h2 className="text-[20px] font-extrabold mb-1">
            {result.score >= 80 ? "Hebat!" : result.score >= 60 ? "Bagus, terus berlatih!" : "Yuk coba lagi!"}
          </h2>
          <p className="text-[12px] text-white/85">
            {timeLeft === 0 ? "Waktu habis — jawaban otomatis dikumpulkan" : "Quiz selesai dikerjakan"}
          </p>
          <div className="mt-5 inline-flex items-baseline gap-1">
            <span className="text-[56px] font-extrabold leading-none">{result.score}</span>
            <span className="text-[20px] font-bold text-white/85">%</span>
          </div>
          <div className="text-[12px] text-white/80 mt-1">
            {result.correct} dari {result.total} jawaban benar
          </div>
          <div className="flex justify-center gap-0.5 mt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-[22px]" style={{ color: i < result.stars ? "#F5C518" : "rgba(255,255,255,0.35)" }}>★</span>
            ))}
          </div>
        </div>

        <div className="flex-1 px-3.5 pt-4">
          <div className="grid grid-cols-3 gap-2.5 mb-3.5">
            <div className="card p-3 text-center">
              <div className="text-[18px] font-extrabold text-teal-dark">{result.correct}</div>
              <div className="text-[10px] text-ink-muted mt-0.5">Benar</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-[18px] font-extrabold text-red-dark">{result.incorrect}</div>
              <div className="text-[10px] text-ink-muted mt-0.5">Salah</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-[18px] font-extrabold text-ink-muted">{result.skipped}</div>
              <div className="text-[10px] text-ink-muted mt-0.5">Kosong</div>
            </div>
          </div>

          <div className="card p-3.5 flex items-center gap-2.5 mb-3.5">
            <div className="w-9 h-9 rounded-[10px] bg-blue-light flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-brand-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-ink-muted">Waktu pengerjaan</div>
              <div className="text-[14px] font-extrabold text-ink">{fmtTime(result.timeUsedSeconds)}</div>
            </div>
            <Chip variant="blue">+{result.xpEarned} XP</Chip>
          </div>

          <div className="flex flex-col gap-2.5 pb-8">
            <button
              onClick={() => setView("review")}
              className="w-full py-3 rounded-[12px] bg-brand-blue text-white text-[13px] font-extrabold active:scale-[0.98] transition-transform cursor-pointer"
            >
              Review Jawaban
            </button>
            <button
              onClick={() => router.push("/student/quiz")}
              className="w-full py-3 rounded-[12px] bg-surface-card border border-border text-ink text-[13px] font-extrabold active:scale-[0.98] transition-transform cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "review" && result) {
    return (
      <div className="min-h-dvh bg-surface-page">
        <header className="bg-surface-card border-b border-border px-3.5 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={() => setView("result")}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} className="text-ink" />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-extrabold text-ink truncate">Review Jawaban</h3>
            <p className="text-[11px] text-ink-muted truncate">{quiz.title}</p>
          </div>
        </header>

        <div className="px-3.5 pt-3.5 pb-10 flex flex-col gap-2.5">
          {result.review.map((r, idx) => {
            const isSkipped = !r.myAnswer;
            const isCorrect = r.isCorrect;
            return (
              <div key={r.questionId} className="card p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 rounded-full bg-surface-soft text-[11px] font-extrabold text-ink flex items-center justify-center">
                    {idx + 1}
                  </div>
                  {isSkipped ? (
                    <Chip variant="soft">Kosong</Chip>
                  ) : isCorrect ? (
                    <Chip variant="teal"><Check size={10} className="inline mr-0.5" /> Benar</Chip>
                  ) : (
                    <Chip variant="red"><X size={10} className="inline mr-0.5" /> Salah</Chip>
                  )}
                </div>
                <p className="text-[13px] font-bold text-ink mb-3 leading-relaxed">{r.text}</p>

                <div className="flex flex-col gap-1.5 mb-2.5">
                  {r.options.map((opt) => {
                    const isMine = opt.id === r.myAnswer;
                    const isAnswer = opt.id === r.correctOptionId;
                    const box = isAnswer
                      ? "bg-teal-light border-[#3DD6B5] text-teal-dark"
                      : isMine
                        ? "bg-red-light border-[#E05C5C] text-red-dark"
                        : "bg-surface-soft border-border text-ink-secondary";
                    return (
                      <div
                        key={opt.id}
                        className={cn("rounded-[10px] border px-3 py-2 flex items-center gap-2.5 text-[12px] font-semibold", box)}
                      >
                        <span className="w-5 h-5 rounded-full bg-white border border-border flex items-center justify-center text-[10px] font-extrabold uppercase flex-shrink-0">
                          {opt.id}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                        {isAnswer && <Check size={14} className="text-teal-dark flex-shrink-0" />}
                        {isMine && !isAnswer && <X size={14} className="text-red-dark flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                <div className="bg-blue-light rounded-[10px] p-2.5 flex gap-2 items-start">
                  <Sparkles size={14} className="text-brand-blue flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-extrabold text-blue-dark mb-0.5">Pembahasan</div>
                    <div className="text-[11px] text-ink-secondary leading-relaxed">{r.explanation}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Quiz view
  if (!current) return null;

  return (
    <div className="min-h-dvh flex flex-col bg-surface-page">
      <header className="bg-surface-card border-b border-border px-3.5 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push("/student/quiz")}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer"
          >
            <X size={18} className="text-ink" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-extrabold text-ink truncate">{quiz.title}</div>
            <div className="text-[10px] text-ink-muted truncate">{quiz.subject.name} • {quiz.chapter}</div>
          </div>
          <div
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-extrabold tabular-nums",
              lowTime ? "bg-red-light text-red-dark" : "bg-blue-light text-blue-dark",
            )}
          >
            <Clock size={13} />
            {fmtTime(timeLeft)}
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2.5">
          <ProgressBar value={progress} height="sm" color={c.bar} className="flex-1" />
          <span className="text-[11px] font-bold text-ink-muted tabular-nums whitespace-nowrap">
            {currentIndex + 1}/{total}
          </span>
        </div>
      </header>

      <main className="flex-1 px-3.5 pt-4 pb-32">
        <div className="card p-4 mb-3.5">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[11px] font-extrabold"
              style={{ background: `${c.bar}22`, color: c.bar }}
            >
              {currentIndex + 1}
            </div>
            <Chip variant={subjectColor}>{quiz.subject.name}</Chip>
          </div>
          <p className="text-[15px] font-bold text-ink leading-relaxed">{current.text}</p>
        </div>

        <div className="flex flex-col gap-2.5">
          {current.options.map((opt) => {
            const selected = selectedOption === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(current.id, opt.id)}
                className={cn(
                  "w-full text-left rounded-[12px] border px-3.5 py-3 flex items-center gap-3 transition-all active:scale-[0.99] cursor-pointer",
                  selected
                    ? "bg-blue-light border-brand-blue ring-2 ring-brand-blue/20"
                    : "bg-surface-card border-border hover:border-brand-teal",
                )}
              >
                <span
                  className={cn(
                    "w-7 h-7 rounded-full border flex items-center justify-center text-[12px] font-extrabold uppercase flex-shrink-0 transition-colors",
                    selected ? "bg-brand-blue border-brand-blue text-white" : "bg-surface-soft border-border text-ink",
                  )}
                >
                  {opt.id}
                </span>
                <span className={cn("text-[13px] flex-1", selected ? "font-extrabold text-ink" : "font-semibold text-ink-secondary")}>
                  {opt.text}
                </span>
                {selected && <Check size={16} className="text-brand-blue flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </main>

      <div
        className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-border px-3.5 py-3 z-20 flex items-center gap-2.5"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      >
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="w-11 h-11 rounded-[12px] border border-border bg-surface-card flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform cursor-pointer"
        >
          <ChevronLeft size={18} className="text-ink" />
        </button>

        <button
          onClick={() => setShowPalette(true)}
          className="flex-1 h-11 rounded-[12px] border border-border bg-surface-card flex items-center justify-center gap-1.5 text-[12px] font-extrabold text-ink active:scale-[0.98] transition-transform cursor-pointer"
        >
          <Grid3x3 size={14} />
          {answeredCount}/{total} terjawab
        </button>

        {isLast ? (
          <button
            onClick={() => setShowSubmitConfirm(true)}
            disabled={submitting}
            className="h-11 px-5 rounded-[12px] bg-brand-blue text-white text-[13px] font-extrabold active:scale-[0.98] transition-transform cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Kumpulkan
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
            className="w-11 h-11 rounded-[12px] bg-brand-blue flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          >
            <ChevronRight size={18} className="text-white" />
          </button>
        )}
      </div>

      {showPalette && (
        <div className="fixed inset-0 z-30 flex flex-col justify-end" onClick={() => setShowPalette(false)}>
          <div className="absolute inset-0 bg-ink/40" />
          <div
            className="relative bg-surface-card rounded-t-[20px] p-4"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-10 h-1 rounded-full bg-border mb-3" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-extrabold text-ink">Daftar Soal</h3>
              <span className="text-[11px] text-ink-muted">{answeredCount}/{total} terjawab</span>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => { setCurrentIndex(idx); setShowPalette(false); }}
                    className={cn(
                      "aspect-square rounded-[10px] border text-[13px] font-extrabold flex items-center justify-center transition-all cursor-pointer",
                      isCurrent && "ring-2 ring-brand-blue ring-offset-1",
                      isAnswered ? "bg-brand-blue text-white border-brand-blue" : "bg-surface-card text-ink border-border",
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 text-[10px] text-ink-muted mb-3">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-[3px] bg-brand-blue" /> Terjawab</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-[3px] bg-surface-card border border-border" /> Kosong</span>
            </div>
            <button onClick={() => setShowPalette(false)} className="w-full py-2.5 rounded-[10px] bg-surface-soft text-[12px] font-extrabold text-ink cursor-pointer">
              Tutup
            </button>
          </div>
        </div>
      )}

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-5" onClick={() => setShowSubmitConfirm(false)}>
          <div className="absolute inset-0 bg-ink/50" />
          <div className="relative bg-surface-card rounded-[16px] p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-yellow-light flex items-center justify-center">
                <AlertCircle size={24} className="text-yellow-dark" />
              </div>
            </div>
            <h3 className="text-[15px] font-extrabold text-ink text-center mb-1">
              {allAnswered ? "Kumpulkan jawaban?" : "Masih ada soal kosong"}
            </h3>
            <p className="text-[12px] text-ink-muted text-center mb-4">
              {allAnswered
                ? "Setelah dikumpulkan kamu tidak bisa mengubah jawaban."
                : `${total - answeredCount} soal belum dijawab. Yakin mau kumpulkan sekarang?`}
            </p>
            <div className="flex gap-2.5">
              <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 py-2.5 rounded-[12px] bg-surface-soft text-[12px] font-extrabold text-ink cursor-pointer">
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-[12px] bg-brand-blue text-white text-[12px] font-extrabold cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {submitting && <Loader2 size={13} className="animate-spin" />}
                Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Clock, Loader2, Sparkles, Trophy, X } from "lucide-react";
import { getQuizResult } from "@/lib/services/quizzes";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";
import type { QuizResult } from "@/lib/services/quizzes";

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type ViewMode = "result" | "review";

export default function QuizHasilPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("result");

  useEffect(() => {
    const sessionId = localStorage.getItem(`quiz_session_${id}`);
    if (!sessionId) {
      setError("Data hasil tidak tersedia. Kerjakan quiz untuk melihat hasilnya.");
      setLoading(false);
      return;
    }
    getQuizResult(sessionId)
      .then(setResult)
      .catch(() => setError("Gagal memuat hasil quiz."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-brand-blue" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-soft flex items-center justify-center mb-4">
          <Trophy size={28} className="text-ink-muted" />
        </div>
        <p className="text-[14px] text-ink-muted mb-4">{error ?? "Hasil tidak ditemukan."}</p>
        <button
          onClick={() => router.push("/student/quiz")}
          className="text-[13px] font-bold text-brand-blue cursor-pointer"
        >
          Kembali ke daftar quiz
        </button>
      </div>
    );
  }

  if (view === "review") {
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
            <h3 className="text-[14px] font-extrabold text-ink">Review Jawaban</h3>
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

  return (
    <div className="min-h-dvh flex flex-col bg-surface-page">
      <div
        className="px-5 pt-10 pb-8 text-center text-white"
        style={{ background: "linear-gradient(135deg,#22A96C 0%,#3DD6B5 60%,#7EEFC7 100%)" }}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-3">
          <Trophy size={32} className="text-white" />
        </div>
        <h2 className="text-[20px] font-extrabold mb-1">
          {result.score >= 80 ? "Hebat!" : result.score >= 60 ? "Bagus, terus berlatih!" : "Yuk coba lagi!"}
        </h2>
        <p className="text-[12px] text-white/85">Hasil quiz kamu</p>
        <div className="mt-5 inline-flex items-baseline gap-1">
          <span className="text-[56px] font-extrabold leading-none">{result.score}</span>
          <span className="text-[20px] font-bold text-white/85">%</span>
        </div>
        <div className="text-[12px] text-white/80 mt-1">
          {result.correct} dari {result.total} jawaban benar
        </div>
        <div className="flex justify-center gap-0.5 mt-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-[22px]" style={{ color: i < result.stars ? "#F5C518" : "rgba(255,255,255,0.35)" }}>
              ★
            </span>
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
            Kembali ke Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

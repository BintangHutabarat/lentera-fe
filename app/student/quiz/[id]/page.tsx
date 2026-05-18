"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle, ArrowLeft, Check, ChevronLeft, ChevronRight,
  Clock, Grid3x3, Sparkles, Trophy, X,
} from "lucide-react";
import { mockQuizzes } from "@/lib/mock-data";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Chip";
import { cn, subjectColorMap } from "@/lib/utils";

type OptionId = "a" | "b" | "c" | "d";
interface QuizOption { id: OptionId; text: string }
interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  correctOptionId: OptionId;
  explanation: string;
}

const SAMPLE_QUESTIONS: QuizQuestion[] = [
  {
    id: "qq-1",
    text: "Hasil dari ∫ (3x² + 2x) dx adalah ...",
    options: [
      { id: "a", text: "x³ + x² + C" },
      { id: "b", text: "x³ + 2x² + C" },
      { id: "c", text: "6x + 2 + C" },
      { id: "d", text: "3x³ + x² + C" },
    ],
    correctOptionId: "a",
    explanation: "∫ 3x² dx = x³ dan ∫ 2x dx = x². Jumlahkan keduanya lalu tambahkan konstanta integrasi C → x³ + x² + C.",
  },
  {
    id: "qq-2",
    text: "Nilai dari ∫₀¹ (2x + 1) dx adalah ...",
    options: [
      { id: "a", text: "1" },
      { id: "b", text: "2" },
      { id: "c", text: "3" },
      { id: "d", text: "4" },
    ],
    correctOptionId: "b",
    explanation: "Anti-turunan: x² + x. Substitusi batas atas dikurangi batas bawah: (1 + 1) − (0 + 0) = 2.",
  },
  {
    id: "qq-3",
    text: "∫ cos(x) dx = ...",
    options: [
      { id: "a", text: "−sin(x) + C" },
      { id: "b", text: "sin(x) + C" },
      { id: "c", text: "−cos(x) + C" },
      { id: "d", text: "tan(x) + C" },
    ],
    correctOptionId: "b",
    explanation: "Turunan sin(x) adalah cos(x), jadi anti-turunan cos(x) adalah sin(x) + C.",
  },
  {
    id: "qq-4",
    text: "Luas daerah yang dibatasi oleh y = x², sumbu-x, x = 0, dan x = 2 adalah ...",
    options: [
      { id: "a", text: "2/3 satuan luas" },
      { id: "b", text: "4/3 satuan luas" },
      { id: "c", text: "8/3 satuan luas" },
      { id: "d", text: "16/3 satuan luas" },
    ],
    correctOptionId: "c",
    explanation: "∫₀² x² dx = [x³/3]₀² = 8/3 − 0 = 8/3.",
  },
  {
    id: "qq-5",
    text: "∫ (1/x) dx untuk x > 0 adalah ...",
    options: [
      { id: "a", text: "x + C" },
      { id: "b", text: "ln|x| + C" },
      { id: "c", text: "−1/x² + C" },
      { id: "d", text: "1/(2x²) + C" },
    ],
    correctOptionId: "b",
    explanation: "1/x adalah kasus khusus dari aturan pangkat. Anti-turunannya adalah ln|x| + C.",
  },
];

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type ViewMode = "quiz" | "result" | "review";

export default function QuizDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const quiz = mockQuizzes.find((q) => q.id === params.id);

  const subjectColor = quiz?.subjectColor ?? "blue";
  const c = subjectColorMap[subjectColor];

  const questions = SAMPLE_QUESTIONS;
  const total = questions.length;
  const durationSec = (quiz?.durationMinutes ?? 15) * 60;

  const [view, setView] = useState<ViewMode>("quiz");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OptionId>>({});
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationSec);

  useEffect(() => {
    if (view !== "quiz" || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [view, timeLeft]);

  useEffect(() => {
    if (view === "quiz" && timeLeft === 0) {
      setShowPalette(false);
      setShowSubmitConfirm(false);
      setView("result");
    }
  }, [view, timeLeft]);

  const current = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = ((currentIndex + 1) / total) * 100;
  const isLast = currentIndex === total - 1;
  const selectedOption = answers[current.id];
  const allAnswered = answeredCount === total;
  const lowTime = timeLeft < 60;

  const score = useMemo(() => {
    if (view === "quiz") return null;
    let correct = 0;
    for (const q of questions) if (answers[q.id] === q.correctOptionId) correct++;
    const ratio = correct / total;
    return {
      correct,
      incorrect: answeredCount - correct,
      skipped: total - answeredCount,
      percent: Math.round(ratio * 100),
      stars:
        ratio >= 0.9 ? 5 :
        ratio >= 0.8 ? 4 :
        ratio >= 0.7 ? 3 :
        ratio >= 0.6 ? 2 : 1,
      timeUsed: durationSec - timeLeft,
    };
  }, [view, answers, answeredCount, total, durationSec, timeLeft, questions]);

  const handleSelect = (optId: OptionId) =>
    setAnswers((prev) => ({ ...prev, [current.id]: optId }));

  const handleSubmit = () => {
    setView("result");
    setShowSubmitConfirm(false);
    setShowPalette(false);
  };

  if (!quiz) {
    return (
      <div className="px-3.5 pt-10 text-center">
        <p className="text-[14px] text-ink-muted">Quiz tidak ditemukan.</p>
        <button
          onClick={() => router.push("/student/quiz")}
          className="mt-3 text-[12px] font-bold text-brand-blue cursor-pointer"
        >
          Kembali ke daftar quiz
        </button>
      </div>
    );
  }

  if (view === "result" && score) {
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
            {score.percent >= 80 ? "Hebat!" : score.percent >= 60 ? "Bagus, terus berlatih!" : "Yuk coba lagi!"}
          </h2>
          <p className="text-[12px] text-white/85">
            {timeLeft === 0 ? "Waktu habis — jawaban otomatis dikumpulkan" : "Quiz selesai dikerjakan"}
          </p>

          <div className="mt-5 inline-flex items-baseline gap-1">
            <span className="text-[56px] font-extrabold leading-none">{score.percent}</span>
            <span className="text-[20px] font-bold text-white/85">%</span>
          </div>
          <div className="text-[12px] text-white/80 mt-1">
            {score.correct} dari {total} jawaban benar
          </div>

          <div className="flex justify-center gap-0.5 mt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className="text-[22px]"
                style={{ color: i < score.stars ? "#F5C518" : "rgba(255,255,255,0.35)" }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 px-3.5 pt-4">
          <div className="grid grid-cols-3 gap-2.5 mb-3.5">
            <div className="card p-3 text-center">
              <div className="text-[18px] font-extrabold text-teal-dark">{score.correct}</div>
              <div className="text-[10px] text-ink-muted mt-0.5">Benar</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-[18px] font-extrabold text-red-dark">{score.incorrect}</div>
              <div className="text-[10px] text-ink-muted mt-0.5">Salah</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-[18px] font-extrabold text-ink-muted">{score.skipped}</div>
              <div className="text-[10px] text-ink-muted mt-0.5">Kosong</div>
            </div>
          </div>

          <div className="card p-3.5 flex items-center gap-2.5 mb-3.5">
            <div className="w-9 h-9 rounded-[10px] bg-blue-light flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-brand-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-ink-muted">Waktu pengerjaan</div>
              <div className="text-[14px] font-extrabold text-ink">{fmtTime(score.timeUsed)}</div>
            </div>
            <Chip variant="blue">+{score.correct * 10} XP</Chip>
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

  if (view === "review") {
    return (
      <div className="min-h-dvh bg-surface-page">
        <header className="bg-surface-card border-b border-border px-3.5 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={() => setView("result")}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer"
            aria-label="Kembali ke hasil"
          >
            <ArrowLeft size={18} className="text-ink" />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-extrabold text-ink truncate">Review Jawaban</h3>
            <p className="text-[11px] text-ink-muted truncate">{quiz.title}</p>
          </div>
        </header>

        <div className="px-3.5 pt-3.5 pb-10 flex flex-col gap-2.5">
          {questions.map((q, idx) => {
            const myAns = answers[q.id];
            const isCorrect = myAns === q.correctOptionId;
            const isSkipped = !myAns;
            return (
              <div key={q.id} className="card p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 rounded-full bg-surface-soft text-[11px] font-extrabold text-ink flex items-center justify-center">
                    {idx + 1}
                  </div>
                  {isSkipped ? (
                    <Chip variant="soft">Kosong</Chip>
                  ) : isCorrect ? (
                    <Chip variant="teal">
                      <Check size={10} className="inline mr-0.5" /> Benar
                    </Chip>
                  ) : (
                    <Chip variant="red">
                      <X size={10} className="inline mr-0.5" /> Salah
                    </Chip>
                  )}
                </div>
                <p className="text-[13px] font-bold text-ink mb-3 leading-relaxed">{q.text}</p>

                <div className="flex flex-col gap-1.5 mb-2.5">
                  {q.options.map((opt) => {
                    const isMine = opt.id === myAns;
                    const isAnswer = opt.id === q.correctOptionId;
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
                    <div className="text-[11px] text-ink-secondary leading-relaxed">{q.explanation}</div>
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
      <header className="bg-surface-card border-b border-border px-3.5 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push("/student/quiz")}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer"
            aria-label="Keluar dari quiz"
          >
            <X size={18} className="text-ink" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-extrabold text-ink truncate">{quiz.title}</div>
            <div className="text-[10px] text-ink-muted truncate">{quiz.subject} • {quiz.chapter}</div>
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
            <Chip variant={subjectColor}>{quiz.subject}</Chip>
          </div>
          <p className="text-[15px] font-bold text-ink leading-relaxed">{current.text}</p>
        </div>

        <div className="flex flex-col gap-2.5">
          {current.options.map((opt) => {
            const selected = selectedOption === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
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
          aria-label="Soal sebelumnya"
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
            className="h-11 px-5 rounded-[12px] bg-brand-blue text-white text-[13px] font-extrabold active:scale-[0.98] transition-transform cursor-pointer"
          >
            Kumpulkan
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
            className="w-11 h-11 rounded-[12px] bg-brand-blue flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
            aria-label="Soal berikutnya"
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
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowPalette(false);
                    }}
                    className={cn(
                      "aspect-square rounded-[10px] border text-[13px] font-extrabold flex items-center justify-center transition-all cursor-pointer",
                      isCurrent && "ring-2 ring-brand-blue ring-offset-1",
                      isAnswered
                        ? "bg-brand-blue text-white border-brand-blue"
                        : "bg-surface-card text-ink border-border",
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 text-[10px] text-ink-muted mb-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-[3px] bg-brand-blue" /> Terjawab
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-[3px] bg-surface-card border border-border" /> Kosong
              </span>
            </div>
            <button
              onClick={() => setShowPalette(false)}
              className="w-full py-2.5 rounded-[10px] bg-surface-soft text-[12px] font-extrabold text-ink cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-5" onClick={() => setShowSubmitConfirm(false)}>
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
              {allAnswered ? "Kumpulkan jawaban?" : "Masih ada soal kosong"}
            </h3>
            <p className="text-[12px] text-ink-muted text-center mb-4">
              {allAnswered
                ? "Setelah dikumpulkan kamu tidak bisa mengubah jawaban."
                : `${total - answeredCount} soal belum dijawab. Yakin mau kumpulkan sekarang?`}
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2.5 rounded-[12px] bg-surface-soft text-[12px] font-extrabold text-ink cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-[12px] bg-brand-blue text-white text-[12px] font-extrabold cursor-pointer"
              >
                Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

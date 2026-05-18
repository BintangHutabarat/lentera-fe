import Link from "next/link";
import { Flame, Gamepad2 } from "lucide-react";
import { mockQuizzes } from "@/lib/mock-data";
import { PageTopbar } from "@/components/layout/PageTopbar";
import { subjectColorMap } from "@/lib/utils";
import { subjectIcons } from "@/lib/icons";

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
  const pending   = mockQuizzes.filter((q) => !q.completed);
  const completed = mockQuizzes.filter((q) => q.completed);

  return (
    <>
      <PageTopbar title="Quiz & Latihan" subtitle="Asah kemampuan kamu!" />
      <div className="px-3.5 pt-3.5">

        {/* Daily Challenge Banner */}
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

        {/* Pending */}
        <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Quiz Tersedia</h3>
        <div className="flex flex-col gap-2.5 mb-3.5">
          {pending.map((q) => {
            const c = subjectColorMap[q.subjectColor];
            const SubjIcon = subjectIcons[q.subjectColor];
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
                  <div className="text-[13px] font-extrabold text-ink">{q.title} — {q.subject}</div>
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

        {/* Completed */}
        <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Sudah Dikerjakan</h3>
        <div className="flex flex-col gap-2.5 mb-3.5">
          {completed.map((q) => {
            const c = subjectColorMap[q.subjectColor];
            const SubjIcon = subjectIcons[q.subjectColor];
            return (
              <div key={q.id} className="card p-3.5 flex gap-3 items-center">
                <div
                  className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ background: `${c.bar}22` }}
                >
                  <SubjIcon size={22} strokeWidth={1.5} style={{ color: c.bar }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-extrabold text-ink">{q.title} — {q.subject}</div>
                  <div className="text-[11px] text-ink-muted mt-0.5">{q.totalQuestions} soal • {q.chapter}</div>
                  {q.stars && <Stars count={q.stars} />}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[18px] font-extrabold" style={{ color: c.bar }}>{q.score}</div>
                  <div className="text-[10px] text-ink-muted">Nilai kamu</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

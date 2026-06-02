"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Brain } from "lucide-react";
import { PageTopbar } from "@/components/layout/PageTopbar";
import {
  getTeacherQuizzes,
  getTeacherClassSubjects,
} from "@/lib/services/teacher";
import { subjectColorMap } from "@/lib/utils";
import { subjectIcons } from "@/lib/icons";
import type { TeacherQuizListItem, TeacherClassSubject } from "@/lib/services/teacher";

export default function TeacherQuizPage() {
  return (
    <Suspense>
      <TeacherQuizContent />
    </Suspense>
  );
}

function TeacherQuizContent() {
  const params = useSearchParams();
  const initial = params.get("classSubjectId") ?? "";
  const [items, setItems] = useState<TeacherQuizListItem[]>([]);
  const [classSubjects, setClassSubjects] = useState<TeacherClassSubject[]>([]);
  const [filter, setFilter] = useState(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getTeacherQuizzes(filter || undefined),
      getTeacherClassSubjects(),
    ])
      .then(([list, cs]) => {
        setItems(list);
        setClassSubjects(cs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <>
      <PageTopbar
        title="Quiz"
        subtitle="Kelola quiz untuk siswa"
        right={
          <Link
            href="/teacher/quiz/buat"
            className="w-9 h-9 rounded-[10px] bg-brand-blue text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
            aria-label="Buat quiz"
          >
            <Plus size={18} />
          </Link>
        }
      />
      <div className="px-3.5 pt-3.5">
        <div className="mb-3.5">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full h-10 rounded-[10px] border border-border bg-surface-card px-3 text-[12px] text-ink outline-none focus:border-brand-blue transition-all cursor-pointer"
          >
            <option value="">Semua Kelas-Mapel</option>
            {classSubjects.map((cs) => (
              <option key={cs.id} value={cs.id}>
                {cs.subject.name} • {cs.class.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="card p-6 text-center">
            <Brain size={28} className="text-ink-muted mx-auto mb-3" />
            <p className="text-[12px] text-ink-muted mb-3">Belum ada quiz.</p>
            <Link href="/teacher/quiz/buat" className="inline-block text-[12px] font-bold text-brand-blue">
              Buat quiz pertama →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mb-3.5">
            {items.map((q) => {
              const c = subjectColorMap[q.classSubject.subject.color];
              const SubjIcon = subjectIcons[q.classSubject.subject.color];
              return (
                <Link
                  key={q.id}
                  href={`/teacher/quiz/${q.id}`}
                  className="card p-3.5 flex gap-3 items-center cursor-pointer hover:border-brand-teal transition-all active:scale-[0.99]"
                >
                  <div
                    className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center flex-shrink-0"
                    style={{ background: `${c.bar}22` }}
                  >
                    <SubjIcon size={20} strokeWidth={1.5} style={{ color: c.bar }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-extrabold text-ink truncate">{q.title}</div>
                    <div className="text-[11px] text-ink-muted mt-0.5 truncate">
                      {q.classSubject.subject.name} • {q.classSubject.class}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-soft text-ink-muted">
                        {q.totalQuestions} soal
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-soft text-ink-muted">
                        {q.durationMinutes} menit
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[13px] font-extrabold text-brand-blue">{q.completedSessionCount}</div>
                    <div className="text-[10px] text-ink-muted">Selesai</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

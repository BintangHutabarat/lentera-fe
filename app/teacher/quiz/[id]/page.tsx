"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, Sparkles, Trash2, Users } from "lucide-react";
import { getTeacherQuiz, deleteQuiz } from "@/lib/services/teacher";
import { isApiError } from "@/lib/api";
import { subjectColorMap, cn } from "@/lib/utils";
import type { TeacherQuizDetail } from "@/lib/services/teacher";

export default function TeacherQuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<TeacherQuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getTeacherQuiz(id)
      .then(setQuiz)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Hapus quiz ini? Tidak bisa dibatalkan.")) return;
    setDeleting(true);
    try {
      await deleteQuiz(id);
      router.push("/teacher/quiz");
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

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
        Quiz tidak ditemukan.
      </div>
    );
  }

  const c = subjectColorMap[quiz.classSubject.subject.color];

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
          <h3 className="text-[14px] font-extrabold text-ink truncate">{quiz.title}</h3>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-red-dark hover:bg-red-light transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Hapus quiz"
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
              {quiz.classSubject.subject.name}
            </span>
            <span className="text-[10px] text-ink-muted">{quiz.classSubject.class}</span>
          </div>
          <h2 className="text-[16px] font-extrabold text-ink mb-2">{quiz.title}</h2>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-full bg-surface-soft text-ink-muted font-bold">{quiz.chapter}</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-soft text-ink-muted font-bold">
              {quiz.totalQuestions} soal
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-soft text-ink-muted font-bold">
              {quiz.durationMinutes} menit
            </span>
          </div>
        </div>

        <Link
          href={`/teacher/quiz/${id}/hasil`}
          className="card p-3.5 mb-3.5 flex items-center gap-3 cursor-pointer hover:border-brand-teal transition-all active:scale-[0.99]"
        >
          <div className="w-10 h-10 rounded-[10px] bg-blue-light flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-brand-blue" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-extrabold text-ink">Lihat Hasil Siswa</div>
            <div className="text-[11px] text-ink-muted mt-0.5">Skor dan progres semua siswa</div>
          </div>
          <div className="text-ink-muted text-sm">›</div>
        </Link>

        <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Daftar Soal</h3>
        <div className="flex flex-col gap-2.5">
          {quiz.questions.map((q, idx) => (
            <div key={q.id} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-surface-soft text-[11px] font-extrabold text-ink flex items-center justify-center">
                  {idx + 1}
                </div>
                <span className="text-[10px] text-ink-muted">Soal {idx + 1}</span>
              </div>
              <p className="text-[13px] font-bold text-ink mb-3 leading-relaxed">{q.text}</p>
              <div className="flex flex-col gap-1.5 mb-2.5">
                {q.options.map((opt) => {
                  const isAnswer = opt.id === q.correctOptionId;
                  return (
                    <div
                      key={opt.id}
                      className={cn(
                        "rounded-[10px] border px-3 py-2 flex items-center gap-2.5 text-[12px] font-semibold",
                        isAnswer
                          ? "bg-teal-light border-[#3DD6B5] text-teal-dark"
                          : "bg-surface-soft border-border text-ink-secondary",
                      )}
                    >
                      <span className="w-5 h-5 rounded-full bg-white border border-border flex items-center justify-center text-[10px] font-extrabold uppercase flex-shrink-0">
                        {opt.id}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                      {isAnswer && <Check size={14} className="text-teal-dark flex-shrink-0" />}
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
          ))}
        </div>
      </div>
    </>
  );
}

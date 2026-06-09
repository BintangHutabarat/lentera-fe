"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { getTeacherClassSubjects, createQuiz } from "@/lib/services/teacher";
import { isApiError } from "@/lib/api";
import type { TeacherClassSubject, QuizQuestionInput } from "@/lib/services/teacher";

const OPTION_IDS = ["a", "b", "c", "d"];

function emptyQuestion(): QuizQuestionInput {
  return {
    text: "",
    options: OPTION_IDS.map((id) => ({ id, text: "" })),
    correctOptionId: "a",
    explanation: "",
  };
}

export default function TeacherBuatQuizPage() {
  return (
    <Suspense>
      <TeacherBuatQuizContent />
    </Suspense>
  );
}

function TeacherBuatQuizContent() {
  const router = useRouter();
  const search = useSearchParams();
  const [classSubjects, setClassSubjects] = useState<TeacherClassSubject[]>([]);
  const [classSubjectId, setClassSubjectId] = useState(search.get("classSubjectId") ?? "");
  const [title, setTitle] = useState("");
  const [chapter, setChapter] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [questions, setQuestions] = useState<QuizQuestionInput[]>([emptyQuestion()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTeacherClassSubjects().then(setClassSubjects).catch(() => {});
  }, []);

  const addQuestion = () => setQuestions((q) => [...q, emptyQuestion()]);
  const removeQuestion = (i: number) => setQuestions((q) => q.filter((_, idx) => idx !== i));
  const updateQuestion = (i: number, patch: Partial<QuizQuestionInput>) =>
    setQuestions((q) => q.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const updateOption = (qIdx: number, oIdx: number, value: string) =>
    setQuestions((q) =>
      q.map((x, idx) =>
        idx === qIdx
          ? { ...x, options: x.options.map((o, oi) => (oi === oIdx ? { ...o, text: value } : o)) }
          : x,
      ),
    );

  const handleSubmit = async () => {
    if (!classSubjectId || !title.trim() || !chapter.trim()) {
      setError("Mohon lengkapi kelas-mapel, judul, dan bab.");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Soal ${i + 1}: teks soal kosong.`);
        return;
      }
      if (q.options.some((o) => !o.text.trim())) {
        setError(`Soal ${i + 1}: ada pilihan kosong.`);
        return;
      }
      if (!q.explanation.trim()) {
        setError(`Soal ${i + 1}: pembahasan kosong.`);
        return;
      }
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await createQuiz({
        classSubjectId,
        title: title.trim(),
        chapter: chapter.trim(),
        durationMinutes,
        maxAttempts,
        questions: questions.map((q, i) => ({ ...q, order: i + 1 })),
      });
      router.push(`/teacher/quiz/${res.id}`);
    } catch (e) {
      setError(isApiError(e) ? e.message : "Gagal membuat quiz.");
    }
    setSubmitting(false);
  };

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
          <h3 className="text-[14px] font-extrabold text-ink">Buat Quiz</h3>
        </div>
      </header>

      <div className="px-3.5 pt-3.5 pb-24 flex flex-col gap-3.5">
        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Kelas-Mapel *</label>
          <select
            value={classSubjectId}
            onChange={(e) => setClassSubjectId(e.target.value)}
            className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue cursor-pointer"
          >
            <option value="">Pilih kelas-mapel</option>
            {classSubjects.map((cs) => (
              <option key={cs.id} value={cs.id}>{cs.subject.name} • {cs.class.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Judul *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="contoh: Quiz Turunan"
            className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-extrabold text-ink mb-1.5">Bab *</label>
            <input
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="Bab 3"
              className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-ink mb-1.5">Durasi (menit) *</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Maks Percobaan</label>
          <select
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(Number(e.target.value))}
            className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue cursor-pointer"
          >
            {[1, 2, 3, 5].map((n) => (
              <option key={n} value={n}>{n}x {n === 1 ? "(default)" : ""}</option>
            ))}
          </select>
          <p className="text-[10px] text-ink-muted mt-1">Berapa kali siswa boleh mengerjakan quiz ini.</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[14px] font-extrabold text-ink">Soal ({questions.length})</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="text-[12px] font-bold text-brand-blue flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} /> Tambah Soal
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {questions.map((q, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-extrabold text-brand-blue">Soal {i + 1}</span>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(i)}
                      className="text-red-dark cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <textarea
                  value={q.text}
                  onChange={(e) => updateQuestion(i, { text: e.target.value })}
                  rows={2}
                  placeholder="Tuliskan soal di sini..."
                  className="w-full rounded-[10px] border border-border bg-surface-card px-3 py-2.5 text-[13px] text-ink outline-none focus:border-brand-blue resize-none mb-2.5"
                />
                <div className="flex flex-col gap-2 mb-2.5">
                  {q.options.map((opt, oi) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuestion(i, { correctOptionId: opt.id })}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold uppercase flex-shrink-0 transition-colors cursor-pointer ${
                          q.correctOptionId === opt.id
                            ? "bg-teal-light text-teal-dark border-2 border-teal-dark"
                            : "bg-surface-soft text-ink-muted border border-border"
                        }`}
                      >
                        {opt.id}
                      </button>
                      <input
                        value={opt.text}
                        onChange={(e) => updateOption(i, oi, e.target.value)}
                        placeholder={`Pilihan ${opt.id.toUpperCase()}`}
                        className="flex-1 h-10 rounded-[10px] border border-border bg-surface-card px-3 text-[12px] text-ink outline-none focus:border-brand-blue"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-ink-muted mb-2">Klik huruf untuk menandai jawaban benar.</p>
                <textarea
                  value={q.explanation}
                  onChange={(e) => updateQuestion(i, { explanation: e.target.value })}
                  rows={2}
                  placeholder="Pembahasan jawaban..."
                  className="w-full rounded-[10px] border border-border bg-surface-card px-3 py-2.5 text-[12px] text-ink outline-none focus:border-brand-blue resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-[12px] text-red-dark bg-red-light rounded-[10px] px-3 py-2">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-opacity"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Menyimpan..." : "Buat Quiz"}
        </button>
      </div>
    </>
  );
}

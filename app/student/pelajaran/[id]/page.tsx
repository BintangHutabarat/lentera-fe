"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Circle, Loader2, ArrowLeft } from "lucide-react";
import { getSubject, completeChapter } from "@/lib/services/subjects";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { subjectColorMap } from "@/lib/utils";
import { subjectIcons } from "@/lib/icons";
import type { SubjectDetail, Chapter } from "@/lib/services/subjects";
import type { SubjectColor } from "@/lib/services/subjects";

export default function PelajaranDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [subject, setSubject] = useState<SubjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    getSubject(id).then(setSubject).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleComplete = async (chapter: Chapter) => {
    if (chapter.completed || completing) return;
    setCompleting(chapter.id);
    try {
      await completeChapter(chapter.id);
      setSubject((prev) =>
        prev
          ? {
              ...prev,
              chapters: prev.chapters.map((c) =>
                c.id === chapter.id
                  ? { ...c, completed: true, completedAt: new Date().toISOString() }
                  : c,
              ),
            }
          : prev,
      );
    } catch {
      /* silent */
    }
    setCompleting(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
        Memuat...
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-center px-6">
        <p className="text-[13px] text-ink-muted mb-3">Gagal memuat data mapel.</p>
        <button onClick={() => router.back()} className="text-[12px] text-brand-blue font-bold cursor-pointer">
          Kembali
        </button>
      </div>
    );
  }

  const c = subjectColorMap[subject.color as SubjectColor];
  const SubjIcon = subjectIcons[subject.color as SubjectColor];
  const done = subject.chapters.filter((ch) => ch.completed).length;
  const progress = subject.chapters.length > 0 ? Math.round((done / subject.chapters.length) * 100) : 0;

  return (
    <>
      {/* Topbar */}
      <header className="bg-surface-card border-b border-border px-[18px] py-[13px] flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-[9px] flex items-center justify-center text-ink-muted hover:bg-surface-soft transition-colors cursor-pointer flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-extrabold text-ink truncate">{subject.name}</h3>
          <p className="text-[11px] text-ink-muted mt-0.5">{subject.teacher.name}</p>
        </div>
      </header>

      <div className="px-3.5 pt-3.5">
        {/* Progress card */}
        <div className="card p-4 mb-3.5 flex items-center gap-3">
          <div
            className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center flex-shrink-0"
            style={{ background: `${c.bar}22` }}
          >
            <SubjIcon size={28} strokeWidth={1.5} style={{ color: c.bar }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-extrabold text-ink mb-1.5">
              {done} / {subject.chapters.length} Bab Selesai
            </div>
            <ProgressBar value={progress} height="sm" color={c.bar} />
            <div className="text-[10px] text-ink-muted mt-1">{progress}% selesai</div>
          </div>
        </div>

        {/* Chapter list */}
        <h3 className="text-[13px] font-extrabold text-ink mb-2.5">Daftar Bab</h3>
        <div className="card mb-3.5">
          {subject.chapters.map((chapter, i) => (
            <div
              key={chapter.id}
              className={`flex items-center gap-3 px-4 py-3.5 ${
                i < subject.chapters.length - 1 ? "border-b border-surface-soft" : ""
              }`}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: chapter.completed ? `${c.bar}22` : "#F4F6F8" }}
              >
                <span
                  className="text-[11px] font-extrabold"
                  style={{ color: chapter.completed ? c.bar : "#94a3b8" }}
                >
                  {chapter.order}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-ink">{chapter.title}</div>
                {chapter.completed && chapter.completedAt && (
                  <div className="text-[10px] text-ink-muted mt-0.5">
                    Selesai{" "}
                    {new Date(chapter.completedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleComplete(chapter)}
                disabled={chapter.completed || !!completing}
                className="flex-shrink-0 cursor-pointer disabled:cursor-default"
                aria-label={chapter.completed ? "Sudah selesai" : "Tandai selesai"}
              >
                {completing === chapter.id ? (
                  <Loader2 size={20} className="animate-spin text-ink-muted" />
                ) : chapter.completed ? (
                  <CheckCircle2 size={20} style={{ color: c.bar }} />
                ) : (
                  <Circle size={20} className="text-ink-muted hover:text-brand-blue transition-colors" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

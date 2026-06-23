"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, BookOpen } from "lucide-react";
import { getChapter, completeChapter } from "@/lib/services/subjects";
import type { ChapterContent } from "@/lib/services/subjects";

function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/```[\w]*\n([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2" loading="lazy" />')
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/, "<ul>$1</ul>")
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hup]|<li|<pre)(.+)$/gm, "<p>$1</p>")
    .replace(/<\/p><p>/g, "</p>\n<p>");
}

export default function ChapterReaderPage() {
  const { id: subjectId, chapterId } = useParams<{ id: string; chapterId: string }>();
  const router = useRouter();
  const [chapter, setChapter] = useState<ChapterContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    getChapter(subjectId, chapterId)
      .then(setChapter)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subjectId, chapterId]);

  const handleComplete = async () => {
    if (!chapter || chapter.completed || completing) return;
    setCompleting(true);
    try {
      await completeChapter(chapterId);
      setChapter((prev) => prev ? { ...prev, completed: true, completedAt: new Date().toISOString() } : prev);
    } catch {
      /* silent */
    }
    setCompleting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
        Memuat...
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-center px-6">
        <p className="text-[13px] text-ink-muted mb-3">Gagal memuat bab.</p>
        <button onClick={() => router.back()} className="text-[12px] text-brand-blue font-bold cursor-pointer">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <>
      <header className="bg-surface-card border-b border-border px-[18px] py-[13px] flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-[9px] flex items-center justify-center text-ink-muted hover:bg-surface-soft transition-colors cursor-pointer flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-extrabold text-ink truncate">{chapter.title}</h3>
          <p className="text-[11px] text-ink-muted mt-0.5">Bab {chapter.order}</p>
        </div>
        <button
          onClick={handleComplete}
          disabled={chapter.completed || completing}
          className="flex-shrink-0 cursor-pointer disabled:cursor-default"
          aria-label={chapter.completed ? "Sudah selesai" : "Tandai selesai"}
        >
          {completing ? (
            <Loader2 size={22} className="animate-spin text-brand-teal" />
          ) : (
            <CheckCircle2
              size={22}
              className={chapter.completed ? "text-brand-teal" : "text-ink-muted hover:text-brand-teal transition-colors"}
              fill={chapter.completed ? "currentColor" : "none"}
            />
          )}
        </button>
      </header>

      <div className="px-[18px] pt-4 pb-24">
        {chapter.completed && (
          <div className="flex items-center gap-2 text-[11px] font-bold text-brand-teal bg-teal-light rounded-[10px] px-3 py-2 mb-4">
            <CheckCircle2 size={14} />
            Bab ini sudah kamu tandai selesai
          </div>
        )}

        {chapter.content ? (
          <div
            className="prose-content text-[14px] text-ink leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(chapter.content) }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-surface-soft flex items-center justify-center mb-3">
              <BookOpen size={24} className="text-ink-muted" />
            </div>
            <p className="text-[13px] font-bold text-ink">Konten belum tersedia</p>
            <p className="text-[11px] text-ink-muted mt-1">Guru belum menambahkan materi untuk bab ini.</p>
          </div>
        )}

        {!chapter.completed && chapter.content && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="mt-8 w-full h-12 rounded-[14px] bg-brand-teal text-white font-extrabold text-[14px] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-opacity"
          >
            {completing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {completing ? "Menyimpan..." : "Tandai Selesai"}
          </button>
        )}
      </div>

      <style>{`
        .prose-content h1 { font-size: 1.3rem; font-weight: 800; margin: 1.2rem 0 0.6rem; color: #1C3B4A; }
        .prose-content h2 { font-size: 1.1rem; font-weight: 800; margin: 1rem 0 0.5rem; color: #1C3B4A; }
        .prose-content h3 { font-size: 0.95rem; font-weight: 700; margin: 0.8rem 0 0.4rem; color: #1C3B4A; }
        .prose-content p { margin: 0.5rem 0; }
        .prose-content img { display: block; max-width: 100%; height: auto; border-radius: 10px; margin: 0.9rem 0; }
        .prose-content ul { list-style: disc; padding-left: 1.4rem; margin: 0.5rem 0; }
        .prose-content ol { list-style: decimal; padding-left: 1.4rem; margin: 0.5rem 0; }
        .prose-content li { margin: 0.25rem 0; }
        .prose-content strong { font-weight: 700; }
        .prose-content em { font-style: italic; }
        .prose-content code { background: #F4F6F8; border-radius: 4px; padding: 0.1em 0.35em; font-size: 0.85em; font-family: monospace; }
        .prose-content pre { background: #1C3B4A; color: #e2e8f0; border-radius: 10px; padding: 1rem; overflow-x: auto; margin: 0.8rem 0; }
        .prose-content pre code { background: none; padding: 0; color: inherit; }
      `}</style>
    </>
  );
}

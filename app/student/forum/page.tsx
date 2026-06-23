"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ThumbsUp, MessageSquare, Bookmark, PenLine, GraduationCap, X, Loader2, SendHorizonal } from "lucide-react";
import {
  getForumPosts,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  createPost,
} from "@/lib/services/forum";
import { getSubjects } from "@/lib/services/subjects";
import { getMe } from "@/lib/services/auth";
import { PageTopbar } from "@/components/layout/PageTopbar";
import { Chip } from "@/components/ui/Chip";
import { subjectColorMap, timeAgo } from "@/lib/utils";
import type { ForumPost } from "@/lib/services/forum";
import type { Subject, SubjectColor } from "@/lib/services/subjects";

const FILTERS = ["Semua", "Matematika", "Fisika", "Biologi", "Umum"];

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [myInitials, setMyInitials] = useState("Me");

  // Compose modal state
  const [composing, setComposing] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [draftSubjectId, setDraftSubjectId] = useState<string | undefined>(undefined);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    Promise.all([getForumPosts(), getMe(), getSubjects()])
      .then(([data, me, subjs]) => {
        setPosts(data.items);
        setSubjects(subjs);
        const name = (me.profile as { name: string }).name ?? "";
        setMyInitials(name.split(" ").slice(0, 2).map((n: string) => n[0]).join(""));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLike = async (post: ForumPost) => {
    const optimistic = posts.map((p) =>
      p.id !== post.id
        ? p
        : { ...p, likedByMe: !p.likedByMe, likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1 },
    );
    setPosts(optimistic);
    try {
      post.likedByMe ? await unlikePost(post.id) : await likePost(post.id);
    } catch {
      setPosts(posts);
    }
  };

  const handleSave = async (post: ForumPost) => {
    const optimistic = posts.map((p) =>
      p.id !== post.id ? p : { ...p, savedByMe: !p.savedByMe },
    );
    setPosts(optimistic);
    try {
      post.savedByMe ? await unsavePost(post.id) : await savePost(post.id);
    } catch {
      setPosts(posts);
    }
  };

  const handlePost = async () => {
    const text = draftContent.trim();
    if (!text || posting) return;
    setPosting(true);
    try {
      const newPost = await createPost(text, draftSubjectId);
      setPosts((prev) => [newPost, ...prev]);
      setDraftContent("");
      setDraftSubjectId(undefined);
      setComposing(false);
    } catch {
      /* silent */
    }
    setPosting(false);
  };

  return (
    <>
      <PageTopbar
        back
        title="Forum Diskusi"
        subtitle="Diskusi bersama"
        right={
          <Link
            href="/student/forum/tersimpan"
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-ink-muted hover:bg-surface-soft transition-colors"
          >
            <Bookmark size={18} />
          </Link>
        }
      />
      <div className="px-3.5 pt-3.5">

        {/* Compose bar */}
        <button
          onClick={() => setComposing(true)}
          className="card p-3.5 flex gap-2.5 items-center mb-3.5 w-full cursor-pointer hover:border-brand-teal transition-all text-left"
        >
          <div
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-extrabold flex-shrink-0"
            style={{ background: "#E0FAF6", color: "#1a9c87" }}
          >
            {myInitials}
          </div>
          <div className="flex-1 bg-surface-soft rounded-full px-3.5 py-2 text-[12px] text-ink-muted flex items-center gap-1.5">
            <PenLine size={12} />
            Tulis pertanyaan atau diskusi...
          </div>
        </button>

        {/* Filter */}
        <div className="flex gap-2 mb-3.5 overflow-x-auto scrollbar-hide pb-0.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === f
                  ? "bg-brand-blue text-white border-brand-blue"
                  : "bg-surface-card text-ink-muted border-border"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
            Memuat...
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mb-3.5">
            {posts.map((post) => {
              const subjectColor = post.subject
                ? (subjectColorMap[post.subject.color as SubjectColor]?.bar ?? "#3DD6B5")
                : undefined;

              return (
                <div key={post.id} className="card p-3.5">
                  <Link href={`/student/forum/${post.id}`} className="block">
                    <div className="flex gap-2.5 items-center mb-2.5">
                      <div
                        className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-extrabold flex-shrink-0"
                        style={{ background: post.author.avatarColor, color: "#1C3B4A" }}
                      >
                        {post.author.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-ink flex items-center gap-1">
                          {post.author.name}
                          {post.author.role === "TEACHER" && (
                            <GraduationCap size={12} className="text-brand-teal" />
                          )}
                        </div>
                        <div className="text-[10px] text-ink-muted mt-0.5">{timeAgo(post.createdAt)}</div>
                      </div>
                      {post.subject && (
                        post.author.role === "TEACHER" ? (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ background: "linear-gradient(135deg,#22A96C,#3DD6B5)" }}
                          >
                            Guru
                          </span>
                        ) : (
                          <Chip variant={post.subject.color as never}>{post.subject.name}</Chip>
                        )
                      )}
                    </div>
                    <p className="text-[12px] text-ink-secondary leading-relaxed mb-2.5">{post.content}</p>
                  </Link>

                  <div className="flex gap-3 pt-2 border-t border-surface-soft">
                    <button
                      onClick={() => handleLike(post)}
                      className={`text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        post.likedByMe ? "text-brand-blue" : "text-ink-muted hover:text-brand-blue"
                      }`}
                    >
                      <ThumbsUp size={12} /> {post.likeCount}
                    </button>
                    <Link
                      href={`/student/forum/${post.id}`}
                      className="text-[11px] font-semibold text-ink-muted flex items-center gap-1 hover:text-brand-blue transition-colors cursor-pointer"
                    >
                      <MessageSquare size={12} /> {post.replyCount} Balas
                    </Link>
                    <button
                      onClick={() => handleSave(post)}
                      className={`text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        post.savedByMe ? "text-brand-blue" : "text-ink-muted hover:text-brand-blue"
                      }`}
                    >
                      <Bookmark size={12} fill={post.savedByMe ? "currentColor" : "none"} /> Simpan
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compose modal */}
      {composing && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end" onClick={() => setComposing(false)}>
          <div
            className="w-full bg-surface-card rounded-t-[20px] p-5 flex flex-col gap-4"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-extrabold text-ink">Buat Diskusi</h3>
              <button
                onClick={() => setComposing(false)}
                className="w-7 h-7 rounded-full bg-surface-soft flex items-center justify-center cursor-pointer"
              >
                <X size={14} className="text-ink-muted" />
              </button>
            </div>

            <textarea
              autoFocus
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              placeholder="Tulis pertanyaan atau diskusi..."
              rows={4}
              className="w-full resize-none bg-surface-soft rounded-[12px] px-3.5 py-3 text-[13px] text-ink placeholder:text-ink-muted outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all leading-relaxed"
            />

            {subjects.length > 0 && (
              <div>
                <label className="block text-[11px] font-extrabold text-ink mb-1.5">
                  Mapel (opsional)
                </label>
                <select
                  value={draftSubjectId ?? ""}
                  onChange={(e) => setDraftSubjectId(e.target.value || undefined)}
                  className="w-full h-10 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue transition-all cursor-pointer"
                >
                  <option value="">Umum (tanpa mapel)</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handlePost}
              disabled={!draftContent.trim() || posting}
              className="h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-opacity"
            >
              {posting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <SendHorizonal size={16} />
              )}
              {posting ? "Memposting..." : "Kirim"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

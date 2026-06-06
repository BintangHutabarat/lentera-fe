"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap, Loader2, MessageSquare, PenLine,
  Pin, SendHorizonal, ThumbsUp, Trash2, X,
} from "lucide-react";
import {
  getForumPosts,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  createPost,
  pinPost,
  unpinPost,
  deletePost,
} from "@/lib/services/forum";
import { getTeacherMe } from "@/lib/services/teacher";
import { PageTopbar } from "@/components/layout/PageTopbar";
import { subjectColorMap, timeAgo } from "@/lib/utils";
import type { ForumPost } from "@/lib/services/forum";
import type { SubjectColor } from "@/lib/services/subjects";

export default function TeacherForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);
  const [myInitials, setMyInitials] = useState("Gu");

  // Compose state
  const [composing, setComposing] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    Promise.all([getForumPosts(), getTeacherMe()])
      .then(([data, me]) => {
        setPosts(data.items);
        setMyId(me.id);
        setMyInitials(me.name.split(" ").slice(0, 2).map((n) => n[0]).join(""));
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

  const handlePin = async (post: ForumPost) => {
    const optimistic = posts.map((p) =>
      p.id !== post.id ? p : { ...p, isPinned: !p.isPinned },
    );
    setPosts(optimistic);
    try {
      post.isPinned ? await unpinPost(post.id) : await pinPost(post.id);
    } catch {
      setPosts(posts);
    }
  };

  const handleDelete = async (post: ForumPost) => {
    if (!confirm("Hapus diskusi ini?")) return;
    try {
      await deletePost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch {
      /* silent */
    }
  };

  const handlePost = async () => {
    const text = draftContent.trim();
    if (!text || posting) return;
    setPosting(true);
    try {
      const newPost = await createPost(text);
      setPosts((prev) => [newPost, ...prev]);
      setDraftContent("");
      setComposing(false);
    } catch {
      /* silent */
    }
    setPosting(false);
  };

  return (
    <>
      <PageTopbar title="Forum Diskusi" subtitle="Diskusi dengan siswa" />
      <div className="px-3.5 pt-3.5">

        {/* Compose bar */}
        <button
          onClick={() => setComposing(true)}
          className="card p-3.5 flex gap-2.5 items-center mb-3.5 w-full cursor-pointer hover:border-brand-teal transition-all text-left"
        >
          <div
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-extrabold flex-shrink-0"
            style={{ background: "#FEF9E7", color: "#c09000" }}
          >
            {myInitials}
          </div>
          <div className="flex-1 bg-surface-soft rounded-full px-3.5 py-2 text-[12px] text-ink-muted flex items-center gap-1.5">
            <PenLine size={12} />
            Tulis pengumuman atau diskusi...
          </div>
        </button>

        {/* Posts */}
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
            Memuat...
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-soft flex items-center justify-center mb-3">
              <MessageSquare size={22} className="text-ink-muted" />
            </div>
            <p className="text-[13px] font-bold text-ink">Belum ada diskusi</p>
            <p className="text-[11px] text-ink-muted mt-1">Mulai diskusi dengan siswa.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mb-24">
            {posts.map((post) => {
              const subjectColor = post.subject
                ? (subjectColorMap[post.subject.color as SubjectColor]?.bar ?? "#3DD6B5")
                : undefined;

              return (
                <div key={post.id} className="card p-3.5">
                  {post.isPinned && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-blue mb-2">
                      <Pin size={10} /> Disematkan
                    </div>
                  )}
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
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${subjectColor}22`, color: subjectColor }}
                        >
                          {post.subject.name}
                        </span>
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
                      <MessageSquare size={12} /> {post.replyCount}
                    </Link>
                    <button
                      onClick={() => handlePin(post)}
                      className={`text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        post.isPinned ? "text-brand-blue" : "text-ink-muted hover:text-brand-blue"
                      }`}
                    >
                      <Pin size={12} /> {post.isPinned ? "Lepas" : "Sematkan"}
                    </button>
                    <button
                      onClick={() => handleDelete(post)}
                      className="text-[11px] font-semibold text-ink-muted hover:text-red-dark flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                    >
                      <Trash2 size={12} />
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
              placeholder="Tulis diskusi atau pengumuman..."
              rows={4}
              className="w-full resize-none bg-surface-soft rounded-[12px] px-3.5 py-3 text-[13px] text-ink placeholder:text-ink-muted outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all leading-relaxed"
            />

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

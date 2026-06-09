"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, GraduationCap, Loader2, SendHorizonal, ThumbsUp, Trash2, Pin } from "lucide-react";
import {
  getForumPost,
  likePost,
  unlikePost,
  replyToPost,
  deletePost,
  deleteReply,
  pinPost,
  unpinPost,
} from "@/lib/services/forum";
import { getMe } from "@/lib/services/auth";
import { Chip } from "@/components/ui/Chip";
import { subjectColorMap, timeAgo } from "@/lib/utils";
import type { ForumPostDetail, ForumPost, ForumReply } from "@/lib/services/forum";
import type { SubjectColor } from "@/lib/services/subjects";

export default function ForumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<ForumPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<string>("STUDENT");
  const [myInitials, setMyInitials] = useState("Me");
  const [myAvatarColor, setMyAvatarColor] = useState("#E0FAF6");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [pinning, setPinning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([getForumPost(id), getMe()])
      .then(([data, me]) => {
        setDetail(data);
        setMyId(me.id);
        setMyRole(me.role);
        const name = (me.profile as { name: string }).name ?? "";
        setMyInitials(name.split(" ").slice(0, 2).map((n: string) => n[0]).join(""));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!detail) return;
    const post = detail.post;
    setDetail((prev) =>
      prev
        ? {
            ...prev,
            post: {
              ...post,
              likedByMe: !post.likedByMe,
              likeCount: post.likedByMe ? post.likeCount - 1 : post.likeCount + 1,
            },
          }
        : prev,
    );
    try {
      post.likedByMe ? await unlikePost(id) : await likePost(id);
    } catch {
      setDetail((prev) => (prev ? { ...prev, post } : prev));
    }
  };

  const handlePin = async () => {
    if (!detail || pinning) return;
    setPinning(true);
    const isPinned = detail.post.isPinned;
    try {
      isPinned ? await unpinPost(id) : await pinPost(id);
      setDetail((prev) => prev ? { ...prev, post: { ...prev.post, isPinned: !isPinned } } : prev);
    } catch {
      /* silent */
    }
    setPinning(false);
  };

  const handleDeletePost = async () => {
    if (!detail || !confirm("Hapus diskusi ini?")) return;
    try {
      await deletePost(id);
      router.back();
    } catch {
      /* silent */
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("Hapus balasan ini?")) return;
    try {
      await deleteReply(id, replyId);
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              post: { ...prev.post, replyCount: prev.post.replyCount - 1 },
              replies: prev.replies.filter((r) => r.id !== replyId),
            }
          : prev,
      );
    } catch {
      /* silent */
    }
  };

  const handleReply = async () => {
    const text = replyText.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const reply = await replyToPost(id, text);
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              post: { ...prev.post, replyCount: prev.post.replyCount + 1 },
              replies: [...prev.replies, reply],
            }
          : prev,
      );
      setReplyText("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      /* silent */
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
        Memuat...
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-center px-6">
        <p className="text-[13px] text-ink-muted mb-3">Gagal memuat diskusi.</p>
        <button onClick={() => router.back()} className="text-[12px] text-brand-blue font-bold cursor-pointer">
          Kembali
        </button>
      </div>
    );
  }

  const { post, replies } = detail;
  const subjectColor = post.subject
    ? (subjectColorMap[post.subject.color as SubjectColor]?.bar ?? "#3DD6B5")
    : undefined;

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
          <h3 className="text-[15px] font-extrabold text-ink">Detail Diskusi</h3>
          <p className="text-[11px] text-ink-muted mt-0.5">{post.replyCount} balasan</p>
        </div>
      </header>

      <div className="px-3.5 pt-3.5 pb-28">
        {/* Original post */}
        <div className="card p-3.5 mb-3.5">
          {post.isPinned && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-blue mb-2.5">
              <Pin size={11} /> Disematkan
            </div>
          )}
          <div className="flex gap-2.5 items-center mb-2.5">
            <div
              className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-[12px] font-extrabold flex-shrink-0"
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
              <Chip variant={post.subject.color as never}>{post.subject.name}</Chip>
            )}
          </div>

          <p className="text-[13px] text-ink leading-relaxed mb-3">{post.content}</p>

          <div className="flex gap-3 pt-2.5 border-t border-surface-soft">
            <button
              onClick={handleLike}
              className={`text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                post.likedByMe ? "text-brand-blue" : "text-ink-muted hover:text-brand-blue"
              }`}
            >
              <ThumbsUp size={12} /> {post.likeCount}
            </button>
            {(myRole === "TEACHER" || myRole === "ADMIN") && (
              <button
                onClick={handlePin}
                disabled={pinning}
                className={`text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  post.isPinned ? "text-brand-blue" : "text-ink-muted hover:text-brand-blue"
                }`}
              >
                <Pin size={12} /> {post.isPinned ? "Lepas" : "Sematkan"}
              </button>
            )}
            {(myId === post.author.id || myRole === "TEACHER" || myRole === "ADMIN") && (
              <button
                onClick={handleDeletePost}
                className="text-[11px] font-semibold text-ink-muted hover:text-red-dark flex items-center gap-1 transition-colors cursor-pointer ml-auto"
              >
                <Trash2 size={12} /> Hapus
              </button>
            )}
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <>
            <div className="text-[11px] font-extrabold text-ink-muted uppercase tracking-wide mb-2">
              Balasan ({replies.length})
            </div>
            <div className="flex flex-col gap-2.5 mb-3.5">
              {replies.map((reply) => (
                <div key={reply.id} className="card p-3.5">
                  <div className="flex gap-2.5 items-center mb-2">
                    <div
                      className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0"
                      style={{ background: reply.author.avatarColor, color: "#1C3B4A" }}
                    >
                      {reply.author.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-bold text-ink flex items-center gap-1">
                        {reply.author.name}
                        {reply.author.role === "TEACHER" && (
                          <GraduationCap size={11} className="text-brand-teal" />
                        )}
                      </div>
                      <div className="text-[10px] text-ink-muted">{timeAgo(reply.createdAt)}</div>
                    </div>
                    {(myId === reply.author.id || myRole === "TEACHER" || myRole === "ADMIN") && (
                      <button
                        onClick={() => handleDeleteReply(reply.id)}
                        className="w-6 h-6 flex items-center justify-center text-ink-muted hover:text-red-dark transition-colors cursor-pointer flex-shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-[12px] text-ink-secondary leading-relaxed">{reply.content}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Reply input — fixed at bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-border px-3.5 py-3 flex gap-2.5 items-end z-20"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      >
        <div
          className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0"
          style={{ background: myAvatarColor, color: "#1a9c87" }}
        >
          {myInitials}
        </div>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleReply();
            }
          }}
          placeholder="Tulis balasan..."
          rows={1}
          className="flex-1 resize-none bg-surface-soft rounded-[10px] px-3 py-2 text-[12px] text-ink placeholder:text-ink-muted outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all leading-relaxed"
          style={{ maxHeight: "96px", overflowY: "auto" }}
        />
        <button
          onClick={handleReply}
          disabled={!replyText.trim() || sending}
          className="w-9 h-9 rounded-[10px] bg-brand-blue flex items-center justify-center flex-shrink-0 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-opacity"
        >
          {sending ? (
            <Loader2 size={15} className="animate-spin text-white" />
          ) : (
            <SendHorizonal size={15} className="text-white" />
          )}
        </button>
      </div>
    </>
  );
}

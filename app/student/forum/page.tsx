"use client";
import { useEffect, useState } from "react";
import { ThumbsUp, MessageSquare, Bookmark, PenLine, GraduationCap } from "lucide-react";
import { getForumPosts, likePost, unlikePost, savePost, unsavePost } from "@/lib/services/forum";
import { getMe } from "@/lib/services/auth";
import { PageTopbar } from "@/components/layout/PageTopbar";
import { Chip } from "@/components/ui/Chip";
import { subjectColorMap } from "@/lib/utils";
import { timeAgo } from "@/lib/utils";
import type { ForumPost } from "@/lib/services/forum";
import type { SubjectColor } from "@/lib/services/subjects";

const FILTERS = ["Semua", "Matematika", "Fisika", "Biologi", "Umum"];

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [myInitials, setMyInitials] = useState("Me");

  useEffect(() => {
    Promise.all([getForumPosts(), getMe()])
      .then(([data, me]) => {
        setPosts(data.items);
        const name = (me.profile as { name: string }).name ?? "";
        setMyInitials(name.split(" ").slice(0, 2).map((n: string) => n[0]).join(""));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLike = async (post: ForumPost) => {
    const optimistic = posts.map((p) =>
      p.id !== post.id ? p : {
        ...p,
        likedByMe: !p.likedByMe,
        likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1,
      }
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
      p.id !== post.id ? p : { ...p, savedByMe: !p.savedByMe }
    );
    setPosts(optimistic);
    try {
      post.savedByMe ? await unsavePost(post.id) : await savePost(post.id);
    } catch {
      setPosts(posts);
    }
  };

  return (
    <>
      <PageTopbar title="Forum Diskusi" subtitle="Diskusi bersama" />
      <div className="px-3.5 pt-3.5">

        {/* Compose */}
        <div className="card p-3.5 flex gap-2.5 items-center mb-3.5 cursor-pointer hover:border-brand-teal transition-all">
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
        </div>

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
                          style={{ background: "linear-gradient(135deg,#2B9FD8,#3DD6B5)" }}
                        >
                          Guru
                        </span>
                      ) : (
                        <Chip variant={post.subject.color as never}>{post.subject.name}</Chip>
                      )
                    )}
                  </div>

                  <p className="text-[12px] text-ink-secondary leading-relaxed mb-2.5">{post.content}</p>

                  <div className="flex gap-3 pt-2 border-t border-surface-soft">
                    <button
                      onClick={() => handleLike(post)}
                      className={`text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        post.likedByMe ? "text-brand-blue" : "text-ink-muted hover:text-brand-blue"
                      }`}
                    >
                      <ThumbsUp size={12} /> {post.likeCount}
                    </button>
                    <button className="text-[11px] font-semibold text-ink-muted flex items-center gap-1 hover:text-brand-blue transition-colors cursor-pointer">
                      <MessageSquare size={12} /> {post.replyCount} Balas
                    </button>
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
    </>
  );
}

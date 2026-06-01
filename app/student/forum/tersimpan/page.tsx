"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, GraduationCap, ThumbsUp, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSavedPosts, likePost, unlikePost, savePost, unsavePost } from "@/lib/services/forum";
import { Chip } from "@/components/ui/Chip";
import { subjectColorMap, timeAgo } from "@/lib/utils";
import type { ForumPost } from "@/lib/services/forum";
import type { SubjectColor } from "@/lib/services/subjects";

export default function ForumTersimpanPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedPosts({ limit: 50 })
      .then((data) => setPosts(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLike = async (post: ForumPost) => {
    const snapshot = posts;
    setPosts((prev) =>
      prev.map((p) =>
        p.id !== post.id
          ? p
          : { ...p, likedByMe: !p.likedByMe, likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1 },
      ),
    );
    try {
      post.likedByMe ? await unlikePost(post.id) : await likePost(post.id);
    } catch {
      setPosts(snapshot);
    }
  };

  const handleUnsave = async (post: ForumPost) => {
    const snapshot = posts;
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    try {
      await unsavePost(post.id);
    } catch {
      setPosts(snapshot);
    }
  };

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
          <h3 className="text-[15px] font-extrabold text-ink">Diskusi Tersimpan</h3>
          {!loading && (
            <p className="text-[11px] text-ink-muted mt-0.5">{posts.length} diskusi</p>
          )}
        </div>
      </header>

      <div className="px-3.5 pt-3.5">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
            Memuat...
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-soft flex items-center justify-center mb-4">
              <Bookmark size={28} className="text-ink-muted" />
            </div>
            <h3 className="text-[15px] font-extrabold text-ink mb-2">Belum ada yang tersimpan</h3>
            <p className="text-[12px] text-ink-muted max-w-[240px] leading-relaxed">
              Tap ikon Simpan pada diskusi untuk menyimpannya di sini.
            </p>
            <Link
              href="/student/forum"
              className="mt-4 text-[12px] font-bold text-brand-blue"
            >
              Lihat Forum →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mb-3.5">
            {posts.map((post) => (
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
                      <Chip variant={post.subject.color as never}>{post.subject.name}</Chip>
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
                    className="text-[11px] font-semibold text-ink-muted flex items-center gap-1 hover:text-brand-blue transition-colors"
                  >
                    <MessageSquare size={12} /> {post.replyCount} Balas
                  </Link>
                  <button
                    onClick={() => handleUnsave(post)}
                    className="text-[11px] font-semibold flex items-center gap-1 text-brand-blue transition-colors cursor-pointer ml-auto"
                  >
                    <Bookmark size={12} fill="currentColor" /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

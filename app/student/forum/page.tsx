"use client";
import { useState } from "react";
import { ThumbsUp, MessageSquare, Bookmark, PenLine, GraduationCap } from "lucide-react";
import { mockForumPosts, mockStudent } from "@/lib/mock-data";
import { PageTopbar } from "@/components/layout/PageTopbar";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { subjectColorMap } from "@/lib/utils";

const FILTERS = ["Semua", "Matematika", "Fisika", "Biologi", "Umum"];

export default function ForumPage() {
  const [activeFilter, setActiveFilter] = useState("Semua");
  const s = mockStudent;
  const initials = s.name.split(" ").slice(0, 2).map((n) => n[0]).join("");

  return (
    <>
      <PageTopbar title="Forum Diskusi" subtitle="XII IPA 1" />
      <div className="px-3.5 pt-3.5">

        {/* Compose */}
        <div className="card p-3.5 flex gap-2.5 items-center mb-3.5 cursor-pointer hover:border-brand-teal transition-all">
          <Avatar initials={initials} bgColor="#E0FAF6" textColor="#1a9c87" />
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
        <div className="flex flex-col gap-2.5 mb-3.5">
          {mockForumPosts.map((post) => {
            const subjectColor = post.subjectColor
              ? (subjectColorMap[post.subjectColor]?.bar ?? "#3DD6B5")
              : undefined;

            return (
              <div key={post.id} className="card p-3.5">
                {/* Header */}
                <div className="flex gap-2.5 items-center mb-2.5">
                  <div
                    className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-extrabold flex-shrink-0"
                    style={{ background: post.authorColor, color: "#1C3B4A" }}
                  >
                    {post.authorInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-ink flex items-center gap-1">
                      {post.author}
                      {post.role === "teacher" && (
                        <GraduationCap size={12} className="text-brand-teal" />
                      )}
                    </div>
                    <div className="text-[10px] text-ink-muted mt-0.5">{post.timeAgo}</div>
                  </div>
                  {post.subjectTag && (
                    post.role === "teacher" ? (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: "linear-gradient(135deg,#2B9FD8,#3DD6B5)" }}
                      >
                        Guru
                      </span>
                    ) : (
                      <Chip variant={post.subjectColor as never ?? "soft"}>{post.subjectTag}</Chip>
                    )
                  )}
                </div>

                {/* Body */}
                <p className="text-[12px] text-ink-secondary leading-relaxed mb-2.5">{post.content}</p>

                {/* Footer */}
                <div className="flex gap-3 pt-2 border-t border-surface-soft">
                  <button className="text-[11px] font-semibold text-ink-muted flex items-center gap-1 hover:text-brand-blue transition-colors cursor-pointer">
                    <ThumbsUp size={12} /> {post.likes}
                  </button>
                  <button className="text-[11px] font-semibold text-ink-muted flex items-center gap-1 hover:text-brand-blue transition-colors cursor-pointer">
                    <MessageSquare size={12} /> {post.replies} Balas
                  </button>
                  <button className="text-[11px] font-semibold text-ink-muted flex items-center gap-1 hover:text-brand-blue transition-colors cursor-pointer">
                    <Bookmark size={12} /> Simpan
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

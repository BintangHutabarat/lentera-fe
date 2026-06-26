"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ChevronRight, BookOpen, FileText } from "lucide-react";
import { getSubject, getStudentMateri } from "@/lib/services/subjects";
import { subjectColorMap } from "@/lib/utils";
import { subjectIcons } from "@/lib/icons";
import type { SubjectDetail, Materi } from "@/lib/services/subjects";
import type { SubjectColor } from "@/lib/services/subjects";

export default function PelajaranDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [subject, setSubject] = useState<SubjectDetail | null>(null);
  const [materi, setMateri] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSubject(id), getStudentMateri(id).catch(() => [] as Materi[])])
      .then(([subj, items]) => {
        setSubject(subj);
        setMateri(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

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
        {/* Subject card */}
        <div className="card p-4 mb-3.5 flex items-center gap-3">
          <div
            className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center flex-shrink-0"
            style={{ background: `${c.bar}22` }}
          >
            <SubjIcon size={28} strokeWidth={1.5} style={{ color: c.bar }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-extrabold text-ink truncate">{subject.name}</div>
            <div className="text-[11px] text-ink-muted mt-0.5">
              {subject.teacher.title} • {materi.length} materi
            </div>
          </div>
        </div>

        {/* Absensi shortcut */}
        <Link
          href={`/student/pelajaran/${id}/absensi`}
          className="card px-4 py-3 mb-3.5 flex items-center gap-3 hover:border-brand-teal transition-all cursor-pointer"
        >
          <div className="w-9 h-9 rounded-[10px] bg-surface-soft flex items-center justify-center flex-shrink-0">
            <CalendarDays size={17} className="text-brand-blue" />
          </div>
          <span className="flex-1 text-[13px] font-extrabold text-ink">Rekap Absensi</span>
          <ChevronRight size={14} className="text-ink-muted" />
        </Link>

        {/* Materi feed */}
        <h3 className="text-[13px] font-extrabold text-ink mb-2.5 flex items-center gap-1.5">
          <BookOpen size={14} /> Materi ({materi.length})
        </h3>

        {materi.length === 0 ? (
          <div className="card p-6 mb-3.5 flex flex-col items-center text-center gap-1.5">
            <div className="w-11 h-11 rounded-full bg-surface-soft flex items-center justify-center mb-1">
              <BookOpen size={20} className="text-ink-muted" />
            </div>
            <p className="text-[13px] font-bold text-ink">Belum ada materi</p>
            <p className="text-[11px] text-ink-muted">Materi dari guru akan tampil di sini.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mb-3.5">
            {materi.map((item) => (
              <div key={item.id} className="card p-3.5">
                {item.type === "TEXT" ? (
                  <p className="text-[13px] text-ink leading-relaxed whitespace-pre-wrap break-words">
                    {item.content}
                  </p>
                ) : item.type === "IMAGE" ? (
                  <a href={item.content} target="_blank" rel="noopener noreferrer" className="block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.content}
                      alt={item.fileName ?? "Foto materi"}
                      loading="lazy"
                      className="w-full max-h-72 object-cover rounded-[10px]"
                    />
                    {item.fileName && (
                      <div className="text-[10px] text-ink-muted mt-1.5 truncate">{item.fileName}</div>
                    )}
                  </a>
                ) : (
                  <a
                    href={item.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-10 h-10 rounded-[10px] bg-red-light flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-red-dark" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-bold text-ink truncate">
                        {item.fileName ?? "Dokumen PDF"}
                      </div>
                      <div className="text-[10px] text-ink-muted">Ketuk untuk membuka</div>
                    </div>
                  </a>
                )}
                <div className="text-[10px] text-ink-muted mt-2">
                  {new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

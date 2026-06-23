"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, Paperclip, Star, Clock, CheckCheck } from "lucide-react";
import { getAssignments } from "@/lib/services/assignments";
import { PageTopbar } from "@/components/layout/PageTopbar";
import { Chip } from "@/components/ui/Chip";
import { subjectColorMap, dueUrgencyStyles, getDueUrgency, getDueLabel } from "@/lib/utils";
import { subjectIcons } from "@/lib/icons";
import type { AssignmentListItem, AssignmentStatus } from "@/lib/services/assignments";

type Filter = "semua" | AssignmentStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "semua",   label: "Semua" },
  { value: "segera",  label: "Segera" },
  { value: "selesai", label: "Selesai" },
  { value: "belum",   label: "Belum Mulai" },
];

export default function TugasPage() {
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("semua");

  useEffect(() => {
    getAssignments().then(setAssignments).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "semua"
    ? assignments
    : assignments.filter((a) => a.status === filter);

  return (
    <>
      <PageTopbar
        back
        title="Tugas"
        subtitle={loading ? "Memuat..." : `${assignments.length} tugas aktif`}
      />
      <div className="px-3.5 pt-3.5">
        <div className="flex gap-2 mb-3.5 overflow-x-auto scrollbar-hide pb-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                filter === f.value
                  ? "bg-brand-blue text-white border-brand-blue"
                  : "bg-surface-card text-ink-muted border-border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
            Memuat...
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((a) => {
              const c = subjectColorMap[a.subject.color];
              const SubjIcon = subjectIcons[a.subject.color];
              const urgency = getDueUrgency(a.dueAt, a.status);
              const due = dueUrgencyStyles[urgency];
              const label = getDueLabel(a.dueAt, a.status);
              return (
                <Link
                  key={a.id}
                  href={`/student/tugas/${a.id}`}
                  className="card p-4 cursor-pointer hover:border-brand-teal transition-all active:scale-[0.99] block"
                >
                  <div className="flex gap-2.5 items-start mb-2.5">
                    <div
                      className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                      style={{ background: `${c.bar}22` }}
                    >
                      <SubjIcon size={20} strokeWidth={1.5} style={{ color: c.bar }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-extrabold text-ink leading-snug">{a.title}</div>
                    </div>
                  </div>

                  <div className="flex gap-1.5 flex-wrap mb-2">
                    <Chip variant={a.subject.color === "purple" ? "purple" : a.subject.color as never}>
                      {a.subject.name}
                    </Chip>
                    <span
                      className="chip text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5"
                      style={{ background: due.bg, color: due.color }}
                    >
                      {urgency === "done"
                        ? <><CheckCheck size={10} /> Dinilai</>
                        : <><Clock size={10} /> {label}</>
                      }
                    </span>
                    <Chip variant="teal">{a.type}</Chip>
                    {a.score !== null && (
                      <Chip variant="blue">Nilai: {a.score}</Chip>
                    )}
                  </div>

                  <div className="flex gap-2.5 pt-2 border-t border-surface-soft items-center">
                    <span className="text-[10px] text-ink-muted flex items-center gap-1">
                      <GraduationCap size={11} /> {a.teacher.name}
                    </span>
                    <span className="text-[10px] text-ink-muted flex items-center gap-1">
                      <Paperclip size={11} /> {a.totalItems}
                    </span>
                    <span className="text-[10px] text-ink-muted flex items-center gap-1">
                      <Star size={10} /> Max {a.maxScore}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

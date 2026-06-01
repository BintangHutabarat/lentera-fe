"use client";
import { useEffect, useState } from "react";
import { getSubjects } from "@/lib/services/subjects";
import { PageTopbar } from "@/components/layout/PageTopbar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { subjectColorMap } from "@/lib/utils";
import { subjectIcons } from "@/lib/icons";
import type { Subject } from "@/lib/services/subjects";

export default function PelajaranPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubjects().then(setSubjects).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageTopbar
        title="Mata Pelajaran"
        subtitle={loading ? "Memuat..." : `${subjects.length} Mapel Aktif`}
      />
      <div className="px-3.5 pt-3.5">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
            Memuat...
          </div>
        ) : (
          <div className="card mb-3.5">
            {subjects.map((subj, i) => {
              const c = subjectColorMap[subj.color];
              const SubjIcon = subjectIcons[subj.color];
              return (
                <div
                  key={subj.id}
                  className={`flex gap-3 items-center px-4 py-3 cursor-pointer hover:bg-surface-soft transition-colors active:bg-surface-soft ${
                    i < subjects.length - 1 ? "border-b border-surface-soft" : ""
                  }`}
                >
                  <div
                    className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center flex-shrink-0"
                    style={{ background: `${c.bar}22` }}
                  >
                    <SubjIcon size={22} strokeWidth={1.5} style={{ color: c.bar }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-extrabold text-ink">{subj.name}</div>
                    <div className="text-[11px] text-ink-muted mt-0.5">
                      {subj.teacher.name} • {subj.chaptersTotal} Bab
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 min-w-[60px]">
                    <div className="text-[13px] font-extrabold" style={{ color: c.bar }}>{subj.progress}%</div>
                    <ProgressBar value={subj.progress} height="sm" color={c.bar} className="w-14 mt-1 ml-auto" />
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

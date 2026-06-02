"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageTopbar } from "@/components/layout/PageTopbar";
import { getTeacherClassSubjects } from "@/lib/services/teacher";
import { subjectColorMap } from "@/lib/utils";
import { subjectIcons } from "@/lib/icons";
import type { TeacherClassSubject } from "@/lib/services/teacher";

export default function TeacherKelasPage() {
  const [items, setItems] = useState<TeacherClassSubject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherClassSubjects()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageTopbar title="Kelas Saya" subtitle="Daftar kelas-mapel yang kamu ampu" />
      <div className="px-3.5 pt-3.5">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="card p-6 text-center text-[12px] text-ink-muted">
            Belum ada kelas-mapel yang ditugaskan.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mb-3.5">
            {items.map((cs) => {
              const c = subjectColorMap[cs.subject.color];
              const SubjIcon = subjectIcons[cs.subject.color];
              return (
                <Link
                  key={cs.id}
                  href={`/teacher/kelas/${cs.id}`}
                  className="card p-3.5 flex gap-3 items-center cursor-pointer hover:border-brand-teal transition-all active:scale-[0.99]"
                >
                  <div
                    className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center flex-shrink-0"
                    style={{ background: `${c.bar}22` }}
                  >
                    <SubjIcon size={24} strokeWidth={1.5} style={{ color: c.bar }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-extrabold text-ink truncate">
                      {cs.subject.name}
                    </div>
                    <div className="text-[11px] text-ink-muted mt-0.5">
                      {cs.class.name} • Kelas {cs.class.gradeYear}
                    </div>
                    <div className="flex gap-2 mt-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-light text-blue-dark">
                        {cs.assignmentCount} tugas
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-light text-teal-dark">
                        {cs.quizCount} quiz
                      </span>
                    </div>
                  </div>
                  <div className="text-ink-muted text-sm flex-shrink-0">›</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

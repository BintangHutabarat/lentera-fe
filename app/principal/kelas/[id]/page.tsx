"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, BookOpen, ChevronRight, GraduationCap, Users } from "lucide-react";
import { getPrincipalClassDetail } from "@/lib/services/principal";
import { Avatar } from "@/components/ui/Avatar";
import { subjectColorMap } from "@/lib/utils";
import { subjectIcons } from "@/lib/icons";
import type { PrincipalClassDetail } from "@/lib/services/principal";
import type { SubjectColor } from "@/lib/services/subjects";

export default function PrincipalKelasDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [kelas, setKelas] = useState<PrincipalClassDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrincipalClassDetail(id)
      .then(setKelas)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>;
  }

  if (!kelas) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-[13px] text-ink-muted">
        <p className="mb-3">Data tidak ditemukan.</p>
        <button onClick={() => router.back()} className="text-brand-blue font-bold cursor-pointer">Kembali</button>
      </div>
    );
  }

  return (
    <>
      <header className="bg-surface-card border-b border-border px-3.5 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="text-ink" />
        </button>
        <h3 className="text-[14px] font-extrabold text-ink flex-1 truncate">{kelas.name}</h3>
      </header>

      <div className="px-3.5 pt-3.5 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          <div className="card p-3.5 text-center">
            <Users size={18} className="mx-auto mb-1 text-brand-blue" />
            <div className="text-[18px] font-extrabold text-brand-blue">{kelas.students.length}</div>
            <div className="text-[10px] text-ink-muted">Siswa</div>
          </div>
          <div className="card p-3.5 text-center">
            <BookOpen size={18} className="mx-auto mb-1 text-brand-teal" />
            <div className="text-[18px] font-extrabold text-brand-teal">{kelas.classSubjects.length}</div>
            <div className="text-[10px] text-ink-muted">Mapel</div>
          </div>
        </div>

        {/* Subjects */}
        {kelas.classSubjects.length > 0 && (
          <>
            <h3 className="text-[13px] font-extrabold text-ink mb-2.5 flex items-center gap-1.5">
              <BookOpen size={14} /> Mata Pelajaran
            </h3>
            <div className="card mb-3.5">
              {kelas.classSubjects.map((cs, i) => {
                const c = subjectColorMap[cs.subject.color as SubjectColor];
                const SubjIcon = subjectIcons[cs.subject.color as SubjectColor];
                return (
                  <Link
                    key={cs.id}
                    href={`/principal/kelas/${id}/nilai/${cs.id}`}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-surface-soft transition-colors ${
                      i < kelas.classSubjects.length - 1 ? "border-b border-surface-soft" : ""
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
                      style={{ background: `${c.bar}22` }}
                    >
                      <SubjIcon size={18} strokeWidth={1.5} style={{ color: c.bar }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-bold text-ink truncate">{cs.subject.name}</div>
                      <div className="text-[10px] text-ink-muted mt-0.5">
                        {cs.teacher.name}{cs.teacher.title ? `, ${cs.teacher.title}` : ""}
                      </div>
                    </div>
                    <Award size={13} className="text-ink-muted flex-shrink-0" />
                    <ChevronRight size={13} className="text-ink-muted flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Students */}
        <h3 className="text-[13px] font-extrabold text-ink mb-2.5 flex items-center gap-1.5">
          <Users size={14} /> Daftar Siswa ({kelas.students.length})
        </h3>
        {kelas.students.length === 0 ? (
          <div className="card p-4 text-center text-[12px] text-ink-muted">Belum ada siswa.</div>
        ) : (
          <div className="card mb-3.5">
            {kelas.students.map((s, i) => {
              const initials = s.name.split(" ").slice(0, 2).map((n) => n[0]).join("");
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-2.5 px-4 py-2.5 ${i < kelas.students.length - 1 ? "border-b border-surface-soft" : ""}`}
                >
                  <Avatar initials={initials} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-ink truncate">{s.name}</div>
                    <div className="text-[10px] text-ink-muted">NIS: {s.nis}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[11px] font-extrabold text-brand-blue">Lv {s.level}</div>
                    <div className="text-[10px] text-ink-muted">{s.xp.toLocaleString()} XP</div>
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

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardList, Brain, Users } from "lucide-react";
import {
  getTeacherClassSubjects,
  getClassSubjectStudents,
} from "@/lib/services/teacher";
import { Avatar } from "@/components/ui/Avatar";
import { subjectColorMap } from "@/lib/utils";
import { subjectIcons } from "@/lib/icons";
import type { TeacherClassSubject, TeacherStudent } from "@/lib/services/teacher";

export default function TeacherKelasDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [classSubject, setClassSubject] = useState<TeacherClassSubject | null>(null);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getTeacherClassSubjects(), getClassSubjectStudents(id)])
      .then(([all, studs]) => {
        const found = all.find((cs) => cs.id === id) ?? null;
        if (!found) setError("Kelas-mapel tidak ditemukan.");
        setClassSubject(found);
        setStudents(studs);
      })
      .catch((e) => setError(e?.message ?? "Gagal memuat data."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>
    );
  }

  if (error || !classSubject) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-[13px] text-ink-muted">
        <p className="mb-3">{error ?? "Tidak ada data."}</p>
        <button onClick={() => router.back()} className="text-brand-blue font-bold cursor-pointer">
          Kembali
        </button>
      </div>
    );
  }

  const c = subjectColorMap[classSubject.subject.color];
  const SubjIcon = subjectIcons[classSubject.subject.color];

  return (
    <>
      <header className="bg-surface-card border-b border-border px-3.5 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="text-ink" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-extrabold text-ink truncate">
            {classSubject.subject.name} • {classSubject.class.name}
          </h3>
        </div>
      </header>

      <div className="px-3.5 pt-3.5">
        <div className="card p-4 mb-3.5 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={{ background: `${c.bar}22` }}
          >
            <SubjIcon size={26} strokeWidth={1.5} style={{ color: c.bar }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-extrabold text-ink truncate">
              {classSubject.subject.name}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">
              {classSubject.class.name} • Kelas {classSubject.class.gradeYear}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-3.5">
          <Link
            href={`/teacher/tugas?classSubjectId=${classSubject.id}`}
            className="card p-3 text-center cursor-pointer hover:border-brand-teal transition-all active:scale-95"
          >
            <ClipboardList size={20} className="mx-auto mb-1.5 text-brand-blue" />
            <div className="text-[16px] font-extrabold text-brand-blue">{classSubject.assignmentCount}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">Tugas</div>
          </Link>
          <Link
            href={`/teacher/quiz?classSubjectId=${classSubject.id}`}
            className="card p-3 text-center cursor-pointer hover:border-brand-teal transition-all active:scale-95"
          >
            <Brain size={20} className="mx-auto mb-1.5 text-teal-dark" />
            <div className="text-[16px] font-extrabold text-teal-dark">{classSubject.quizCount}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">Quiz</div>
          </Link>
          <div className="card p-3 text-center">
            <Users size={20} className="mx-auto mb-1.5 text-yellow-dark" />
            <div className="text-[16px] font-extrabold text-yellow-dark">{students.length}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">Siswa</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          <Link
            href={`/teacher/tugas/buat?classSubjectId=${classSubject.id}`}
            className="card p-3.5 text-center cursor-pointer hover:border-brand-teal transition-all active:scale-95"
          >
            <ClipboardList size={18} className="mx-auto mb-1.5 text-brand-blue" />
            <div className="text-[11px] font-extrabold text-ink">Buat Tugas</div>
          </Link>
          <Link
            href={`/teacher/quiz/buat?classSubjectId=${classSubject.id}`}
            className="card p-3.5 text-center cursor-pointer hover:border-brand-teal transition-all active:scale-95"
          >
            <Brain size={18} className="mx-auto mb-1.5 text-teal-dark" />
            <div className="text-[11px] font-extrabold text-ink">Buat Quiz</div>
          </Link>
        </div>

        <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Daftar Siswa ({students.length})</h3>
        {students.length === 0 ? (
          <div className="card p-4 text-center text-[12px] text-ink-muted">
            Belum ada siswa di kelas ini.
          </div>
        ) : (
          <div className="card mb-3.5">
            {students.map((s, i) => {
              const initials = s.name.split(" ").slice(0, 2).map((n) => n[0]).join("");
              return (
                <div
                  key={s.id}
                  className={`flex gap-2.5 items-center px-4 py-2.5 ${
                    i < students.length - 1 ? "border-b border-surface-soft" : ""
                  }`}
                >
                  <Avatar initials={initials} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-ink truncate">{s.name}</div>
                    <div className="text-[10px] text-ink-muted mt-0.5">NIS: {s.nis}</div>
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

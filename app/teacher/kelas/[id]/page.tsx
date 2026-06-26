"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, Bell, BookOpen, Brain, CalendarCheck, ChevronRight, ClipboardList, Loader2, ScrollText, Users, X } from "lucide-react";
import {
  getTeacherClassSubjects,
  getClassSubjectStudents,
  announceToClass,
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

  // Announce modal
  const [announcing, setAnnouncing] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceBody, setAnnounceBody] = useState("");
  const [sendingAnnounce, setSendingAnnounce] = useState(false);

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

  const handleAnnounce = async () => {
    if (!announceTitle.trim() || !announceBody.trim() || sendingAnnounce) return;
    setSendingAnnounce(true);
    try {
      await announceToClass(id, { title: announceTitle.trim(), body: announceBody.trim() });
      setAnnouncing(false);
      setAnnounceTitle("");
      setAnnounceBody("");
    } catch {
      /* silent */
    }
    setSendingAnnounce(false);
  };

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

        <div className="grid grid-cols-3 gap-2.5 mb-2.5">
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
          <Link
            href={`/teacher/kelas/${classSubject.id}/materi`}
            className="card p-3.5 text-center cursor-pointer hover:border-brand-teal transition-all active:scale-95"
          >
            <BookOpen size={18} className="mx-auto mb-1.5 text-brand-teal" />
            <div className="text-[11px] font-extrabold text-ink">Materi</div>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2.5 mb-3.5">
          <Link
            href={`/teacher/kelas/${classSubject.id}/pertemuan`}
            className="card p-3.5 text-center cursor-pointer hover:border-brand-teal transition-all active:scale-95"
          >
            <CalendarCheck size={18} className="mx-auto mb-1.5 text-brand-blue" />
            <div className="text-[11px] font-extrabold text-ink">Absensi</div>
          </Link>
          <Link
            href={`/teacher/kelas/${classSubject.id}/ujian`}
            className="card p-3.5 text-center cursor-pointer hover:border-brand-teal transition-all active:scale-95"
          >
            <ScrollText size={18} className="mx-auto mb-1.5 text-yellow-dark" />
            <div className="text-[11px] font-extrabold text-ink">Ujian</div>
          </Link>
          <Link
            href={`/teacher/kelas/${classSubject.id}/nilai-akhir`}
            className="card p-3.5 text-center cursor-pointer hover:border-brand-teal transition-all active:scale-95"
          >
            <Award size={18} className="mx-auto mb-1.5 text-brand-teal" />
            <div className="text-[11px] font-extrabold text-ink">Nilai Akhir</div>
          </Link>
          <button
            onClick={() => setAnnouncing(true)}
            className="card p-3.5 text-center cursor-pointer hover:border-brand-teal transition-all active:scale-95 col-span-3"
          >
            <Bell size={18} className="mx-auto mb-1.5 text-yellow-dark" />
            <div className="text-[11px] font-extrabold text-ink">Umumkan</div>
          </button>
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
                <Link
                  key={s.id}
                  href={`/teacher/kelas/${id}/${s.id}`}
                  className={`flex gap-2.5 items-center px-4 py-2.5 hover:bg-surface-soft transition-colors cursor-pointer ${
                    i < students.length - 1 ? "border-b border-surface-soft" : ""
                  }`}
                >
                  <Avatar initials={initials} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-ink truncate">{s.name}</div>
                    <div className="text-[10px] text-ink-muted mt-0.5">NIS: {s.nis}</div>
                  </div>
                  <div className="text-right flex-shrink-0 flex items-center gap-2">
                    <div>
                      <div className="text-[11px] font-extrabold text-brand-blue">Lv {s.level}</div>
                      <div className="text-[10px] text-ink-muted">{s.xp.toLocaleString()} XP</div>
                    </div>
                    <ChevronRight size={13} className="text-ink-muted" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Announce modal */}
      {announcing && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end" onClick={() => setAnnouncing(false)}>
          <div
            className="w-full bg-surface-card rounded-t-[20px] p-5 flex flex-col gap-3.5"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-extrabold text-ink">Kirim Pengumuman</h3>
              <button onClick={() => setAnnouncing(false)} className="w-7 h-7 rounded-full bg-surface-soft flex items-center justify-center cursor-pointer">
                <X size={14} className="text-ink-muted" />
              </button>
            </div>
            <input
              autoFocus
              value={announceTitle}
              onChange={(e) => setAnnounceTitle(e.target.value)}
              placeholder="Judul pengumuman"
              className="w-full h-11 rounded-[10px] border border-border bg-surface-soft px-3.5 text-[13px] text-ink outline-none focus:border-brand-blue"
            />
            <textarea
              value={announceBody}
              onChange={(e) => setAnnounceBody(e.target.value)}
              placeholder="Isi pengumuman..."
              rows={3}
              className="w-full resize-none bg-surface-soft rounded-[10px] px-3.5 py-3 text-[13px] text-ink placeholder:text-ink-muted outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all leading-relaxed"
            />
            <button
              onClick={handleAnnounce}
              disabled={!announceTitle.trim() || !announceBody.trim() || sendingAnnounce}
              className="h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              {sendingAnnounce ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
              {sendingAnnounce ? "Mengirim..." : "Kirim ke Semua Siswa"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

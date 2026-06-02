"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Users, BookMarked, Plus, Trash2 } from "lucide-react";
import {
  getAdminClasses,
  getAdminUsers,
  getAdminClassSubjects,
  deleteClassSubject,
  deleteClass,
} from "@/lib/services/admin";
import { subjectColorMap } from "@/lib/utils";
import { isApiError } from "@/lib/api";
import type { AdminClass, AdminUser, AdminClassSubject } from "@/lib/services/admin";

export default function AdminKelasDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cls, setCls] = useState<AdminClass | null>(null);
  const [students, setStudents] = useState<AdminUser[]>([]);
  const [classSubjects, setClassSubjects] = useState<AdminClassSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      getAdminClasses(),
      getAdminUsers({ role: "STUDENT", classId: id }),
      getAdminClassSubjects({ classId: id }),
    ])
      .then(([classes, studs, cs]) => {
        setCls(classes.find((c) => c.id === id) ?? null);
        setStudents(studs);
        setClassSubjects(cs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleDeleteClassSubject = async (csId: string) => {
    if (!confirm("Hapus penugasan mapel ini?")) return;
    try {
      await deleteClassSubject(csId);
      setClassSubjects((prev) => prev.filter((cs) => cs.id !== csId));
    } catch (e) {
      const msg = isApiError(e) && e.code === "CLASS_SUBJECT_IN_USE"
        ? "Tidak bisa dihapus: masih ada tugas atau quiz di dalamnya."
        : "Gagal menghapus penugasan.";
      setError(msg);
    }
  };

  const handleDeleteClass = async () => {
    if (!confirm(`Hapus kelas "${cls?.name}"? Semua data terkait akan dihapus.`)) return;
    try {
      await deleteClass(id);
      router.push("/admin/kelas");
    } catch (e) {
      const msg = isApiError(e) && e.code === "CLASS_HAS_STUDENTS"
        ? "Tidak bisa dihapus: masih ada siswa di kelas ini."
        : "Gagal menghapus kelas.";
      setError(msg);
    }
  };

  const initials = (name: string) => name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>;
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
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-extrabold text-ink">{cls?.name ?? "Kelas"}</h3>
          <p className="text-[11px] text-ink-muted">Tingkat {cls?.gradeYear}</p>
        </div>
      </header>

      <div className="px-3.5 pt-3.5 pb-24 flex flex-col gap-3.5">
        {error && (
          <div className="text-[12px] text-red-dark bg-red-light rounded-[10px] px-3 py-2">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: students.length, label: "Siswa", Icon: Users, color: "#3DD6B5", bg: "#E3FBF5" },
            { val: classSubjects.length, label: "Mapel", Icon: BookMarked, color: "#7a5cf1", bg: "#EDF3FF" },
            { val: cls?.gradeYear ?? "—", label: "Tingkat", Icon: BookOpen, color: "#F5C518", bg: "#FEF9E7" },
          ].map(({ val, label, Icon, color, bg }) => (
            <div key={label} className="card p-3 text-center">
              <div
                className="w-8 h-8 rounded-[8px] flex items-center justify-center mx-auto mb-1.5"
                style={{ background: bg }}
              >
                <Icon size={15} style={{ color }} />
              </div>
              <div className="text-[18px] font-extrabold text-ink">{val}</div>
              <div className="text-[10px] text-ink-muted">{label}</div>
            </div>
          ))}
        </div>

        {/* Mapel section */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[14px] font-extrabold text-ink">Mapel & Guru</h3>
            <Link
              href={`/admin/penugasan/buat?classId=${id}`}
              className="text-[12px] font-bold text-brand-blue flex items-center gap-1"
            >
              <Plus size={13} /> Tambah
            </Link>
          </div>
          {classSubjects.length === 0 ? (
            <div className="card p-4 text-center text-[13px] text-ink-muted">Belum ada mapel ditugaskan.</div>
          ) : (
            <div className="card">
              {classSubjects.map((cs, i) => {
                const colorKey = cs.subject.color.toLowerCase() as keyof typeof subjectColorMap;
                const colors = subjectColorMap[colorKey] ?? subjectColorMap.blue;
                return (
                  <div
                    key={cs.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i < classSubjects.length - 1 ? "border-b border-surface-soft" : ""
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                      <BookMarked size={16} className={colors.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-extrabold text-ink">{cs.subject.name}</div>
                      <div className="text-[11px] text-ink-muted mt-0.5">{cs.teacher.name}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteClassSubject(cs.id)}
                      className="w-8 h-8 rounded-[8px] flex items-center justify-center text-ink-muted hover:text-red-dark hover:bg-red-light transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Students section */}
        <div>
          <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Daftar Siswa ({students.length})</h3>
          {students.length === 0 ? (
            <div className="card p-4 text-center text-[13px] text-ink-muted">Belum ada siswa di kelas ini.</div>
          ) : (
            <div className="card">
              {students.map((s, i) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i < students.length - 1 ? "border-b border-surface-soft" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-[11px] font-extrabold text-teal-dark flex-shrink-0">
                    {initials(s.profile.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-extrabold text-ink truncate">{s.profile.name}</div>
                    <div className="text-[11px] text-ink-muted">NIS {s.profile.nis ?? "—"}</div>
                  </div>
                  {!s.isActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-light text-red-dark">Nonaktif</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete class */}
        <button
          onClick={handleDeleteClass}
          className="h-11 rounded-[12px] border border-red-dark/30 text-red-dark text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-red-light transition-colors"
        >
          <Trash2 size={14} />
          Hapus Kelas
        </button>
      </div>
    </>
  );
}

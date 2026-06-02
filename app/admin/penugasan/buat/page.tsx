"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  getAdminClasses,
  getAdminSubjects,
  getAdminUsers,
  createClassSubject,
} from "@/lib/services/admin";
import { isApiError } from "@/lib/api";
import type { AdminClass, AdminSubject, AdminUser } from "@/lib/services/admin";

function AdminBuatPenugasanContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initialClassId = params.get("classId") ?? "";

  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [teachers, setTeachers] = useState<AdminUser[]>([]);

  const [classId, setClassId] = useState(initialClassId);
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getAdminClasses(),
      getAdminSubjects(),
      getAdminUsers({ role: "TEACHER" }),
    ])
      .then(([cls, subs, teachers]) => {
        setClasses(cls);
        setSubjects(subs);
        setTeachers(teachers.filter((t) => t.isActive));
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!classId || !subjectId || !teacherId) {
      setError("Kelas, mapel, dan guru wajib dipilih.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createClassSubject({ classId, subjectId, teacherId });
      router.push(`/admin/kelas/${classId}`);
    } catch (e) {
      const codeMap: Record<string, string> = {
        CLASS_SUBJECT_EXISTS: "Mapel sudah ditugaskan di kelas ini.",
        CLASS_NOT_FOUND: "Kelas tidak ditemukan.",
        SUBJECT_NOT_FOUND: "Mapel tidak ditemukan.",
        TEACHER_NOT_FOUND: "Guru tidak ditemukan.",
      };
      setError(isApiError(e) ? (codeMap[e.code] ?? e.message) : "Gagal menambah penugasan.");
    }
    setSubmitting(false);
  };

  const selectedClass = classes.find((c) => c.id === classId);

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
          <h3 className="text-[14px] font-extrabold text-ink">Tambah Mapel ke Kelas</h3>
          {selectedClass && (
            <p className="text-[11px] text-ink-muted">{selectedClass.name}</p>
          )}
        </div>
      </header>

      <div className="px-3.5 pt-3.5 pb-24 flex flex-col gap-3">
        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Kelas *</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue cursor-pointer"
          >
            <option value="">Pilih kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Mata Pelajaran *</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue cursor-pointer"
          >
            <option value="">Pilih mapel</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.shortName})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Guru Pengampu *</label>
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue cursor-pointer"
          >
            <option value="">Pilih guru</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.profile.name}
                {t.profile.title ? `, ${t.profile.title}` : ""}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="text-[12px] text-red-dark bg-red-light rounded-[10px] px-3 py-2">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed mt-1"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Menyimpan..." : "Tambah Penugasan"}
        </button>
      </div>
    </>
  );
}

export default function AdminBuatPenugasanPage() {
  return (
    <Suspense>
      <AdminBuatPenugasanContent />
    </Suspense>
  );
}

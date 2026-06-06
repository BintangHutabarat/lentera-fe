"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, Users, BookMarked, Plus, Trash2, Pencil,
  Check, X, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  getAdminClassDetail,
  updateClass,
  deleteClass,
  deleteClassSubject,
  updateClassSubject,
  getAdminUsers,
  getAdminClassSubjectAssignments,
  deleteAdminAssignment,
  getAdminClassSubjectQuizzes,
  deleteAdminQuiz,
} from "@/lib/services/admin";
import { subjectColorMap } from "@/lib/utils";
import { isApiError } from "@/lib/api";
import type {
  AdminClassDetail,
  AdminUser,
  AdminAssignmentItem,
  AdminQuizItem,
} from "@/lib/services/admin";

export default function AdminKelasDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [detail, setDetail] = useState<AdminClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inline class edit
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editGradeYear, setEditGradeYear] = useState(10);
  const [saving, setSaving] = useState(false);

  // CS expanded content panel
  const [expandedCsId, setExpandedCsId] = useState<string | null>(null);
  const [csAssignments, setCsAssignments] = useState<AdminAssignmentItem[]>([]);
  const [csQuizzes, setCsQuizzes] = useState<AdminQuizItem[]>([]);
  const [csContentLoading, setCsContentLoading] = useState(false);

  // CS change teacher
  const [editingCsId, setEditingCsId] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<AdminUser[]>([]);
  const [newTeacherId, setNewTeacherId] = useState("");
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAdminClassDetail(id)
      .then((d) => {
        setDetail(d);
        setEditName(d.name);
        setEditGradeYear(d.gradeYear);
      })
      .catch(() => setError("Gagal memuat data kelas."))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleExpand = async (csId: string) => {
    if (expandedCsId === csId) {
      setExpandedCsId(null);
      return;
    }
    setCsAssignments([]);
    setCsQuizzes([]);
    setExpandedCsId(csId);
    setCsContentLoading(true);
    try {
      const [assignments, quizzes] = await Promise.all([
        getAdminClassSubjectAssignments(csId),
        getAdminClassSubjectQuizzes(csId),
      ]);
      setCsAssignments(assignments);
      setCsQuizzes(quizzes);
    } catch {
      // ignore
    } finally {
      setCsContentLoading(false);
    }
  };

  const handleSaveClass = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      await updateClass(id, { name: editName.trim(), gradeYear: editGradeYear });
      setDetail((d) => d ? { ...d, name: editName.trim(), gradeYear: editGradeYear } : d);
      setEditMode(false);
    } catch {
      setError("Gagal menyimpan perubahan kelas.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClassSubject = async (csId: string) => {
    if (!confirm("Hapus penugasan mapel ini?")) return;
    try {
      await deleteClassSubject(csId);
      setDetail((d) => d ? { ...d, classSubjects: d.classSubjects.filter((cs) => cs.id !== csId) } : d);
      if (expandedCsId === csId) setExpandedCsId(null);
    } catch (e) {
      if (isApiError(e) && e.code === "CLASS_SUBJECT_IN_USE") {
        setError("Hapus semua tugas dan quiz terlebih dahulu sebelum menghapus penugasan ini.");
        toggleExpand(csId);
      } else {
        setError("Gagal menghapus penugasan.");
      }
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm("Hapus tugas beserta semua data pengumpulan siswa?")) return;
    try {
      await deleteAdminAssignment(assignmentId);
      setCsAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch {
      setError("Gagal menghapus tugas.");
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Hapus quiz beserta semua sesi pengerjaan siswa?")) return;
    try {
      await deleteAdminQuiz(quizId);
      setCsQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch {
      setError("Gagal menghapus quiz.");
    }
  };

  const handleOpenChangeTeacher = async (csId: string, currentUserId: string) => {
    setEditingCsId(csId);
    setNewTeacherId(currentUserId);
    if (teachers.length === 0) {
      setLoadingTeachers(true);
      try {
        const list = await getAdminUsers({ role: "TEACHER" });
        setTeachers(list);
      } catch {
        // ignore
      } finally {
        setLoadingTeachers(false);
      }
    }
  };

  const handleSaveTeacher = async (csId: string) => {
    if (!newTeacherId) return;
    try {
      await updateClassSubject(csId, { teacherId: newTeacherId });
      const teacher = teachers.find((t) => t.id === newTeacherId);
      if (teacher) {
        setDetail((d) =>
          d
            ? {
                ...d,
                classSubjects: d.classSubjects.map((cs) =>
                  cs.id === csId
                    ? { ...cs, teacher: { userId: teacher.id, name: teacher.profile.name, title: teacher.profile.title ?? null } }
                    : cs
                ),
              }
            : d
        );
      }
      setEditingCsId(null);
    } catch {
      setError("Gagal mengganti guru.");
    }
  };

  const handleDeleteClass = async () => {
    if (!confirm(`Hapus kelas "${detail?.name}"? Semua data terkait akan dihapus.`)) return;
    try {
      await deleteClass(id);
      router.push("/admin/kelas");
    } catch (e) {
      const msg =
        isApiError(e) && e.code === "CLASS_HAS_STUDENTS"
          ? "Tidak bisa dihapus: kelas masih memiliki siswa."
          : "Gagal menghapus kelas.";
      setError(msg);
    }
  };

  const initials = (name: string) =>
    name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>;
  }

  if (!detail) {
    return <div className="px-4 py-10 text-center text-[13px] text-ink-muted">Kelas tidak ditemukan.</div>;
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
          <h3 className="text-[14px] font-extrabold text-ink">{detail.name}</h3>
          <p className="text-[11px] text-ink-muted">Tingkat {detail.gradeYear}</p>
        </div>
        <button
          onClick={() => { setEditMode((v) => !v); setEditName(detail.name); setEditGradeYear(detail.gradeYear); }}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer"
        >
          <Pencil size={16} className="text-ink-muted" />
        </button>
      </header>

      <div className="px-3.5 pt-3.5 pb-24 flex flex-col gap-3.5">
        {error && (
          <div className="text-[12px] text-red-dark bg-red-light rounded-[10px] px-3 py-2 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold ml-2 flex-shrink-0">×</button>
          </div>
        )}

        {/* Edit class */}
        {editMode && (
          <div className="card p-4 flex flex-col gap-3">
            <p className="text-[13px] font-bold text-ink">Edit Kelas</p>
            <div>
              <label className="text-[11px] text-ink-muted mb-1 block">Nama Kelas</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full h-10 rounded-[10px] border border-border bg-surface-soft px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
              />
            </div>
            <div>
              <label className="text-[11px] text-ink-muted mb-1 block">Tingkat</label>
              <select
                value={editGradeYear}
                onChange={(e) => setEditGradeYear(Number(e.target.value))}
                className="w-full h-10 rounded-[10px] border border-border bg-surface-soft px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
              >
                <option value={10}>10</option>
                <option value={11}>11</option>
                <option value={12}>12</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveClass}
                disabled={saving}
                className="flex-1 h-10 rounded-[10px] bg-brand-blue text-white text-[13px] font-bold disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="h-10 px-4 rounded-[10px] border border-border text-[13px] font-bold text-ink-muted cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: detail.students.length, label: "Siswa", Icon: Users, color: "#3DD6B5", bg: "#E3FBF5" },
            { val: detail.classSubjects.length, label: "Mapel", Icon: BookMarked, color: "#7a5cf1", bg: "#EDF3FF" },
            { val: detail.gradeYear, label: "Tingkat", Icon: BookOpen, color: "#F5C518", bg: "#FEF9E7" },
          ].map(({ val, label, Icon, color, bg }) => (
            <div key={label} className="card p-3 text-center">
              <div className="w-8 h-8 rounded-[8px] flex items-center justify-center mx-auto mb-1.5" style={{ background: bg }}>
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
          {detail.classSubjects.length === 0 ? (
            <div className="card p-4 text-center text-[13px] text-ink-muted">Belum ada mapel ditugaskan.</div>
          ) : (
            <div className="card">
              {detail.classSubjects.map((cs, i) => {
                const colorKey = cs.subject.color.toLowerCase() as keyof typeof subjectColorMap;
                const colors = subjectColorMap[colorKey] ?? subjectColorMap.blue;
                const isExpanded = expandedCsId === cs.id;
                const isEditingTeacher = editingCsId === cs.id;

                return (
                  <div key={cs.id} className={i < detail.classSubjects.length - 1 ? "border-b border-surface-soft" : ""}>
                    {/* Row */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                        <BookMarked size={16} className={colors.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-extrabold text-ink">{cs.subject.name}</div>
                        <div className="text-[11px] text-ink-muted mt-0.5">
                          {cs.teacher.name}{cs.teacher.title ? `, ${cs.teacher.title}` : ""}
                        </div>
                        <div className="text-[10px] text-ink-muted mt-0.5">
                          {cs.assignmentCount} tugas · {cs.quizCount} quiz
                        </div>
                      </div>
                      <button
                        onClick={() => toggleExpand(cs.id)}
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center text-ink-muted hover:bg-surface-soft transition-colors cursor-pointer"
                        title="Kelola konten"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <button
                        onClick={() => handleDeleteClassSubject(cs.id)}
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center text-ink-muted hover:text-red-dark hover:bg-red-light transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Expanded panel */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-surface-soft pt-3 flex flex-col gap-3">
                        {/* Change teacher */}
                        {isEditingTeacher ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={newTeacherId}
                              onChange={(e) => setNewTeacherId(e.target.value)}
                              className="flex-1 h-9 rounded-[10px] border border-border bg-surface-soft px-2 text-[12px] text-ink outline-none"
                            >
                              {loadingTeachers ? (
                                <option>Memuat...</option>
                              ) : (
                                teachers.map((t) => (
                                  <option key={t.id} value={t.id}>{t.profile.name}</option>
                                ))
                              )}
                            </select>
                            <button
                              onClick={() => handleSaveTeacher(cs.id)}
                              className="w-8 h-8 rounded-[8px] bg-brand-blue flex items-center justify-center cursor-pointer"
                            >
                              <Check size={14} className="text-white" />
                            </button>
                            <button
                              onClick={() => setEditingCsId(null)}
                              className="w-8 h-8 rounded-[8px] border border-border flex items-center justify-center cursor-pointer"
                            >
                              <X size={14} className="text-ink-muted" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenChangeTeacher(cs.id, cs.teacher.userId)}
                            className="text-[11px] text-brand-blue font-semibold self-start cursor-pointer"
                          >
                            Ganti Guru
                          </button>
                        )}

                        {/* Assignments */}
                        {csContentLoading ? (
                          <div className="text-[12px] text-ink-muted">Memuat konten...</div>
                        ) : (
                          <>
                            <div>
                              <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wide mb-1.5">
                                Tugas ({csAssignments.length})
                              </p>
                              {csAssignments.length === 0 ? (
                                <p className="text-[12px] text-ink-muted">Tidak ada tugas.</p>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  {csAssignments.map((a) => (
                                    <div key={a.id} className="flex items-center gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="text-[12px] font-semibold text-ink truncate">{a.title}</div>
                                        <div className="text-[10px] text-ink-muted">{a.submissionCount} pengumpulan</div>
                                      </div>
                                      <button
                                        onClick={() => handleDeleteAssignment(a.id)}
                                        className="w-7 h-7 rounded-[6px] flex items-center justify-center text-ink-muted hover:text-red-dark hover:bg-red-light transition-colors cursor-pointer flex-shrink-0"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wide mb-1.5">
                                Quiz ({csQuizzes.length})
                              </p>
                              {csQuizzes.length === 0 ? (
                                <p className="text-[12px] text-ink-muted">Tidak ada quiz.</p>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  {csQuizzes.map((q) => (
                                    <div key={q.id} className="flex items-center gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="text-[12px] font-semibold text-ink truncate">{q.title}</div>
                                        <div className="text-[10px] text-ink-muted">{q.sessionCount} sesi pengerjaan</div>
                                      </div>
                                      <button
                                        onClick={() => handleDeleteQuiz(q.id)}
                                        className="w-7 h-7 rounded-[6px] flex items-center justify-center text-ink-muted hover:text-red-dark hover:bg-red-light transition-colors cursor-pointer flex-shrink-0"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Students section */}
        <div>
          <h3 className="text-[14px] font-extrabold text-ink mb-2.5">
            Daftar Siswa ({detail.students.length})
          </h3>
          {detail.students.length === 0 ? (
            <div className="card p-4 text-center text-[13px] text-ink-muted">Belum ada siswa di kelas ini.</div>
          ) : (
            <div className="card">
              {detail.students.map((s, i) => (
                <Link
                  key={s.id}
                  href={`/admin/siswa/${s.id}`}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-surface-soft transition-colors ${
                    i < detail.students.length - 1 ? "border-b border-surface-soft" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-[11px] font-extrabold text-teal-dark flex-shrink-0">
                    {initials(s.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-extrabold text-ink truncate">{s.name}</div>
                    <div className="text-[11px] text-ink-muted">NIS {s.nis}</div>
                  </div>
                  {!s.isActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-light text-red-dark">Nonaktif</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Danger */}
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

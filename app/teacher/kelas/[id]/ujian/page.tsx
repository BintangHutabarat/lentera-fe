"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ChevronRight, ClipboardList, Loader2,
  Plus, Trash2, X,
} from "lucide-react";
import {
  getExams,
  createExam,
  deleteExam,
  getTeacherClassSubjects,
} from "@/lib/services/teacher";
import type { TeacherExam } from "@/lib/services/teacher";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export default function TeacherUjianPage() {
  const { id: classSubjectId } = useParams<{ id: string }>();
  const router = useRouter();

  const [exams, setExams] = useState<TeacherExam[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getExams(classSubjectId), getTeacherClassSubjects()])
      .then(([ex, subjects]) => {
        setExams(ex);
        const cs = subjects.find((s) => s.id === classSubjectId);
        if (cs) setSubjectName(`${cs.subject.name} · ${cs.class.name}`);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [classSubjectId]);

  const handleCreate = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const payload: { title: string; description?: string; maxScore?: number; date?: string } = {
        title: title.trim(),
      };
      if (desc.trim()) payload.description = desc.trim();
      if (maxScore) payload.maxScore = Number(maxScore);
      if (date) payload.date = date;
      const res = await createExam(classSubjectId, payload);
      const newExam: TeacherExam = {
        id: res.id,
        title: title.trim(),
        description: desc.trim() || null,
        maxScore: Number(maxScore) || 100,
        date: date || null,
        gradedCount: 0,
        createdAt: new Date().toISOString(),
      };
      setExams((prev) => [newExam, ...prev]);
      setTitle(""); setDesc(""); setMaxScore("100"); setDate("");
      setCreating(false);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "Gagal menyimpan.");
    }
    setSaving(false);
  };

  const handleDelete = async (exam: TeacherExam) => {
    if (!confirm(`Hapus ujian "${exam.title}"?`)) return;
    setDeletingId(exam.id);
    try {
      await deleteExam(exam.id);
      setExams((prev) => prev.filter((e) => e.id !== exam.id));
    } catch {
      /* silent */
    }
    setDeletingId(null);
  };

  const openCreate = () => {
    setTitle(""); setDesc(""); setMaxScore("100"); setDate(""); setError(null);
    setCreating(true);
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
          <h3 className="text-[14px] font-extrabold text-ink">Ujian</h3>
          {subjectName && <p className="text-[11px] text-ink-muted truncate">{subjectName}</p>}
        </div>
        <button
          onClick={openCreate}
          className="w-9 h-9 rounded-[10px] bg-brand-blue flex items-center justify-center cursor-pointer"
        >
          <Plus size={18} className="text-white" />
        </button>
      </header>

      <div className="px-3.5 pt-3.5 pb-24">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-soft flex items-center justify-center mb-3">
              <ClipboardList size={20} className="text-ink-muted" />
            </div>
            <p className="text-[13px] font-bold text-ink">Belum ada ujian</p>
            <p className="text-[11px] text-ink-muted mt-1">Tambah ujian baru dengan tombol + di atas.</p>
          </div>
        ) : (
          <div className="card">
            {exams.map((exam, i) => (
              <div
                key={exam.id}
                className={`flex items-center gap-3 px-4 py-3 ${i < exams.length - 1 ? "border-b border-surface-soft" : ""}`}
              >
                <Link
                  href={`/teacher/kelas/${classSubjectId}/ujian/${exam.id}`}
                  className="flex-1 min-w-0 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-[10px] bg-surface-soft flex items-center justify-center flex-shrink-0">
                    <ClipboardList size={16} className="text-brand-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-ink truncate">{exam.title}</div>
                    <div className="text-[10px] text-ink-muted mt-0.5">
                      {formatDate(exam.date)} · Max {exam.maxScore} · {exam.gradedCount} dinilai
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-ink-muted flex-shrink-0" />
                </Link>
                <button
                  onClick={() => handleDelete(exam)}
                  disabled={deletingId === exam.id}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-ink-muted hover:text-red-dark hover:bg-red-light transition-colors cursor-pointer ml-1 flex-shrink-0"
                >
                  {deletingId === exam.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end" onClick={() => setCreating(false)}>
          <div
            className="w-full bg-surface-card rounded-t-[20px] p-5 flex flex-col gap-3.5"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-extrabold text-ink">Buat Ujian</h3>
              <button onClick={() => setCreating(false)} className="w-7 h-7 rounded-full bg-surface-soft flex items-center justify-center cursor-pointer">
                <X size={14} className="text-ink-muted" />
              </button>
            </div>

            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul ujian, contoh: Ujian Tengah Semester"
              className="w-full h-11 rounded-[10px] border border-border bg-surface-soft px-3.5 text-[13px] text-ink outline-none focus:border-brand-blue transition-colors"
            />
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Deskripsi (opsional)"
              className="w-full h-11 rounded-[10px] border border-border bg-surface-soft px-3.5 text-[13px] text-ink outline-none focus:border-brand-blue transition-colors"
            />
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-ink-muted mb-1">Nilai Maksimal</label>
                <input
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  className="w-full h-10 rounded-[10px] border border-border bg-surface-soft px-3 text-[13px] text-ink outline-none focus:border-brand-blue transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-ink-muted mb-1">Tanggal Ujian</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-10 rounded-[10px] border border-border bg-surface-soft px-3 text-[13px] text-ink outline-none focus:border-brand-blue transition-colors"
                />
              </div>
            </div>

            {error && <p className="text-[11px] text-red-dark font-bold">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={!title.trim() || saving}
              className="h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {saving ? "Menyimpan..." : "Buat Ujian"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

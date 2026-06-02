"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { getTeacherClassSubjects, createAssignment } from "@/lib/services/teacher";
import { isApiError } from "@/lib/api";
import type { TeacherClassSubject } from "@/lib/services/teacher";
import type { AssignmentType } from "@/lib/services/assignments";

interface RubricItem {
  label: string;
  max: number;
}

export default function TeacherBuatTugasPage() {
  return (
    <Suspense>
      <TeacherBuatTugasContent />
    </Suspense>
  );
}

function TeacherBuatTugasContent() {
  const router = useRouter();
  const search = useSearchParams();
  const [classSubjects, setClassSubjects] = useState<TeacherClassSubject[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [classSubjectId, setClassSubjectId] = useState(search.get("classSubjectId") ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [type, setType] = useState<AssignmentType>("UPLOAD_FILE");
  const [maxScore, setMaxScore] = useState(100);
  const [minWords, setMinWords] = useState<string>("");
  const [totalItems, setTotalItems] = useState<string>("");
  const [dueAt, setDueAt] = useState("");
  const [rubric, setRubric] = useState<RubricItem[]>([]);

  useEffect(() => {
    getTeacherClassSubjects().then(setClassSubjects).catch(() => {});
  }, []);

  const addInstruction = () => setInstructions((arr) => [...arr, ""]);
  const updateInstruction = (i: number, v: string) =>
    setInstructions((arr) => arr.map((x, idx) => (idx === i ? v : x)));
  const removeInstruction = (i: number) =>
    setInstructions((arr) => arr.filter((_, idx) => idx !== i));

  const addRubric = () => setRubric((r) => [...r, { label: "", max: 0 }]);
  const updateRubric = (i: number, key: keyof RubricItem, value: string) =>
    setRubric((r) =>
      r.map((item, idx) =>
        idx === i ? { ...item, [key]: key === "max" ? Number(value) : value } : item,
      ),
    );
  const removeRubric = (i: number) => setRubric((r) => r.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!classSubjectId || !title.trim() || !dueAt) {
      setError("Mohon lengkapi kelas-mapel, judul, dan deadline.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await createAssignment({
        classSubjectId,
        title: title.trim(),
        description: description.trim(),
        instructions: instructions.map((x) => x.trim()).filter(Boolean),
        type,
        maxScore,
        totalItems: totalItems.trim() || null,
        minWords: type === "ESSAY" && minWords ? Number(minWords) : null,
        rubric: rubric.filter((r) => r.label && r.max > 0),
        dueAt: new Date(dueAt).toISOString(),
      });
      router.push(`/teacher/tugas/${res.id}`);
    } catch (e) {
      setError(isApiError(e) ? e.message : "Gagal membuat tugas.");
    }
    setSubmitting(false);
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
          <h3 className="text-[14px] font-extrabold text-ink">Buat Tugas</h3>
        </div>
      </header>

      <div className="px-3.5 pt-3.5 pb-24 flex flex-col gap-3.5">
        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Kelas-Mapel *</label>
          <select
            value={classSubjectId}
            onChange={(e) => setClassSubjectId(e.target.value)}
            className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue transition-all cursor-pointer"
          >
            <option value="">Pilih kelas-mapel</option>
            {classSubjects.map((cs) => (
              <option key={cs.id} value={cs.id}>
                {cs.subject.name} • {cs.class.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Judul *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="contoh: Latihan Soal Turunan"
            className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Deskripsi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Penjelasan singkat tentang tugas..."
            className="w-full rounded-[10px] border border-border bg-surface-card px-3 py-2.5 text-[13px] text-ink outline-none focus:border-brand-blue transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-extrabold text-ink mb-1.5">Tipe *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AssignmentType)}
              className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue cursor-pointer"
            >
              <option value="UPLOAD_FILE">Upload File</option>
              <option value="ESSAY">Esai</option>
              <option value="ONLINE">Online (pilihan ganda)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-ink mb-1.5">Nilai Maks *</label>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        {type === "ESSAY" && (
          <div>
            <label className="block text-[11px] font-extrabold text-ink mb-1.5">Minimum Kata (opsional)</label>
            <input
              type="number"
              value={minWords}
              onChange={(e) => setMinWords(e.target.value)}
              placeholder="200"
              className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
            />
          </div>
        )}

        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Total Item (opsional)</label>
          <input
            value={totalItems}
            onChange={(e) => setTotalItems(e.target.value)}
            placeholder="contoh: 10 soal"
            className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
          />
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Deadline *</label>
          <input
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-extrabold text-ink">Instruksi</label>
            <button
              type="button"
              onClick={addInstruction}
              className="text-[11px] font-bold text-brand-blue flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} /> Tambah
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {instructions.map((ins, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={ins}
                  onChange={(e) => updateInstruction(i, e.target.value)}
                  placeholder={`Instruksi ${i + 1}`}
                  className="flex-1 h-10 rounded-[10px] border border-border bg-surface-card px-3 text-[12px] text-ink outline-none focus:border-brand-blue"
                />
                {instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInstruction(i)}
                    className="w-10 h-10 rounded-[10px] border border-border flex items-center justify-center text-red-dark cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-extrabold text-ink">Rubrik Penilaian (opsional)</label>
            <button
              type="button"
              onClick={addRubric}
              className="text-[11px] font-bold text-brand-blue flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} /> Tambah
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {rubric.map((r, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={r.label}
                  onChange={(e) => updateRubric(i, "label", e.target.value)}
                  placeholder="Aspek"
                  className="flex-1 h-10 rounded-[10px] border border-border bg-surface-card px-3 text-[12px] text-ink outline-none focus:border-brand-blue"
                />
                <input
                  type="number"
                  value={r.max}
                  onChange={(e) => updateRubric(i, "max", e.target.value)}
                  placeholder="Maks"
                  className="w-20 h-10 rounded-[10px] border border-border bg-surface-card px-3 text-[12px] text-ink outline-none focus:border-brand-blue"
                />
                <button
                  type="button"
                  onClick={() => removeRubric(i)}
                  className="w-10 h-10 rounded-[10px] border border-border flex items-center justify-center text-red-dark cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-[12px] text-red-dark bg-red-light rounded-[10px] px-3 py-2">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-opacity"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Menyimpan..." : "Buat Tugas"}
        </button>
      </div>
    </>
  );
}

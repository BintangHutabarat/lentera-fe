"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, Save } from "lucide-react";
import { getExamGrades, updateExamGrades } from "@/lib/services/teacher";
import type { ExamGrades, ExamGradeEntry } from "@/lib/services/teacher";

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export default function TeacherExamGradesPage() {
  const { examId } = useParams<{ id: string; examId: string }>();
  const router = useRouter();

  const [data, setData] = useState<ExamGrades | null>(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getExamGrades(examId)
      .then((res) => {
        setData(res);
        const s: Record<string, string> = {};
        const n: Record<string, string> = {};
        res.entries.forEach((e) => {
          s[e.studentId] = e.score != null ? String(e.score) : "";
          n[e.studentId] = e.notes ?? "";
        });
        setScores(s);
        setNotes(n);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [examId]);

  const handleSave = async () => {
    if (!data || saving) return;
    setSaving(true);
    setError(null);
    try {
      const entries = data.entries.map((e) => ({
        studentId: e.studentId,
        score: scores[e.studentId] !== "" ? Number(scores[e.studentId]) : null,
        notes: notes[e.studentId] || undefined,
      }));
      await updateExamGrades(examId, entries);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      setError(code === "SCORE_EXCEEDS_MAX" ? `Nilai tidak boleh melebihi ${data.exam.maxScore}.` : "Gagal menyimpan.");
    }
    setSaving(false);
  };

  const gradedCount = data ? Object.values(scores).filter((s) => s !== "").length : 0;

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
          <h3 className="text-[14px] font-extrabold text-ink truncate">{data?.exam.title ?? "Nilai Ujian"}</h3>
          {data && (
            <p className="text-[11px] text-ink-muted">
              Max {data.exam.maxScore}{data.exam.date ? ` · ${formatDate(data.exam.date)}` : ""}
            </p>
          )}
        </div>
      </header>

      <div className="px-3.5 pt-3.5 pb-32">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>
        ) : !data ? null : (
          <>
            <div className="card p-3.5 mb-3.5 flex items-center gap-4">
              <div className="text-center">
                <div className="text-[18px] font-extrabold text-brand-blue">{gradedCount}</div>
                <div className="text-[9px] text-ink-muted">Dinilai</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-[18px] font-extrabold text-ink-muted">{data.entries.length - gradedCount}</div>
                <div className="text-[9px] text-ink-muted">Belum</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex-1">
                <div className="h-2 bg-surface-soft rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-blue rounded-full transition-all"
                    style={{ width: `${data.entries.length ? (gradedCount / data.entries.length) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-[10px] text-ink-muted mt-1">{data.entries.length} siswa total</div>
              </div>
            </div>

            {error && <p className="text-[11px] text-red-dark font-bold mb-3 px-1">{error}</p>}

            <div className="card">
              {data.entries.map((entry, i) => (
                <div
                  key={entry.studentId}
                  className={`px-4 py-3 ${i < data.entries.length - 1 ? "border-b border-surface-soft" : ""}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-bold text-ink">{entry.name}</div>
                      <div className="text-[10px] text-ink-muted">NIS: {entry.nis}</div>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={data.exam.maxScore}
                      value={scores[entry.studentId]}
                      onChange={(e) => setScores((prev) => ({ ...prev, [entry.studentId]: e.target.value }))}
                      placeholder="—"
                      className="w-16 h-9 rounded-[8px] border border-border bg-surface-soft px-2 text-[13px] font-extrabold text-ink text-center outline-none focus:border-brand-blue transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    value={notes[entry.studentId]}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [entry.studentId]: e.target.value }))}
                    placeholder="Catatan (opsional)"
                    className="w-full h-8 rounded-[8px] border border-border bg-surface-soft px-2.5 text-[11px] text-ink outline-none focus:border-brand-blue transition-colors"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {data && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-border px-3.5 py-3"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {saving ? "Menyimpan..." : saved ? "Tersimpan!" : "Simpan Nilai"}
          </button>
        </div>
      )}
    </>
  );
}

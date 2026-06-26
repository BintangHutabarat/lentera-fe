"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { getPrincipalFinalGrades } from "@/lib/services/principal";
import { getAcademicYears } from "@/lib/services/admin";
import type { PrincipalFinalGrades } from "@/lib/services/principal";
import type { AcademicYear } from "@/lib/services/admin";

function RefBadge({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="text-center">
      <div className="text-[11px] font-extrabold text-ink">{value != null ? value.toFixed(1) : "—"}</div>
      <div className="text-[9px] text-ink-muted">{label}</div>
    </div>
  );
}

export default function PrincipalNilaiAkhirPage() {
  const { classSubjectId } = useParams<{ id: string; classSubjectId: string }>();
  const router = useRouter();

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");

  const [data, setData] = useState<PrincipalFinalGrades | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAcademicYears().then((years) => {
      setAcademicYears(years);
      const active = years.find((y) => y.isActive);
      if (active) setSelectedYear(active.id);
    }).catch(() => {});
  }, []);

  const loadGrades = async () => {
    if (!selectedYear) return;
    setLoading(true);
    setData(null);
    setError(null);
    try {
      const res = await getPrincipalFinalGrades(classSubjectId, selectedYear);
      setData(res);
    } catch {
      setError("Gagal memuat nilai akhir.");
    }
    setLoading(false);
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
          <h3 className="text-[14px] font-extrabold text-ink">Nilai Akhir</h3>
          {data && <p className="text-[11px] text-ink-muted truncate">{data.subject.name} · {data.teacher.name}</p>}
        </div>
      </header>

      <div className="px-3.5 pt-3.5 pb-24">
        <div className="card p-3.5 mb-3.5 flex flex-col gap-3">
          <div>
            <label className="block text-[10px] font-bold text-ink-muted mb-1.5">Tahun Ajaran</label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full h-10 rounded-[10px] border border-border bg-surface-soft px-3 pr-8 text-[13px] text-ink outline-none focus:border-brand-blue appearance-none"
              >
                <option value="">Pilih tahun ajaran</option>
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>{y.label}{y.isActive ? " (Aktif)" : ""}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            </div>
          </div>
          <button
            onClick={loadGrades}
            disabled={!selectedYear || loading}
            className="h-10 rounded-[10px] bg-brand-blue text-white text-[13px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {loading ? "Memuat..." : "Tampilkan"}
          </button>
        </div>

        {error && <p className="text-[12px] text-red-dark font-bold mb-3 px-1">{error}</p>}

        {data && (
          <div className="card">
            {data.entries.map((entry, i) => (
              <div
                key={entry.studentId}
                className={`px-4 py-3 ${i < data.entries.length - 1 ? "border-b border-surface-soft" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-[12px] font-bold text-ink">{entry.name}</div>
                    <div className="text-[10px] text-ink-muted">NIS: {entry.nis}</div>
                  </div>
                  <div className={`text-[16px] font-extrabold ${entry.finalGrade != null ? "text-brand-blue" : "text-ink-muted"}`}>
                    {entry.finalGrade ?? "—"}
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-surface-soft rounded-[8px] px-3 py-2">
                  <RefBadge label="Tugas" value={entry.refAssignment} />
                  <div className="w-px h-6 bg-border" />
                  <RefBadge label="Quiz" value={entry.refQuiz} />
                  <div className="w-px h-6 bg-border" />
                  <RefBadge label="Ujian" value={entry.refExam} />
                  <div className="w-px h-6 bg-border" />
                  <RefBadge label="Hadir%" value={entry.refAttendance} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

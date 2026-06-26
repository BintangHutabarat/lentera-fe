"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { createClass, getAcademicYears } from "@/lib/services/admin";
import type { AcademicYear } from "@/lib/services/admin";
import { isApiError } from "@/lib/api";

function AdminBuatKelasContent() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [loadingYears, setLoadingYears] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAcademicYears()
      .then((years) => {
        setAcademicYears(years);
        const active = years.find((y) => y.isActive) ?? years[0];
        if (active) setSelectedYear(active.id);
      })
      .catch(() => {})
      .finally(() => setLoadingYears(false));
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Nama kelas wajib diisi.");
      return;
    }
    if (!selectedYear) {
      setError("Tahun ajaran wajib dipilih.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // Yayasan ini tidak memakai klasifikasi tingkat; kirim nilai default agar tetap valid di BE.
      const res = await createClass({ name: name.trim(), gradeYear: 1, academicYearId: selectedYear });
      router.push(`/admin/kelas/${res.id}`);
    } catch (e) {
      const codeMap: Record<string, string> = {
        CLASS_NAME_TAKEN: "Nama kelas sudah ada.",
      };
      setError(isApiError(e) ? (codeMap[e.code] ?? e.message) : "Gagal membuat kelas.");
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
        <h3 className="text-[14px] font-extrabold text-ink flex-1">Tambah Kelas</h3>
      </header>

      <div className="px-3.5 pt-3.5 pb-24 flex flex-col gap-3">
        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Nama Kelas *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Tahfidz A"
            className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Tahun Ajaran *</label>
          {loadingYears ? (
            <div className="h-11 rounded-[10px] border border-border bg-surface-soft flex items-center px-3">
              <Loader2 size={14} className="animate-spin text-ink-muted" />
            </div>
          ) : academicYears.length === 0 ? (
            <div className="text-[12px] text-ink-muted bg-surface-soft rounded-[10px] px-3 py-2.5 leading-relaxed">
              Belum ada tahun ajaran. Buat dulu di{" "}
              <Link href="/admin/tahun-ajaran" className="text-brand-blue font-bold underline">
                Tahun Ajaran
              </Link>{" "}
              sebelum menambah kelas.
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 pr-8 text-[13px] text-ink outline-none focus:border-brand-blue appearance-none"
              >
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.label}{y.isActive ? " (Aktif)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            </div>
          )}
        </div>

        {error && (
          <div className="text-[12px] text-red-dark bg-red-light rounded-[10px] px-3 py-2">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || loadingYears || academicYears.length === 0}
          className="h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed mt-1"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Menyimpan..." : "Buat Kelas"}
        </button>
      </div>
    </>
  );
}

export default function AdminBuatKelasPage() {
  return (
    <Suspense>
      <AdminBuatKelasContent />
    </Suspense>
  );
}

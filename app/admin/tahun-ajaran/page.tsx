"use client";
import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Loader2, Plus, Trash2, X } from "lucide-react";
import { PageTopbar } from "@/components/layout/PageTopbar";
import {
  getAcademicYears,
  createAcademicYear,
  activateAcademicYear,
  deleteAcademicYear,
} from "@/lib/services/admin";
import type { AcademicYear } from "@/lib/services/admin";

export default function AdminTahunAjaranPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getAcademicYears()
      .then(setYears)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    const trimmed = label.trim();
    if (!trimmed || saving) return;
    if (!/^\d{4}\/\d{4}$/.test(trimmed)) {
      setError("Format harus YYYY/YYYY, contoh: 2025/2026");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createAcademicYear(trimmed);
      setYears((prev) => [...prev, created]);
      setLabel("");
      setCreating(false);
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message;
      setError(msg === "ACADEMIC_YEAR_EXISTS" ? "Tahun ajaran ini sudah ada." : (msg ?? "Gagal menyimpan."));
    }
    setSaving(false);
  };

  const handleActivate = async (yr: AcademicYear) => {
    if (yr.isActive || activatingId) return;
    setActivatingId(yr.id);
    try {
      await activateAcademicYear(yr.id);
      setYears((prev) => prev.map((y) => ({ ...y, isActive: y.id === yr.id })));
    } catch {
      /* silent */
    }
    setActivatingId(null);
  };

  const handleDelete = async (yr: AcademicYear) => {
    if (!confirm(`Hapus tahun ajaran ${yr.label}?`)) return;
    setDeletingId(yr.id);
    try {
      await deleteAcademicYear(yr.id);
      setYears((prev) => prev.filter((y) => y.id !== yr.id));
    } catch (e: unknown) {
      const msg = (e as { code?: string })?.code;
      alert(msg === "ACADEMIC_YEAR_IN_USE" ? "Tidak bisa dihapus, sudah ada nilai akhir." : "Gagal menghapus.");
    }
    setDeletingId(null);
  };

  return (
    <>
      <PageTopbar
        title="Tahun Ajaran"
        subtitle={`${years.length} tahun ajaran`}
        right={
          <button
            onClick={() => { setCreating(true); setLabel(""); setError(null); }}
            className="w-9 h-9 rounded-[10px] bg-brand-blue flex items-center justify-center cursor-pointer"
          >
            <Plus size={18} className="text-white" />
          </button>
        }
      />

      <div className="px-3.5 pt-3.5 pb-24">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>
        ) : years.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 rounded-full bg-surface-soft flex items-center justify-center mb-3">
              <CalendarDays size={24} className="text-ink-muted" />
            </div>
            <p className="text-[13px] font-bold text-ink">Belum ada tahun ajaran</p>
            <p className="text-[11px] text-ink-muted mt-1">Tambah tahun ajaran baru dengan tombol + di atas.</p>
          </div>
        ) : (
          <div className="card">
            {years.map((yr, i) => (
              <div
                key={yr.id}
                className={`flex items-center gap-3 px-4 py-3 ${i < years.length - 1 ? "border-b border-surface-soft" : ""}`}
              >
                <div className="w-10 h-10 rounded-[10px] bg-surface-soft flex items-center justify-center flex-shrink-0">
                  <CalendarDays size={18} className="text-brand-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-extrabold text-ink">{yr.label}</div>
                  {yr.isActive && (
                    <div className="text-[10px] font-bold text-brand-teal mt-0.5 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Aktif
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!yr.isActive && (
                    <button
                      onClick={() => handleActivate(yr)}
                      disabled={!!activatingId}
                      className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-surface-soft text-brand-blue hover:bg-brand-blue hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {activatingId === yr.id ? <Loader2 size={12} className="animate-spin" /> : "Aktifkan"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(yr)}
                    disabled={deletingId === yr.id}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-ink-muted hover:text-red-dark hover:bg-red-light transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === yr.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end" onClick={() => setCreating(false)}>
          <div
            className="w-full bg-surface-card rounded-t-[20px] p-5 flex flex-col gap-4"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-extrabold text-ink">Tambah Tahun Ajaran</h3>
              <button
                onClick={() => setCreating(false)}
                className="w-7 h-7 rounded-full bg-surface-soft flex items-center justify-center cursor-pointer"
              >
                <X size={14} className="text-ink-muted" />
              </button>
            </div>

            <div>
              <input
                autoFocus
                value={label}
                onChange={(e) => { setLabel(e.target.value); setError(null); }}
                placeholder="2025/2026"
                className="w-full h-11 rounded-[10px] border border-border bg-surface-soft px-3.5 text-[13px] text-ink outline-none focus:border-brand-blue transition-colors"
              />
              <p className="text-[10px] text-ink-muted mt-1.5">Format: YYYY/YYYY · contoh: 2025/2026</p>
              {error && <p className="text-[11px] text-red-dark mt-1.5 font-bold">{error}</p>}
            </div>

            <button
              onClick={handleCreate}
              disabled={!label.trim() || saving}
              className="h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {saving ? "Menyimpan..." : "Tambah"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Pencil } from "lucide-react";
import {
  getAdminSubjects,
  updateSubject,
  deleteSubject,
} from "@/lib/services/admin";
import { subjectColorMap } from "@/lib/utils";
import { isApiError } from "@/lib/api";
import type { AdminSubject, AdminSubjectColor } from "@/lib/services/admin";

const COLOR_OPTIONS: { value: AdminSubjectColor; label: string }[] = [
  { value: "BLUE",   label: "Biru" },
  { value: "TEAL",   label: "Teal" },
  { value: "YELLOW", label: "Kuning" },
  { value: "MINT",   label: "Mint" },
  { value: "RED",    label: "Merah" },
  { value: "PURPLE", label: "Ungu" },
];

const ICON_OPTIONS = [
  { value: "math",      label: "Matematika" },
  { value: "physics",   label: "Fisika" },
  { value: "chemistry", label: "Kimia" },
  { value: "biology",   label: "Biologi" },
  { value: "language",  label: "Bahasa" },
  { value: "social",    label: "IPS" },
  { value: "sport",     label: "Olahraga" },
  { value: "art",       label: "Seni" },
  { value: "other",     label: "Lainnya" },
];

export default function AdminMapelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [subject, setSubject] = useState<AdminSubject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit subject
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editShortName, setEditShortName] = useState("");
  const [editColor, setEditColor] = useState<AdminSubjectColor>("BLUE");
  const [editIconKey, setEditIconKey] = useState("math");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminSubjects()
      .then((subs) => {
        const sub = subs.find((s) => s.id === id) ?? null;
        setSubject(sub);
        if (sub) {
          setEditName(sub.name);
          setEditShortName(sub.shortName);
          setEditColor(sub.color.toUpperCase() as AdminSubjectColor);
          setEditIconKey(sub.iconKey);
        }
      })
      .catch(() => setError("Gagal memuat data mapel."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveSubject = async () => {
    setSaving(true);
    try {
      await updateSubject(id, {
        name: editName.trim(),
        shortName: editShortName.trim(),
        color: editColor,
        iconKey: editIconKey,
      });
      setSubject((s) =>
        s
          ? { ...s, name: editName.trim(), shortName: editShortName.trim(), color: editColor.toLowerCase(), iconKey: editIconKey }
          : s
      );
      setEditMode(false);
    } catch {
      setError("Gagal menyimpan perubahan mapel.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!confirm(`Hapus mapel "${subject?.name}"?`)) return;
    try {
      await deleteSubject(id);
      router.push("/admin/mapel");
    } catch (e) {
      const msg =
        isApiError(e) && e.code === "SUBJECT_IN_USE"
          ? "Tidak bisa dihapus: mapel masih digunakan di kelas."
          : "Gagal menghapus mapel.";
      setError(msg);
    }
  };

  const colorKey = (subject?.color.toLowerCase() ?? "blue") as keyof typeof subjectColorMap;
  const colors = subjectColorMap[colorKey] ?? subjectColorMap.blue;

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>;
  }

  if (!subject) {
    return <div className="px-4 py-10 text-center text-[13px] text-ink-muted">Mapel tidak ditemukan.</div>;
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
          <h3 className="text-[14px] font-extrabold text-ink">{subject.name}</h3>
          <p className="text-[11px] text-ink-muted">
            {subject.shortName} · {subject.classCount} kelas
          </p>
        </div>
        <button
          onClick={() => { setEditName(subject.name); setEditShortName(subject.shortName); setEditColor(subject.color.toUpperCase() as AdminSubjectColor); setEditIconKey(subject.iconKey); setEditMode((v) => !v); }}
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

        {/* Subject preview card */}
        <div className={`rounded-[12px] p-4 flex items-center gap-3 ${colors.bg}`}>
          <div className={`w-12 h-12 rounded-[10px] bg-white/60 flex items-center justify-center text-[14px] font-extrabold ${colors.text}`}>
            {subject.shortName}
          </div>
          <div>
            <div className={`text-[15px] font-extrabold ${colors.text}`}>{subject.name}</div>
            <div className={`text-[11px] opacity-70 ${colors.text}`}>
              {subject.iconKey} · {subject.classCount} kelas
            </div>
          </div>
        </div>

        {/* Edit subject form */}
        {editMode && (
          <div className="card p-4 flex flex-col gap-3">
            <p className="text-[13px] font-bold text-ink">Edit Mapel</p>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-ink-muted mb-1 block">Nama Mapel</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 rounded-[10px] border border-border bg-surface-soft px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
                />
              </div>
              <div>
                <label className="text-[11px] text-ink-muted mb-1 block">Singkatan</label>
                <input
                  value={editShortName}
                  onChange={(e) => setEditShortName(e.target.value)}
                  maxLength={6}
                  className="w-full h-10 rounded-[10px] border border-border bg-surface-soft px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-ink-muted mb-1 block">Warna</label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_OPTIONS.map((opt) => {
                  const ck = opt.value.toLowerCase() as keyof typeof subjectColorMap;
                  const cv = subjectColorMap[ck] ?? subjectColorMap.blue;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setEditColor(opt.value)}
                      className={`h-9 rounded-[10px] text-[12px] font-bold flex items-center justify-center border-2 transition-all cursor-pointer ${cv.bg} ${cv.text} ${
                        editColor === opt.value ? "border-current" : "border-transparent"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-[11px] text-ink-muted mb-1 block">Ikon</label>
              <select
                value={editIconKey}
                onChange={(e) => setEditIconKey(e.target.value)}
                className="w-full h-10 rounded-[10px] border border-border bg-surface-soft px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveSubject}
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

        {/* Danger */}
        <button
          onClick={handleDeleteSubject}
          className="h-11 rounded-[12px] border border-red-dark/30 text-red-dark text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-red-light transition-colors"
        >
          <Trash2 size={14} />
          Hapus Mapel
        </button>
      </div>
    </>
  );
}

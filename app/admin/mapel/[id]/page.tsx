"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookMarked, Plus, Trash2, Pencil } from "lucide-react";
import {
  getAdminSubjects,
  updateSubject,
  deleteSubject,
  getAdminChapters,
  createChapter,
  updateChapter,
  deleteChapter,
} from "@/lib/services/admin";
import { subjectColorMap } from "@/lib/utils";
import { isApiError } from "@/lib/api";
import type { AdminSubject, AdminChapter, AdminSubjectColor } from "@/lib/services/admin";

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
  const [chapters, setChapters] = useState<AdminChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit subject
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editShortName, setEditShortName] = useState("");
  const [editColor, setEditColor] = useState<AdminSubjectColor>("BLUE");
  const [editIconKey, setEditIconKey] = useState("math");
  const [saving, setSaving] = useState(false);

  // Edit chapter (inline per row)
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editChapterContent, setEditChapterContent] = useState("");
  const [savingChapter, setSavingChapter] = useState(false);

  // Add chapter
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newOrder, setNewOrder] = useState(1);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [addingChapter, setAddingChapter] = useState(false);

  useEffect(() => {
    Promise.all([getAdminSubjects(), getAdminChapters(id)])
      .then(([subs, chaps]) => {
        const sub = subs.find((s) => s.id === id) ?? null;
        setSubject(sub);
        if (sub) {
          setEditName(sub.name);
          setEditShortName(sub.shortName);
          setEditColor(sub.color.toUpperCase() as AdminSubjectColor);
          setEditIconKey(sub.iconKey);
        }
        const sorted = [...chaps].sort((a, b) => a.order - b.order);
        setChapters(sorted);
        setNewOrder(sorted.length > 0 ? Math.max(...sorted.map((c) => c.order)) + 1 : 1);
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

  const handleOpenEditChapter = (ch: AdminChapter) => {
    setEditingChapterId(ch.id);
    setEditChapterTitle(ch.title);
    setEditChapterContent("");
  };

  const handleSaveChapter = async (chapterId: string) => {
    setSavingChapter(true);
    try {
      const payload: { title?: string; content?: string } = {};
      if (editChapterTitle.trim()) payload.title = editChapterTitle.trim();
      if (editChapterContent.trim()) payload.content = editChapterContent.trim();
      await updateChapter(id, chapterId, payload);
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId
            ? {
                ...c,
                title: editChapterTitle.trim() || c.title,
                hasContent: editChapterContent.trim() ? true : c.hasContent,
              }
            : c
        )
      );
      setEditingChapterId(null);
    } catch {
      setError("Gagal menyimpan bab.");
    } finally {
      setSavingChapter(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm("Hapus bab ini?")) return;
    try {
      await deleteChapter(id, chapterId);
      setChapters((prev) => prev.filter((c) => c.id !== chapterId));
    } catch {
      setError("Gagal menghapus bab.");
    }
  };

  const handleAddChapter = async () => {
    if (!newTitle.trim()) return;
    setAddingChapter(true);
    try {
      const payload: { order: number; title: string; content?: string } = {
        order: newOrder,
        title: newTitle.trim(),
      };
      if (newContent.trim()) payload.content = newContent.trim();
      const result = await createChapter(id, payload);
      const newCh: AdminChapter = {
        id: result.id,
        order: result.order,
        title: result.title,
        hasContent: !!newContent.trim(),
      };
      setChapters((prev) => [...prev, newCh].sort((a, b) => a.order - b.order));
      setSubject((s) => s ? { ...s, chapterCount: s.chapterCount + 1 } : s);
      setNewTitle("");
      setNewContent("");
      setNewOrder((n) => n + 1);
      setShowAddChapter(false);
    } catch (e) {
      const msg =
        isApiError(e) && e.code === "ORDER_TAKEN"
          ? "Nomor urut bab sudah ada."
          : "Gagal menambah bab.";
      setError(msg);
    } finally {
      setAddingChapter(false);
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
            {subject.shortName} · {subject.classCount} kelas · {chapters.length} bab
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
              {subject.iconKey} · {subject.classCount} kelas · {subject.chapterCount} bab
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

        {/* Chapters */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[14px] font-extrabold text-ink">Daftar Bab</h3>
            <button
              onClick={() => setShowAddChapter((v) => !v)}
              className="text-[12px] font-bold text-brand-blue flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} /> Tambah Bab
            </button>
          </div>

          {/* Add chapter form */}
          {showAddChapter && (
            <div className="card p-4 mb-3 flex flex-col gap-3">
              <p className="text-[13px] font-bold text-ink">Tambah Bab Baru</p>
              <div className="flex gap-2">
                <div className="w-20 flex-shrink-0">
                  <label className="text-[11px] text-ink-muted mb-1 block">Urutan</label>
                  <input
                    type="number"
                    min={1}
                    value={newOrder}
                    onChange={(e) => setNewOrder(Number(e.target.value))}
                    className="w-full h-10 rounded-[10px] border border-border bg-surface-soft px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] text-ink-muted mb-1 block">Judul Bab</label>
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Bab 1 — Pengantar"
                    className="w-full h-10 rounded-[10px] border border-border bg-surface-soft px-3 text-[13px] text-ink placeholder:text-ink-muted outline-none focus:border-brand-blue"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-ink-muted mb-1 block">Konten Markdown (opsional)</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={"# Pengantar\n\nIsi bab di sini..."}
                  rows={4}
                  className="w-full rounded-[10px] border border-border bg-surface-soft px-3 py-2 text-[13px] text-ink placeholder:text-ink-muted outline-none focus:border-brand-blue resize-none font-mono"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddChapter}
                  disabled={addingChapter || !newTitle.trim()}
                  className="flex-1 h-10 rounded-[10px] bg-brand-blue text-white text-[13px] font-bold disabled:opacity-50 cursor-pointer"
                >
                  {addingChapter ? "Menyimpan..." : "Simpan Bab"}
                </button>
                <button
                  onClick={() => setShowAddChapter(false)}
                  className="h-10 px-4 rounded-[10px] border border-border text-[13px] font-bold text-ink-muted cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {chapters.length === 0 ? (
            <div className="card p-4 text-center text-[13px] text-ink-muted">
              Belum ada bab. Klik "Tambah Bab" untuk memulai.
            </div>
          ) : (
            <div className="card">
              {chapters.map((ch, i) => {
                const isEditing = editingChapterId === ch.id;
                return (
                  <div key={ch.id} className={i < chapters.length - 1 ? "border-b border-surface-soft" : ""}>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-[8px] bg-surface-soft flex items-center justify-center text-[12px] font-extrabold text-ink-muted flex-shrink-0">
                        {ch.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-extrabold text-ink truncate">{ch.title}</div>
                        <div className="mt-0.5">
                          {ch.hasContent ? (
                            <span className="text-[10px] font-semibold text-teal-dark">● Ada konten</span>
                          ) : (
                            <span className="text-[10px] text-ink-muted">○ Belum ada konten</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => isEditing ? setEditingChapterId(null) : handleOpenEditChapter(ch)}
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center text-ink-muted hover:bg-surface-soft transition-colors cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(ch.id)}
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center text-ink-muted hover:text-red-dark hover:bg-red-light transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {isEditing && (
                      <div className="px-4 pb-4 border-t border-surface-soft pt-3 flex flex-col gap-2.5">
                        <div>
                          <label className="text-[11px] text-ink-muted mb-1 block">Judul</label>
                          <input
                            value={editChapterTitle}
                            onChange={(e) => setEditChapterTitle(e.target.value)}
                            className="w-full h-10 rounded-[10px] border border-border bg-surface-soft px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-ink-muted mb-1 block">
                            Konten Markdown
                            <span className="ml-1 opacity-60">— kosongkan untuk tidak mengubah</span>
                          </label>
                          <textarea
                            value={editChapterContent}
                            onChange={(e) => setEditChapterContent(e.target.value)}
                            placeholder={"# Judul\n\nIsi bab di sini..."}
                            rows={5}
                            className="w-full rounded-[10px] border border-border bg-surface-soft px-3 py-2 text-[13px] text-ink placeholder:text-ink-muted outline-none focus:border-brand-blue resize-none font-mono"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveChapter(ch.id)}
                            disabled={savingChapter}
                            className="flex-1 h-9 rounded-[10px] bg-brand-blue text-white text-[12px] font-bold disabled:opacity-50 cursor-pointer"
                          >
                            {savingChapter ? "Menyimpan..." : "Simpan"}
                          </button>
                          <button
                            onClick={() => setEditingChapterId(null)}
                            className="h-9 px-3 rounded-[10px] border border-border text-[12px] font-bold text-ink-muted cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

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

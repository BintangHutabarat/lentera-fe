"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Copy, Check, Trash2 } from "lucide-react";
import {
  getAdminUser,
  getAdminClasses,
  updateStudent,
  resetPassword,
  deleteUser,
} from "@/lib/services/admin";
import { isApiError } from "@/lib/api";
import type { AdminUserDetail, AdminClass } from "@/lib/services/admin";

export default function AdminSiswaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [loading, setLoading] = useState(true);

  // edit state
  const [name, setName] = useState("");
  const [classId, setClassId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  // reset password
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([getAdminUser(id), getAdminClasses()])
      .then(([u, cls]) => {
        setUser(u);
        setClasses(cls);
        setName(u.student?.name ?? "");
        setClassId(u.student?.classId ?? "");
        setIsActive(u.isActive);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaveError(null);
    setSaveOk(false);
    setSaving(true);
    try {
      await updateStudent(id, {
        name: name.trim() || undefined,
        classId: classId || undefined,
        isActive,
      });
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 2000);
    } catch (e) {
      setSaveError(isApiError(e) ? e.message : "Gagal menyimpan perubahan.");
    }
    setSaving(false);
  };

  const handleResetPassword = async () => {
    if (!confirm("Reset password siswa ini?")) return;
    setResetting(true);
    try {
      const res = await resetPassword(id);
      setNewPassword(res.temporaryPassword);
    } catch {
      setSaveError("Gagal reset password.");
    }
    setResetting(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus akun siswa "${user?.student?.name}"? Semua data akan dihapus permanen.`)) return;
    try {
      await deleteUser(id);
      router.push("/admin/siswa");
    } catch (e) {
      setSaveError(isApiError(e) ? e.message : "Gagal menghapus siswa.");
    }
  };

  const handleCopy = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>;
  }

  const s = user?.student;
  const initials = (s?.name ?? "S").split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

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
          <h3 className="text-[14px] font-extrabold text-ink truncate">{s?.name ?? "Detail Siswa"}</h3>
          <p className="text-[11px] text-ink-muted">NIS {s?.nis ?? "—"}</p>
        </div>
      </header>

      <div className="px-3.5 pt-3.5 pb-24 flex flex-col gap-3.5">
        {/* Profile summary */}
        <div className="card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-teal-light flex items-center justify-center text-[16px] font-extrabold text-teal-dark flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-extrabold text-ink">{s?.name ?? "—"}</div>
            <div className="text-[11px] text-ink-muted mt-0.5">{s?.class ?? "—"} · Level {s?.level} · {s?.xp} XP</div>
          </div>
          {!user?.isActive && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-light text-red-dark">Nonaktif</span>
          )}
        </div>

        {/* New password display */}
        {newPassword && (
          <div className="card p-4">
            <div className="text-[12px] font-bold text-ink mb-1">Password Baru</div>
            <div className="text-[18px] font-extrabold text-ink tracking-widest mb-2">{newPassword}</div>
            <p className="text-[10px] text-ink-muted mb-3">Bagikan password ini ke siswa. Tidak bisa diambil ulang.</p>
            <button
              onClick={handleCopy}
              className="h-9 w-full rounded-[9px] border border-border text-[12px] font-bold text-ink flex items-center justify-center gap-2 cursor-pointer hover:bg-surface-soft"
            >
              {copied ? <Check size={13} className="text-teal-dark" /> : <Copy size={13} />}
              {copied ? "Tersalin!" : "Salin Password"}
            </button>
          </div>
        )}

        {saveError && (
          <div className="text-[12px] text-red-dark bg-red-light rounded-[10px] px-3 py-2">{saveError}</div>
        )}
        {saveOk && (
          <div className="text-[12px] text-teal-dark bg-teal-light rounded-[10px] px-3 py-2">Perubahan disimpan.</div>
        )}

        {/* Edit form */}
        <div>
          <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Edit Data Siswa</h3>
          <div className="card p-4 flex flex-col gap-3">
            <div>
              <label className="block text-[11px] font-extrabold text-ink mb-1.5">Nama Lengkap</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-ink mb-1.5">Kelas</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue cursor-pointer"
              >
                <option value="">— Pilih kelas —</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${isActive ? "bg-brand-blue" : "bg-surface-soft border border-border"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mt-1 ${isActive ? "translate-x-5 ml-0.5" : "translate-x-1"}`} />
                </div>
              </div>
              <span className="text-[13px] font-semibold text-ink">Akun Aktif</span>
            </label>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-11 rounded-[10px] bg-brand-blue text-white text-[13px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div>
          <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Tindakan Lain</h3>
          <div className="card">
            <button
              onClick={handleResetPassword}
              disabled={resetting}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-surface-soft hover:bg-surface-soft transition-colors cursor-pointer disabled:opacity-60"
            >
              {resetting
                ? <Loader2 size={16} className="text-ink-muted animate-spin" />
                : <div className="w-8 h-8 rounded-[8px] bg-yellow-light flex items-center justify-center flex-shrink-0">
                    <Copy size={14} className="text-yellow-dark" />
                  </div>}
              <span className="text-[13px] font-semibold text-ink">Reset Password</span>
            </button>
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-soft transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-[8px] bg-red-light flex items-center justify-center flex-shrink-0">
                <Trash2 size={14} className="text-red-dark" />
              </div>
              <span className="text-[13px] font-semibold text-red-dark">Hapus Siswa</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

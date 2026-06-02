"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Copy, Check, Trash2 } from "lucide-react";
import {
  getAdminUser,
  updateTeacher,
  resetPassword,
  deleteUser,
} from "@/lib/services/admin";
import { isApiError } from "@/lib/api";
import type { AdminUserDetail } from "@/lib/services/admin";

export default function AdminGuruDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // edit state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nip, setNip] = useState("");
  const [title, setTitle] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  // reset password
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getAdminUser(id)
      .then((u) => {
        setUser(u);
        setName(u.teacher?.name ?? "");
        setEmail(u.email ?? "");
        setNip(u.teacher?.nip ?? "");
        setTitle(u.teacher?.title ?? "");
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
      await updateTeacher(id, {
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        nip: nip.trim() || undefined,
        title: title.trim() || undefined,
        isActive,
      });
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 2000);
    } catch (e) {
      const codeMap: Record<string, string> = { EMAIL_TAKEN: "Email sudah digunakan.", NIP_TAKEN: "NIP sudah digunakan." };
      setSaveError(isApiError(e) ? (codeMap[e.code] ?? e.message) : "Gagal menyimpan perubahan.");
    }
    setSaving(false);
  };

  const handleResetPassword = async () => {
    if (!confirm("Reset password guru ini?")) return;
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
    if (!confirm(`Hapus akun guru "${user?.teacher?.name}"? Semua data akan dihapus permanen.`)) return;
    try {
      await deleteUser(id);
      router.push("/admin/guru");
    } catch (e) {
      setSaveError(isApiError(e) ? e.message : "Gagal menghapus guru.");
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

  const t = user?.teacher;
  const initials = (t?.name ?? "G").split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

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
          <h3 className="text-[14px] font-extrabold text-ink truncate">
            {t?.name ?? "Detail Guru"}
            {t?.title ? `, ${t.title}` : ""}
          </h3>
          <p className="text-[11px] text-ink-muted">{user?.email ?? "—"}</p>
        </div>
      </header>

      <div className="px-3.5 pt-3.5 pb-24 flex flex-col gap-3.5">
        {/* Profile summary */}
        <div className="card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-light flex items-center justify-center text-[16px] font-extrabold text-brand-blue flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-extrabold text-ink">
              {t?.name ?? "—"}{t?.title ? `, ${t.title}` : ""}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">
              {user?.email ?? "—"}
              {t?.nip ? ` · NIP ${t.nip}` : ""}
            </div>
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
            <p className="text-[10px] text-ink-muted mb-3">Bagikan password ini ke guru. Tidak bisa diambil ulang.</p>
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
          <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Edit Data Guru</h3>
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
              <label className="block text-[11px] font-extrabold text-ink mb-1.5">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-extrabold text-ink mb-1.5">NIP</label>
                <input
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-ink mb-1.5">Gelar</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="S.Pd."
                  className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
                />
              </div>
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
              <span className="text-[13px] font-semibold text-red-dark">Hapus Guru</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { changePassword, getMe } from "@/lib/services/auth";
import { isApiError } from "@/lib/api";

const ERROR_MESSAGES: Record<string, string> = {
  CURRENT_PASSWORD_WRONG: "Password saat ini salah.",
};

export default function ChangePasswordPage() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "TEACHER" | "ADMIN" | null>(null);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMe().then((user) => setRole(user.role)).catch(() => {});
  }, []);

  const canSubmit = currentPwd.length > 0 && newPwd.length >= 8 && !submitting;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await changePassword(currentPwd, newPwd);
      router.push(role === "STUDENT" ? "/auth/login/siswa" : "/auth/login/staff");
    } catch (err) {
      const msg = isApiError(err)
        ? (ERROR_MESSAGES[err.code] ?? err.message)
        : "Terjadi kesalahan, coba lagi.";
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-10 h-10 rounded-[11px] bg-teal-light flex items-center justify-center">
          <ShieldCheck size={20} className="text-teal-dark" />
        </div>
        <div>
          <h1 className="text-[18px] font-extrabold text-ink leading-tight">Buat Password Baru</h1>
          <p className="text-[11px] text-ink-muted">Ganti password default sebelum melanjutkan</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
        <div>
          <label htmlFor="currentPwd" className="block text-[11px] font-extrabold text-ink mb-1.5">
            Password Saat Ini
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <input
              id="currentPwd"
              type={showCurrent ? "text" : "password"}
              autoComplete="current-password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="Password lama"
              className="w-full h-11 rounded-[10px] border border-border bg-surface-card pl-9 pr-10 text-[13px] text-ink placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-soft transition-colors cursor-pointer"
              aria-label={showCurrent ? "Sembunyikan" : "Lihat"}
            >
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="newPwd" className="block text-[11px] font-extrabold text-ink mb-1.5">
            Password Baru
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <input
              id="newPwd"
              type={showNew ? "text" : "password"}
              autoComplete="new-password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="Min. 8 karakter"
              className="w-full h-11 rounded-[10px] border border-border bg-surface-card pl-9 pr-10 text-[13px] text-ink placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-soft transition-colors cursor-pointer"
              aria-label={showNew ? "Sembunyikan" : "Lihat"}
            >
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {newPwd.length > 0 && newPwd.length < 8 && (
            <p className="text-[10px] text-red-dark mt-1">Minimal 8 karakter</p>
          )}
        </div>

        {error && (
          <div className="text-[11px] font-bold text-red-dark bg-red-light rounded-[8px] px-2.5 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold mt-1 transition-all active:scale-[0.98] flex items-center justify-center gap-2",
            !canSubmit && "opacity-40 cursor-not-allowed",
            canSubmit && "cursor-pointer hover:opacity-90",
          )}
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Menyimpan..." : "Simpan Password"}
        </button>
      </form>

      <p className="text-[11px] text-ink-muted text-center mt-4">
        Setelah ganti password, kamu akan diminta login ulang.
      </p>
    </div>
  );
}

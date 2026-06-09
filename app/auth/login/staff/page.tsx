"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Mail, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { loginStaff } from "@/lib/services/auth";
import { isApiError } from "@/lib/api";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Email atau password salah.",
  ACCOUNT_DISABLED: "Akun kamu dinonaktifkan. Hubungi admin sekolah.",
};

export default function LoginStaffPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = emailLooksValid && password.length > 0 && !submitting;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const { user } = await loginStaff(email.trim(), password);
      if (user.mustChangePassword) {
        router.push("/auth/change-password");
      } else if (user.role === "TEACHER") {
        router.push("/teacher/beranda");
      } else if (user.role === "ADMIN") {
        router.push("/admin/beranda");
      } else if (user.role === "PRINCIPAL") {
        router.push("/principal/beranda");
      } else {
        router.push("/student/beranda");
      }
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
          <h1 className="text-[18px] font-extrabold text-ink leading-tight">Masuk Staf</h1>
          <p className="text-[11px] text-ink-muted">Guru · Admin · Kepala Sekolah</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
        <div>
          <label htmlFor="email" className="block text-[11px] font-extrabold text-ink mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
            />
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@sekolah.sch.id"
              className="w-full h-11 rounded-[10px] border border-border bg-surface-card pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="pwd" className="block text-[11px] font-extrabold text-ink mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
            />
            <input
              id="pwd"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full h-11 rounded-[10px] border border-border bg-surface-card pl-9 pr-10 text-[13px] text-ink placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-soft transition-colors cursor-pointer"
              aria-label={showPwd ? "Sembunyikan password" : "Lihat password"}
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
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
          {submitting ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="text-[11px] text-ink-muted text-center mt-4">
        Lupa password? Hubungi admin sekolah untuk reset.
      </p>

      <div className="my-5 flex items-center gap-3 text-[10px] font-bold text-ink-muted uppercase tracking-wide">
        <div className="flex-1 h-px bg-border" />
        atau
        <div className="flex-1 h-px bg-border" />
      </div>

      <Link
        href="/auth/login/siswa"
        className="flex items-center justify-center h-11 rounded-[12px] border border-border bg-surface-card text-ink text-[13px] font-extrabold hover:border-brand-blue hover:text-brand-blue transition-colors"
      >
        Masuk sebagai Siswa
      </Link>
    </div>
  );
}

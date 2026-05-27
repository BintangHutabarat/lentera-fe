"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, GraduationCap, IdCard, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginSiswaPage() {
  const router = useRouter();
  const [nis, setNis] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = nis.trim().length > 0 && password.length > 0 && !submitting;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    // Placeholder: BE belum siap. Fake delay biar UX-nya kerasa.
    await new Promise((r) => setTimeout(r, 600));
    router.push("/student/beranda");
  };

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-10 h-10 rounded-[11px] bg-blue-light flex items-center justify-center">
          <GraduationCap size={20} className="text-brand-blue" />
        </div>
        <div>
          <h1 className="text-[18px] font-extrabold text-ink leading-tight">Masuk Siswa</h1>
          <p className="text-[11px] text-ink-muted">Gunakan NIS dan password dari sekolah</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
        <div>
          <label htmlFor="nis" className="block text-[11px] font-extrabold text-ink mb-1.5">
            Nomor Induk Siswa (NIS)
          </label>
          <div className="relative">
            <IdCard
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
            />
            <input
              id="nis"
              type="text"
              inputMode="numeric"
              autoComplete="username"
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              placeholder="Contoh: 12345678"
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
        Lupa password? Hubungi guru atau admin sekolahmu.
      </p>

      <div className="my-5 flex items-center gap-3 text-[10px] font-bold text-ink-muted uppercase tracking-wide">
        <div className="flex-1 h-px bg-border" />
        atau
        <div className="flex-1 h-px bg-border" />
      </div>

      <Link
        href="/auth/login/staff"
        className="flex items-center justify-center h-11 rounded-[12px] border border-border bg-surface-card text-ink text-[13px] font-extrabold hover:border-brand-blue hover:text-brand-blue transition-colors"
      >
        Masuk sebagai Guru / Admin
      </Link>
    </div>
  );
}

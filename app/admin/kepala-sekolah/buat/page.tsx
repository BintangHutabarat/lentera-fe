"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, Crown, Eye, EyeOff, Loader2 } from "lucide-react";
import { createPrincipal } from "@/lib/services/admin";

export default function AdminBuatKepalaSekolahPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<{ name: string; email: string; temporaryPassword?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await createPrincipal({
        name: name.trim(),
        email: email.trim(),
        password: password.trim() || undefined,
      });
      setResult({ name: res.name, email: res.email, temporaryPassword: res.temporaryPassword });
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message;
      setError(msg ?? "Gagal membuat akun.");
    }
    setSaving(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (result) {
    return (
      <>
        <header className="bg-surface-card border-b border-border px-3.5 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={() => router.push("/admin/beranda")}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} className="text-ink" />
          </button>
          <h3 className="text-[14px] font-extrabold text-ink">Akun Berhasil Dibuat</h3>
        </header>

        <div className="px-3.5 pt-5 pb-24">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-surface-soft flex items-center justify-center mb-3">
              <Check size={28} className="text-brand-teal" />
            </div>
            <p className="text-[15px] font-extrabold text-ink">Kepala sekolah berhasil ditambahkan</p>
            <p className="text-[12px] text-ink-muted mt-1">{result.name} · {result.email}</p>
          </div>

          {result.temporaryPassword && (
            <div className="card p-4 mb-4">
              <p className="text-[11px] text-ink-muted mb-1.5">Password sementara (catat sekarang):</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[15px] font-extrabold text-ink tracking-widest bg-surface-soft rounded-[8px] px-3 py-2">
                  {result.temporaryPassword}
                </code>
                <button
                  onClick={() => handleCopy(result.temporaryPassword!)}
                  className="w-10 h-10 rounded-[10px] bg-surface-soft flex items-center justify-center flex-shrink-0 cursor-pointer"
                >
                  {copied ? <Check size={16} className="text-brand-teal" /> : <Copy size={16} className="text-ink-muted" />}
                </button>
              </div>
              <p className="text-[10px] text-ink-muted mt-2">Pengguna wajib mengganti password setelah login pertama.</p>
            </div>
          )}

          <button
            onClick={() => router.push("/admin/beranda")}
            className="w-full h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold cursor-pointer"
          >
            Kembali ke Beranda
          </button>
        </div>
      </>
    );
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
        <div>
          <h3 className="text-[14px] font-extrabold text-ink">Buat Kepala Sekolah</h3>
          <p className="text-[11px] text-ink-muted">Role: Principal</p>
        </div>
      </header>

      <div className="px-3.5 pt-4 pb-24 flex flex-col gap-4">
        <div className="w-14 h-14 rounded-full bg-surface-soft flex items-center justify-center mx-auto mt-2 mb-1">
          <Crown size={26} className="text-brand-blue" />
        </div>

        <div className="card p-4 flex flex-col gap-3.5">
          <div>
            <label className="block text-[11px] font-bold text-ink-muted mb-1.5">Nama Lengkap</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Ahmad Fauzi"
              className="w-full h-11 rounded-[10px] border border-border bg-surface-soft px-3.5 text-[13px] text-ink outline-none focus:border-brand-blue transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-ink-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kepala@ydiah.com"
              className="w-full h-11 rounded-[10px] border border-border bg-surface-soft px-3.5 text-[13px] text-ink outline-none focus:border-brand-blue transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-ink-muted mb-1.5">
              Password <span className="font-normal">(opsional — dikosongkan = auto-generate)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 karakter"
                className="w-full h-11 rounded-[10px] border border-border bg-surface-soft px-3.5 pr-11 text-[13px] text-ink outline-none focus:border-brand-blue transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-[12px] text-red-dark font-bold px-1">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !email.trim() || saving}
          className="h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Crown size={16} />}
          {saving ? "Membuat akun..." : "Buat Akun Kepala Sekolah"}
        </button>
      </div>
    </>
  );
}

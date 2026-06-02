"use client";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Copy, Check } from "lucide-react";
import { createTeacher } from "@/lib/services/admin";
import { isApiError } from "@/lib/api";
import type { CreateTeacherResult } from "@/lib/services/admin";

function AdminBuatGuruContent() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nip, setNip] = useState("");
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateTeacherResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Nama dan email wajib diisi.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await createTeacher({
        name: name.trim(),
        email: email.trim(),
        nip: nip.trim() || undefined,
        title: title.trim() || undefined,
        password: password.trim() || undefined,
      });
      setResult(res);
    } catch (e) {
      const codeMap: Record<string, string> = {
        EMAIL_TAKEN: "Email sudah digunakan.",
        NIP_TAKEN: "NIP sudah digunakan.",
      };
      setError(isApiError(e) ? (codeMap[e.code] ?? e.message) : "Gagal membuat akun guru.");
    }
    setSubmitting(false);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.temporaryPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (result) {
    return (
      <>
        <header className="bg-surface-card border-b border-border px-3.5 py-3 flex items-center gap-3 sticky top-0 z-10">
          <div className="flex-1">
            <h3 className="text-[14px] font-extrabold text-ink">Akun Berhasil Dibuat</h3>
          </div>
        </header>
        <div className="px-3.5 pt-4 pb-24 flex flex-col gap-4">
          <div className="card p-5 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-light flex items-center justify-center mx-auto mb-3">
              <Check size={24} className="text-brand-blue" />
            </div>
            <div className="text-[15px] font-extrabold text-ink mb-1">{result.name}</div>
            <div className="text-[12px] text-ink-muted mb-4">{result.email}</div>
            <div className="bg-surface-soft rounded-[10px] p-3 mb-4">
              <div className="text-[11px] text-ink-muted mb-1">Password Sementara</div>
              <div className="text-[18px] font-extrabold text-ink tracking-widest">{result.temporaryPassword}</div>
              <p className="text-[10px] text-ink-muted mt-2">Simpan password ini dan bagikan ke guru. Tidak bisa diambil ulang.</p>
            </div>
            <button
              onClick={handleCopy}
              className="w-full h-10 rounded-[10px] border border-border text-[13px] font-bold text-ink flex items-center justify-center gap-2 cursor-pointer hover:bg-surface-soft transition-colors mb-3"
            >
              {copied ? <Check size={14} className="text-teal-dark" /> : <Copy size={14} />}
              {copied ? "Tersalin!" : "Salin Password"}
            </button>
          </div>
          <button
            onClick={() => router.push("/admin/guru")}
            className="h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold flex items-center justify-center cursor-pointer"
          >
            Kembali ke Daftar Guru
          </button>
          <button
            onClick={() => { setResult(null); setName(""); setEmail(""); setNip(""); setTitle(""); setPassword(""); }}
            className="h-11 rounded-[12px] border border-border text-[13px] font-bold text-ink flex items-center justify-center cursor-pointer"
          >
            Tambah Guru Lain
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
        <h3 className="text-[14px] font-extrabold text-ink flex-1">Tambah Guru</h3>
      </header>

      <div className="px-3.5 pt-3.5 pb-24 flex flex-col gap-3">
        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Nama Lengkap *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Pak Ahmad Fauzi"
            className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
          />
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Email *</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="guru@sekolah.sch.id"
            className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-extrabold text-ink mb-1.5">NIP (opsional)</label>
            <input
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="198501012010011001"
              className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-ink mb-1.5">Gelar (opsional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="S.Pd., M.Pd."
              className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Password (opsional)</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="text"
            placeholder="Biarkan kosong untuk generate otomatis"
            className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
          />
        </div>

        {error && (
          <div className="text-[12px] text-red-dark bg-red-light rounded-[10px] px-3 py-2">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed mt-1"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Menyimpan..." : "Buat Akun Guru"}
        </button>
      </div>
    </>
  );
}

export default function AdminBuatGuruPage() {
  return (
    <Suspense>
      <AdminBuatGuruContent />
    </Suspense>
  );
}

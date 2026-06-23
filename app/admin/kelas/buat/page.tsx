"use client";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createClass } from "@/lib/services/admin";
import { isApiError } from "@/lib/api";

function AdminBuatKelasContent() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Nama kelas wajib diisi.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // Yayasan ini tidak memakai klasifikasi tingkat; kirim nilai default agar tetap valid di BE.
      const res = await createClass({ name: name.trim(), gradeYear: 1 });
      router.push(`/admin/kelas/${res.id}`);
    } catch (e) {
      const codeMap: Record<string, string> = {
        CLASS_NAME_TAKEN: "Nama kelas sudah ada.",
      };
      setError(isApiError(e) ? (codeMap[e.code] ?? e.message) : "Gagal membuat kelas.");
    }
    setSubmitting(false);
  };

  return (
    <>
      <header className="bg-surface-card border-b border-border px-3.5 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="text-ink" />
        </button>
        <h3 className="text-[14px] font-extrabold text-ink flex-1">Tambah Kelas</h3>
      </header>

      <div className="px-3.5 pt-3.5 pb-24 flex flex-col gap-3">
        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Nama Kelas *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Tahfidz A"
            className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
            autoFocus
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
          {submitting ? "Menyimpan..." : "Buat Kelas"}
        </button>
      </div>
    </>
  );
}

export default function AdminBuatKelasPage() {
  return (
    <Suspense>
      <AdminBuatKelasContent />
    </Suspense>
  );
}

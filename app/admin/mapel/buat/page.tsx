"use client";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createSubject } from "@/lib/services/admin";
import { isApiError } from "@/lib/api";
import { subjectColorMap } from "@/lib/utils";
import type { AdminSubjectColor } from "@/lib/services/admin";

const COLOR_OPTIONS: { value: AdminSubjectColor; label: string }[] = [
  { value: "BLUE",   label: "Biru" },
  { value: "TEAL",   label: "Teal" },
  { value: "YELLOW", label: "Kuning" },
  { value: "MINT",   label: "Mint" },
  { value: "RED",    label: "Merah" },
  { value: "PURPLE", label: "Ungu" },
];

const ICON_OPTIONS = [
  { value: "math",    label: "Matematika" },
  { value: "physics", label: "Fisika" },
  { value: "chemistry", label: "Kimia" },
  { value: "biology", label: "Biologi" },
  { value: "language", label: "Bahasa" },
  { value: "social",  label: "IPS" },
  { value: "sport",   label: "Olahraga" },
  { value: "art",     label: "Seni" },
  { value: "other",   label: "Lainnya" },
];

function AdminBuatMapelContent() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [color, setColor] = useState<AdminSubjectColor>("BLUE");
  const [iconKey, setIconKey] = useState("math");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !shortName.trim()) {
      setError("Nama dan singkatan mapel wajib diisi.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createSubject({ name: name.trim(), shortName: shortName.trim(), color, iconKey });
      router.push("/admin/mapel");
    } catch (e) {
      const codeMap: Record<string, string> = {
        SUBJECT_NAME_TAKEN: "Nama mapel sudah ada.",
      };
      setError(isApiError(e) ? (codeMap[e.code] ?? e.message) : "Gagal membuat mapel.");
    }
    setSubmitting(false);
  };

  const previewColorKey = color.toLowerCase() as keyof typeof subjectColorMap;
  const preview = subjectColorMap[previewColorKey] ?? subjectColorMap.blue;

  return (
    <>
      <header className="bg-surface-card border-b border-border px-3.5 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="text-ink" />
        </button>
        <h3 className="text-[14px] font-extrabold text-ink flex-1">Tambah Mapel</h3>
      </header>

      <div className="px-3.5 pt-3.5 pb-24 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-extrabold text-ink mb-1.5">Nama Mapel *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Matematika"
              className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-ink mb-1.5">Singkatan *</label>
            <input
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="MTK"
              className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Warna</label>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_OPTIONS.map((opt) => {
              const ck = opt.value.toLowerCase() as keyof typeof subjectColorMap;
              const c = subjectColorMap[ck] ?? subjectColorMap.blue;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={`h-10 rounded-[10px] text-[12px] font-bold flex items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${c.bg} ${c.text} ${
                    color === opt.value ? "border-current" : "border-transparent"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Ikon</label>
          <select
            value={iconKey}
            onChange={(e) => setIconKey(e.target.value)}
            className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue cursor-pointer"
          >
            {ICON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Preview */}
        <div className={`rounded-[12px] p-4 flex items-center gap-3 ${preview.bg}`}>
          <div className={`w-11 h-11 rounded-[10px] bg-white/60 flex items-center justify-center text-[15px] font-extrabold ${preview.text}`}>
            {shortName || "MTK"}
          </div>
          <div>
            <div className={`text-[14px] font-extrabold ${preview.text}`}>{name || "Nama Mapel"}</div>
            <div className={`text-[11px] opacity-70 ${preview.text}`}>{color} · {iconKey}</div>
          </div>
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
          {submitting ? "Menyimpan..." : "Buat Mapel"}
        </button>
      </div>
    </>
  );
}

export default function AdminBuatMapelPage() {
  return (
    <Suspense>
      <AdminBuatMapelContent />
    </Suspense>
  );
}

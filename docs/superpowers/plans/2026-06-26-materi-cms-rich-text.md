# Materi CMS — Rich Text + Lampiran Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ubah "Materi Pelajaran" guru menjadi entri gaya CMS (Judul + Isi rich-text + lampiran gambar/PDF base64), menggantikan feed item bertipe-tunggal yang lama.

**Architecture:** Tiga halaman penuh (daftar / detail / buat) di bawah `app/teacher/kelas/[id]/materi`. Isi ditulis lewat editor Tiptap (HTML), dirender dengan sanitasi DOMPurify. Lampiran dipilih di klien, di-encode ke base64 data URL saat submit, dan dikirim inline ke endpoint materi (tanpa MinIO).

**Tech Stack:** Next.js App Router (client components), Tiptap (`@tiptap/react` + `starter-kit` + `extension-link`), `isomorphic-dompurify`, Tailwind v4, lucide-react.

**Verifikasi:** Proyek tidak punya test runner (hanya `next dev/build/lint`). Menambah harness = di luar scope (YAGNI). Karena itu gerbang otomatis tiap task = `npx tsc --noEmit` + `npx eslint <file>`; gerbang akhir = `npx next build` + checklist manual. Package manager: **pnpm** (lockfile pnpm).

**Kontrak API (acuan; BE dikerjakan terpisah):** lihat `docs/superpowers/specs/2026-06-26-materi-cms-rich-text-design.md` §4.

---

### Task 1: Pasang dependency

**Files:**
- Modify: `package.json` (via package manager)

- [ ] **Step 1: Install**

Run:
```bash
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-link isomorphic-dompurify
```
Expected: keempat paket masuk `dependencies`, `pnpm-lock.yaml` ter-update, exit 0.

- [ ] **Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add tiptap + dompurify for materi rich text"
```

---

### Task 2: Util baca file → base64

**Files:**
- Create: `lib/files.ts`

- [ ] **Step 1: Buat file**

```ts
/** Baca File menjadi base64 data URL ("data:<mime>;base64,..."). */
export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.readAsDataURL(file);
  });
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: `No errors found`.

- [ ] **Step 3: Commit**

```bash
git add lib/files.ts
git commit -m "feat: add readAsDataUrl file helper"
```

---

### Task 3: Styling `.rich-content`

**Files:**
- Modify: `app/globals.css` (append di akhir file)

- [ ] **Step 1: Tambah blok CSS**

Tambahkan di akhir `app/globals.css`:
```css
/* Materi rich-text body (Tiptap output + rendered) */
.rich-content { word-break: break-word; }
.rich-content p { margin: 0 0 0.5rem; }
.rich-content h2 { font-size: 1.05rem; font-weight: 800; margin: 0.75rem 0 0.4rem; }
.rich-content h3 { font-size: 0.95rem; font-weight: 800; margin: 0.6rem 0 0.35rem; }
.rich-content ul { list-style: disc; padding-left: 1.25rem; margin: 0 0 0.5rem; }
.rich-content ol { list-style: decimal; padding-left: 1.25rem; margin: 0 0 0.5rem; }
.rich-content li { margin: 0.15rem 0; }
.rich-content a { color: var(--color-brand-blue); text-decoration: underline; }
.rich-content strong { font-weight: 800; }
.rich-content :where(p, li):last-child { margin-bottom: 0; }
```
> Catatan: token warna di proyek ini diekspos sebagai `var(--color-brand-blue)` (sesuai utility `text-brand-blue`). Jika `@theme` memakai nama lain, sesuaikan.

- [ ] **Step 2: Verify**

Run: `npx next build`
Expected: build sukses (CSS valid). Jika ingin cepat, lewati sampai Task 10; minimal pastikan tidak ada syntax error.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: add .rich-content typography for materi"
```

---

### Task 4: Komponen `RichContent` (render + sanitasi)

**Files:**
- Create: `components/materi/RichContent.tsx`

- [ ] **Step 1: Buat file**

```tsx
import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "h2", "h3", "ul", "ol", "li", "a"];
const ALLOWED_ATTR = ["href", "target", "rel"];

/** Render HTML materi yang sudah disanitasi. JANGAN render HTML mentah tanpa ini. */
export function RichContent({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
  return (
    <div
      className="rich-content text-[13px] text-ink leading-relaxed"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx eslint components/materi/RichContent.tsx`
Expected: tsc `No errors found`; eslint `No issues found`.

- [ ] **Step 3: Commit**

```bash
git add components/materi/RichContent.tsx
git commit -m "feat: add RichContent sanitized HTML renderer"
```

---

### Task 5: Komponen `RichTextEditor` (Tiptap)

**Files:**
- Create: `components/materi/RichTextEditor.tsx`

- [ ] **Step 1: Buat file**

```tsx
"use client";
import type { ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Heading2, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

function ToolbarButton({
  active, onClick, label, children,
}: { active: boolean; onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors cursor-pointer",
        active ? "bg-brand-blue text-white" : "text-ink-secondary hover:bg-surface-soft",
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // wajib untuk SSR Next App Router
    extensions: [
      // Tiptap v3: StarterKit SUDAH menyertakan ekstensi Link (juga underline).
      // Konfigurasikan link di sini; JANGAN import @tiptap/extension-link terpisah
      // (akan duplikat & crash runtime: "Duplicate extension names found: ['link']").
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "rich-content min-h-[180px] outline-none px-4 py-3.5 text-[13px] text-ink leading-relaxed",
      },
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL tautan:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="rounded-[12px] border border-border bg-surface-card overflow-hidden focus-within:border-brand-blue transition-colors">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5 flex-wrap">
        <ToolbarButton label="Tebal" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={15} /></ToolbarButton>
        <ToolbarButton label="Miring" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={15} /></ToolbarButton>
        <ToolbarButton label="Judul" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={15} /></ToolbarButton>
        <ToolbarButton label="Daftar" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={15} /></ToolbarButton>
        <ToolbarButton label="Daftar nomor" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={15} /></ToolbarButton>
        <ToolbarButton label="Tautan" active={editor.isActive("link")} onClick={setLink}><Link2 size={15} /></ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx eslint components/materi/RichTextEditor.tsx`
Expected: tsc `No errors found`; eslint `No issues found`.

- [ ] **Step 3: Commit**

```bash
git add components/materi/RichTextEditor.tsx
git commit -m "feat: add Tiptap RichTextEditor for materi body"
```

---

### Task 6: Komponen `AttachmentPicker`

**Files:**
- Create: `components/materi/AttachmentPicker.tsx`

- [ ] **Step 1: Buat file**

```tsx
"use client";
import { useRef } from "react";
import { FileText, ImagePlus, X } from "lucide-react";

export const ATTACH_MAX_FILES = 5;
export const ATTACH_MAX_BYTES = 3 * 1024 * 1024;
export const ATTACH_IMG_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ATTACH_PDF_TYPE = "application/pdf";

/** Tentukan tipe materi dari mime; null jika tidak didukung. */
export function attachTypeOf(file: File): "IMAGE" | "PDF" | null {
  if (ATTACH_IMG_TYPES.includes(file.type)) return "IMAGE";
  if (file.type === ATTACH_PDF_TYPE) return "PDF";
  return null;
}

interface AttachmentPickerProps {
  files: File[];
  onChange: (files: File[]) => void;
  onError: (msg: string | null) => void;
}

export function AttachmentPicker({ files, onChange, onError }: AttachmentPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    onError(null);
    const next = [...files];
    for (const f of Array.from(incoming)) {
      if (next.length >= ATTACH_MAX_FILES) { onError(`Maksimal ${ATTACH_MAX_FILES} lampiran.`); break; }
      if (!attachTypeOf(f)) { onError("Hanya gambar (JPG/PNG/WebP) atau PDF."); continue; }
      if (f.size > ATTACH_MAX_BYTES) { onError("Ukuran tiap file maks 3 MB."); continue; }
      next.push(f);
    }
    onChange(next);
  };

  const removeAt = (i: number) => onChange(files.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-2">
      {files.map((f, i) => {
        const kind = attachTypeOf(f);
        return (
          <div key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-[10px] border border-border bg-surface-card px-3 py-2">
            <span className={`w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0 ${kind === "IMAGE" ? "bg-teal-light" : "bg-red-light"}`}>
              {kind === "IMAGE" ? <ImagePlus size={16} className="text-teal-dark" /> : <FileText size={16} className="text-red-dark" />}
            </span>
            <span className="flex-1 min-w-0 text-[12px] text-ink truncate">{f.name}</span>
            <button type="button" aria-label="Hapus lampiran" onClick={() => removeAt(i)} className="w-7 h-7 rounded-[8px] flex items-center justify-center text-ink-muted hover:text-red-dark hover:bg-red-light transition-colors cursor-pointer flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        );
      })}
      {files.length < ATTACH_MAX_FILES && (
        <button type="button" onClick={() => inputRef.current?.click()} className="h-10 rounded-[10px] border border-dashed border-border text-[12px] font-bold text-ink-secondary hover:bg-surface-soft transition-colors cursor-pointer">
          + Tambah lampiran ({files.length}/{ATTACH_MAX_FILES})
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx eslint components/materi/AttachmentPicker.tsx`
Expected: tsc `No errors found`; eslint `No issues found`.

- [ ] **Step 3: Commit**

```bash
git add components/materi/AttachmentPicker.tsx
git commit -m "feat: add AttachmentPicker for materi"
```

---

### Task 7: Service materi + rewrite halaman daftar (dilakukan bersama agar tsc tetap hijau)

**Files:**
- Modify: `lib/services/teacher.ts:329-362` (bagian "Materi")
- Modify: `app/teacher/kelas/[id]/materi/page.tsx` (rewrite penuh)

- [ ] **Step 1: Ganti bagian Materi di `lib/services/teacher.ts`**

Ganti seluruh blok dari `// ── Materi (feed datar...)` sampai sebelum `// ── Export ──` dengan:
```ts
// ── Materi (CMS: judul + isi rich-text + lampiran) ───────────────────────────

export type MateriType = "IMAGE" | "PDF";

export interface MateriAttachment {
  id?: string;
  type: MateriType;
  content: string; // base64 data URL (kirim) / URL (baca)
  fileName: string;
}

export interface MateriListItem {
  id: string;
  title: string;
  excerpt: string;
  attachmentCount: number;
  createdAt: string;
}

export interface MateriItem {
  id: string;
  title: string;
  body: string; // HTML
  attachments: MateriAttachment[];
  createdAt: string;
}

export interface CreateMateriPayload {
  title: string;
  body: string;
  attachments: { type: MateriType; content: string; fileName: string }[];
}

export function getTeacherMateri(classSubjectId: string): Promise<MateriListItem[]> {
  return apiFetch<MateriListItem[]>(`/teacher/subjects/${classSubjectId}/materi`);
}

export function getTeacherMateriDetail(classSubjectId: string, materiId: string): Promise<MateriItem> {
  return apiFetch<MateriItem>(`/teacher/subjects/${classSubjectId}/materi/${materiId}`);
}

export function createTeacherMateri(classSubjectId: string, payload: CreateMateriPayload): Promise<MateriItem> {
  return apiFetch<MateriItem>(`/teacher/subjects/${classSubjectId}/materi`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteTeacherMateri(classSubjectId: string, materiId: string): Promise<void> {
  return apiFetch<void>(`/teacher/subjects/${classSubjectId}/materi/${materiId}`, {
    method: "DELETE",
  });
}
```

- [ ] **Step 2: Rewrite `app/teacher/kelas/[id]/materi/page.tsx`**

Ganti seluruh isi file dengan:
```tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Paperclip, Plus } from "lucide-react";
import { getTeacherClassSubjects, getTeacherMateri } from "@/lib/services/teacher";
import type { TeacherClassSubject, MateriListItem } from "@/lib/services/teacher";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function TeacherMateriPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [classSubject, setClassSubject] = useState<TeacherClassSubject | null>(null);
  const [materi, setMateri] = useState<MateriListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getTeacherClassSubjects(), getTeacherMateri(id)])
      .then(([all, items]) => {
        const found = all.find((cs) => cs.id === id) ?? null;
        if (!found) setError("Kelas-mapel tidak ditemukan.");
        setClassSubject(found);
        setMateri(items);
      })
      .catch((e) => setError(e?.message ?? "Gagal memuat materi."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>;
  }
  if (error || !classSubject) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-[13px] text-ink-muted">
        <p className="mb-3">{error ?? "Tidak ada data."}</p>
        <button onClick={() => router.back()} className="text-brand-blue font-bold cursor-pointer">Kembali</button>
      </div>
    );
  }

  return (
    <>
      <header className="bg-surface-card border-b border-border px-3.5 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} aria-label="Kembali" className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer flex-shrink-0">
          <ArrowLeft size={18} className="text-ink" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-extrabold text-ink truncate">
            Materi Pelajaran <span className="text-ink-muted font-bold">({materi.length})</span>
          </h3>
          <p className="text-[11px] text-ink-muted truncate">{classSubject.subject.name} • {classSubject.class.name}</p>
        </div>
        <button onClick={() => router.push(`/teacher/kelas/${id}/materi/buat`)} aria-label="Tambah materi" className="w-9 h-9 rounded-[10px] bg-brand-blue text-white flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform cursor-pointer">
          <Plus size={18} />
        </button>
      </header>

      <div className="px-3.5 pt-3 pb-8">
        {materi.length === 0 ? (
          <div className="card p-8 flex flex-col items-center text-center gap-2 mt-2">
            <div className="w-14 h-14 rounded-2xl bg-surface-soft flex items-center justify-center mb-1">
              <FileText size={24} className="text-ink-muted" />
            </div>
            <p className="text-[14px] font-extrabold text-ink">Belum ada materi</p>
            <p className="text-[12px] text-ink-muted max-w-[240px] leading-relaxed">
              Ketuk tombol <span className="font-bold text-brand-blue">+</span> untuk membuat materi pelajaran.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {materi.map((m) => (
              <button key={m.id} onClick={() => router.push(`/teacher/kelas/${id}/materi/${m.id}`)} className="card p-3.5 text-left hover:bg-surface-soft/50 transition-colors cursor-pointer">
                <div className="text-[14px] font-extrabold text-ink leading-snug">{m.title}</div>
                {m.excerpt && <p className="text-[12px] text-ink-muted mt-1 line-clamp-2">{m.excerpt}</p>}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-ink-muted">
                  {m.attachmentCount > 0 && (
                    <span className="flex items-center gap-1"><Paperclip size={11} /> {m.attachmentCount} lampiran</span>
                  )}
                  <span>{formatDate(m.createdAt)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npx eslint "lib/services/teacher.ts" "app/teacher/kelas/[id]/materi/page.tsx"`
Expected: tsc `No errors found`; eslint `No issues found`.

- [ ] **Step 4: Commit**

```bash
git add lib/services/teacher.ts "app/teacher/kelas/[id]/materi/page.tsx"
git commit -m "feat: materi list as CMS entries (title + excerpt + attachment count)"
```

---

### Task 8: Halaman buat materi

**Files:**
- Create: `app/teacher/kelas/[id]/materi/buat/page.tsx`

- [ ] **Step 1: Buat file**

```tsx
"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { createTeacherMateri } from "@/lib/services/teacher";
import { isApiError } from "@/lib/api";
import { readAsDataUrl } from "@/lib/files";
import { RichTextEditor } from "@/components/materi/RichTextEditor";
import { AttachmentPicker, attachTypeOf } from "@/components/materi/AttachmentPicker";

/** Anggap body kosong bila tidak ada teks setelah tag dilucuti. */
function htmlIsEmpty(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim() === "";
}

export default function TeacherMateriBuatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = title.trim() !== "" && !htmlIsEmpty(body) && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const attachments = await Promise.all(
        files.map(async (f) => ({
          type: attachTypeOf(f) as "IMAGE" | "PDF",
          content: await readAsDataUrl(f),
          fileName: f.name,
        })),
      );
      await createTeacherMateri(id, { title: title.trim(), body, attachments });
      router.push(`/teacher/kelas/${id}/materi`);
    } catch (err) {
      const codeMap: Record<string, string> = {
        FILE_TOO_LARGE: "Ada lampiran melebihi 3 MB.",
        INVALID_FILE_TYPE: "Ada lampiran dengan tipe tidak didukung.",
        PAYLOAD_TOO_LARGE: "Total lampiran terlalu besar.",
      };
      setError(isApiError(err) ? (codeMap[err.code] ?? err.message) : "Gagal menyimpan materi.");
      setSaving(false);
    }
  };

  return (
    <>
      <header className="bg-surface-card border-b border-border px-3.5 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} aria-label="Kembali" className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer flex-shrink-0">
          <ArrowLeft size={18} className="text-ink" />
        </button>
        <h3 className="text-[14px] font-extrabold text-ink flex-1">Materi Baru</h3>
      </header>

      <div className="px-3.5 pt-3.5 pb-28 flex flex-col gap-3.5">
        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Judul *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Bab 3 — Tata Cara Wudhu" className="w-full h-11 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue" autoFocus />
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Isi *</label>
          <RichTextEditor value={body} onChange={setBody} />
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-ink mb-1.5">Lampiran (opsional)</label>
          <AttachmentPicker files={files} onChange={setFiles} onError={setAttachError} />
          {attachError && <p className="text-[11px] font-bold text-red-dark mt-1.5">{attachError}</p>}
        </div>

        {error && <div className="text-[12px] text-red-dark bg-red-light rounded-[10px] px-3 py-2">{error}</div>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:pl-64 bg-surface-card border-t border-border px-3.5 py-3" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
        <div className="lg:max-w-[1120px] lg:mx-auto">
          <button onClick={handleSave} disabled={!canSave} className="w-full h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Menyimpan..." : "Simpan Materi"}
          </button>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx eslint "app/teacher/kelas/[id]/materi/buat/page.tsx"`
Expected: tsc `No errors found`; eslint `No issues found`.

- [ ] **Step 3: Commit**

```bash
git add "app/teacher/kelas/[id]/materi/buat/page.tsx"
git commit -m "feat: add create-materi page (title + rich text + attachments)"
```

---

### Task 9: Halaman detail materi

**Files:**
- Create: `app/teacher/kelas/[id]/materi/[materiId]/page.tsx`

- [ ] **Step 1: Buat file**

```tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Loader2, Trash2 } from "lucide-react";
import { getTeacherMateriDetail, deleteTeacherMateri } from "@/lib/services/teacher";
import type { MateriItem } from "@/lib/services/teacher";
import { RichContent } from "@/components/materi/RichContent";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function TeacherMateriDetailPage() {
  const { id, materiId } = useParams<{ id: string; materiId: string }>();
  const router = useRouter();

  const [materi, setMateri] = useState<MateriItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getTeacherMateriDetail(id, materiId)
      .then(setMateri)
      .catch(() => setError("Gagal memuat materi."))
      .finally(() => setLoading(false));
  }, [id, materiId]);

  const handleDelete = async () => {
    if (deleting || !confirm("Hapus materi ini?")) return;
    setDeleting(true);
    try {
      await deleteTeacherMateri(id, materiId);
      router.push(`/teacher/kelas/${id}/materi`);
    } catch {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>;
  }
  if (error || !materi) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-[13px] text-ink-muted">
        <p className="mb-3">{error ?? "Tidak ada data."}</p>
        <button onClick={() => router.back()} className="text-brand-blue font-bold cursor-pointer">Kembali</button>
      </div>
    );
  }

  return (
    <>
      <header className="bg-surface-card border-b border-border px-3.5 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} aria-label="Kembali" className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer flex-shrink-0">
          <ArrowLeft size={18} className="text-ink" />
        </button>
        <h3 className="text-[14px] font-extrabold text-ink flex-1 truncate">Detail Materi</h3>
        <button onClick={handleDelete} disabled={deleting} aria-label="Hapus materi" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-ink-muted hover:text-red-dark hover:bg-red-light transition-colors cursor-pointer flex-shrink-0 disabled:opacity-50">
          {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
        </button>
      </header>

      <div className="px-3.5 pt-4 pb-10">
        <h1 className="text-[19px] font-extrabold text-ink leading-snug">{materi.title}</h1>
        <p className="text-[11px] text-ink-muted mt-1 mb-4">{formatDate(materi.createdAt)}</p>

        <RichContent html={materi.body} />

        {materi.attachments.length > 0 && (
          <div className="mt-6">
            <h2 className="text-[13px] font-extrabold text-ink mb-2.5">Lampiran ({materi.attachments.length})</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
              {materi.attachments.map((a) =>
                a.type === "IMAGE" ? (
                  <a key={a.id ?? a.fileName} href={a.content} target="_blank" rel="noopener noreferrer" className="block rounded-[12px] overflow-hidden border border-border aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.content} alt={a.fileName} loading="lazy" className="w-full h-full object-cover" />
                  </a>
                ) : (
                  <a key={a.id ?? a.fileName} href={a.content} target="_blank" rel="noopener noreferrer" download={a.fileName} className="flex items-center gap-2.5 rounded-[12px] border border-border bg-surface-card px-3 py-3 hover:bg-surface-soft transition-colors">
                    <span className="w-9 h-9 rounded-[8px] bg-red-light flex items-center justify-center flex-shrink-0">
                      <FileText size={17} className="text-red-dark" />
                    </span>
                    <span className="text-[12px] font-bold text-ink truncate">{a.fileName}</span>
                  </a>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx eslint "app/teacher/kelas/[id]/materi/[materiId]/page.tsx"`
Expected: tsc `No errors found`; eslint `No issues found`.

- [ ] **Step 3: Commit**

```bash
git add "app/teacher/kelas/[id]/materi/[materiId]/page.tsx"
git commit -m "feat: add materi detail page (render body + attachments)"
```

---

### Task 10: Verifikasi akhir & manual QA

**Files:** (tidak ada perubahan kode; gerbang menyeluruh)

- [ ] **Step 1: Lint & typecheck penuh**

Run: `npx tsc --noEmit && npx eslint .`
Expected: keduanya bersih.

- [ ] **Step 2: Build produksi**

Run: `npx next build`
Expected: `Compiled successfully`; rute baru muncul:
`/teacher/kelas/[id]/materi`, `/teacher/kelas/[id]/materi/buat`, `/teacher/kelas/[id]/materi/[materiId]`.

- [ ] **Step 3: QA manual (perlu BE materi versi baru aktif)**

Jalankan `pnpm dev`, login guru, buka sebuah kelas-mapel → Materi:
- Buat materi **judul + isi** tanpa lampiran → tersimpan, muncul di daftar.
- Buat materi dengan **1 gambar** dan dengan **campuran 5 file** → tersimpan; detail merender isi + galeri.
- Coba tambah **file ke-6** → ditolak ("Maksimal 5 lampiran").
- Coba **>3 MB** atau **mime salah** (mis. .docx) → ditolak dengan pesan.
- Editor: bold/italic/heading/list/link berfungsi; isi kosong → tombol Simpan nonaktif.
- Detail: gambar bisa diklik (tab baru), PDF terbuka/terunduh; tombol **hapus** menghapus & kembali ke daftar.
- Cek lebar desktop (≥1024px): bar simpan tidak tertutup sidebar (`lg:pl-64`).

- [ ] **Step 4: Commit (jika ada penyesuaian kecil dari QA)**

```bash
git add -A
git commit -m "chore: materi CMS final polish"
```

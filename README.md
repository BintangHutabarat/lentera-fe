# Lentera

**Lentera** adalah Learning Management System (LMS) mobile-first untuk siswa SMA di Indonesia. Dibangun sebagai Progressive Web App (PWA) agar bisa diakses dari smartphone tanpa perlu install dari app store, dengan UI dalam Bahasa Indonesia yang ringan dan ramah untuk koneksi terbatas.

Repo ini adalah **frontend**. Backend (NestJS + Prisma + PostgreSQL) ada di repo terpisah — lihat `docs/backend-context.md` untuk spesifikasinya.

## Fitur

- **Beranda** — ringkasan XP, statistik (tugas selesai, rata-rata nilai, kehadiran), mata pelajaran aktif, tugas mendekati deadline, jadwal hari ini, dan leaderboard
- **Pelajaran** — daftar mata pelajaran beserta progres bab
- **Tugas** — list tugas dengan urgency badge + halaman detail
- **Quiz** — pengerjaan kuis dengan timer countdown, palette navigasi soal, dan auto-submit saat waktu habis
- **Forum** — ruang diskusi siswa
- **Profil** — info siswa, capaian, dan pengaturan akun

Phase 1 fokus ke role **siswa**; role **guru** & **admin** menyusul setelah BE auth siap.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** dengan `@theme` di `globals.css`
- **lucide-react** untuk icon
- File-based icon convention (`app/icon.tsx`, `app/apple-icon.tsx`) + `manifest.json` untuk PWA
- Saat ini masih pakai mock data di `lib/mock-data.ts` — akan di-swap ke real API saat BE siap

> ⚠️ Next.js 16 punya breaking changes dari versi sebelumnya. Sebelum nulis kode, baca dulu doc terkait di `node_modules/next/dist/docs/`.

## Struktur folder

```
app/
  layout.tsx          # root layout + metadata PWA
  icon.tsx            # 192x192 app icon (ImageResponse)
  apple-icon.tsx      # 180x180 apple-touch icon
  student/
    beranda/          # dashboard siswa
    pelajaran/        # daftar mata pelajaran
    tugas/            # list + detail tugas
    quiz/             # quiz player
    forum/            # diskusi
    profil/           # profil siswa
components/ui/        # Avatar, XPBar, StatCard, ProgressBar, dll
lib/
  mock-data.ts        # data dummy (sementara)
  utils.ts            # color map, urgency styles
  icons.ts            # mapping subject → icon
types/                # tipe data shared
docs/
  backend-context.md  # spec BE (NestJS + Prisma + session+Redis)
public/
  manifest.json       # PWA manifest
```

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) — secara default akan redirect ke `/student/beranda`.

### Script lain

```bash
npm run build    # production build
npm run start    # jalanin hasil build
npm run lint     # ESLint
```

## Roadmap singkat

1. ✅ FE mockup semua page siswa (mock data)
2. 🔜 BE repo: AUTH module (session cookie + Redis, RBAC student/teacher/admin)
3. 🔜 Swap mock → real API, login page (student/staff)
4. 🔜 Modul guru: create tugas, quiz, materi
5. 🔜 Modul admin: CRUD user, kelas, sekolah

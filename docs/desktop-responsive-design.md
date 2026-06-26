# Desktop Responsive — Design Thinking

> Dokumen ini menjelaskan **alasan UX/UI** di balik revisi tampilan desktop Lentera
> (revisi klien: _"komponen terlalu kecil di ukuran desktop"_), bukan sekadar daftar
> perubahan kode. Tujuannya agar keputusan desain bisa ditelusuri, dipertahankan, dan
> dilanjutkan secara konsisten ke halaman-halaman berikutnya.

- **Status:** Fase 1 selesai (shell global + komponen inti + halaman flagship Beranda)
- **Tanggal:** 2026-06-25
- **Lingkup:** Frontend (`lentera-fe`), seluruh role (Santri, Guru, Admin, Kepala Sekolah)

---

## 1. Masalah (Problem Framing)

Lentera dibangun **mobile-first 100%**. Itu keputusan yang benar — mayoritas santri & guru
mengakses lewat HP. Tapi konsekuensinya muncul saat dibuka di layar desktop:

| Gejala yang dilaporkan klien | Akar penyebab teknis |
| --- | --- |
| "Komponennya kecil-kecil" | Ukuran font di-_hardcode_ dalam piksel HP (`text-[9px]`–`text-[12px]`), tidak pernah naik di layar besar |
| "Berantakan / kosong di samping" | Tidak ada **container max-width**. Konten me-_stretch_ edge-to-edge dari 0 sampai 1920px |
| "Kayak HP digedein" | Navigasi memakai **bottom bar** (pola HP) yang melebar penuh selebar monitor |
| "Sepi / banyak ruang kosong" | Grid tetap 2 kolom walau layar muat 4 kolom — _density_ rendah, mata harus menyapu jauh |

Inti masalahnya **bukan** "desainnya jelek", tapi **layout yang sama dipaksakan ke dua
konteks yang sangat berbeda**. Layar HP ±390px dan monitor ±1440px butuh perlakuan beda.

### Kenapa "komponen kecil" itu terjadi secara teknis

Tailwind arbitrary value seperti `text-[11px]` menghasilkan piksel absolut. 11px di layar
HP (kerapatan tinggi, jarak baca ±30cm) terasa pas; 11px yang sama di monitor (jarak baca
±60cm) terasa mungil. Tanpa _breakpoint_ `lg:`, angka itu tidak pernah menyesuaikan.

---

## 2. Prinsip Desain (Design Principles)

Empat prinsip yang memandu seluruh keputusan di bawah:

1. **Mobile tidak boleh berubah (do no harm).**
   Tampilan HP sudah disetujui & dipakai. _Setiap_ perubahan diberi prefix breakpoint
   `lg:` sehingga hanya aktif di ≥1024px. Base class (mobile) tidak disentuh.

2. **Lebar itu sumber daya, bukan kanvas kosong.**
   Ruang horizontal ekstra di desktop dipakai untuk **navigasi permanen** + **density
   lebih tinggi** (lebih banyak kolom), bukan dibiarkan jadi gutter raksasa, dan bukan pula
   diisi dengan meregangkan komponen HP.

3. **Satu sumber kebenaran (single source of truth).**
   Item navigasi, container, dan skala tipografi didefinisikan sekali, dipakai semua role.
   Mencegah desktop & mobile "bercabang" dan jadi tidak konsisten.

4. **Tingkatkan dari komponen, bukan per-halaman.**
   Memperbaiki primitif bersama (`StatCard`, `PageTopbar`) memberi efek ke _semua_
   halaman sekaligus — _leverage_ tertinggi dengan risiko terkecil.

---

## 3. Keputusan Arsitektur (yang dipilih & yang ditolak)

### 3a. Pola layout desktop — kenapa **sidebar + container terpusat**

Tiga opsi dipertimbangkan:

| Opsi | Deskripsi | Putusan |
| --- | --- | --- |
| **A. Stretch** (biarkan apa adanya) | Konten full-bleed sampai 1920px | ❌ Justru ini sumber masalahnya |
| **B. Frame terpusat** | Bungkus app jadi kolom sempit di tengah, sisanya background | ⚠️ Aman tapi boros ruang; klien akan tetap merasa "kecil" karena konten terjebak di kolom sempit |
| **C. Sidebar + container** | Rail navigasi kiri permanen + konten terpusat max-width | ✅ **Dipilih** |

**Alasan memilih C:** di desktop, _navigasi yang selalu terlihat_ (sidebar) adalah pola
yang familiar untuk aplikasi produktivitas (LMS, dashboard). Bottom bar menyembunyikan
struktur dan membuang ruang vertikal. Sidebar:

- Mengisi ruang kiri dengan fungsi nyata (navigasi + identitas brand + label role).
- Menyisakan area konten dengan lebar terkendali (≤1120px) → baris teks tidak terlalu
  panjang (prinsip _measure_: 50–75 karakter per baris tetap terbaca).
- Menyatukan "di mana saya" (active state) yang lebih jelas dari sekadar ikon kecil.

### 3b. Breakpoint tunggal: `lg` (1024px)

Kita pakai **satu** titik ganti besar, bukan banyak breakpoint kecil:

- `< lg` → **mode HP**: bottom nav, full-bleed, tipografi kecil. (tidak berubah)
- `≥ lg` → **mode desktop**: sidebar, container terpusat, tipografi naik, grid melebar.

Alasan: tablet & HP besar tetap nyaman dengan layout HP; transisi ke "mode aplikasi
desktop" hanya masuk akal saat benar-benar ada ruang untuk sidebar (≥1024px). Satu
breakpoint = lebih sedikit _state_ untuk diuji & dipelihara.

### 3c. Lebar container 1120px

- Sidebar 256px (`w-64`) — cukup untuk ikon + label tanpa menyempit.
- Konten max **1120px**, di-_center_ pada ruang sisa → di monitor 1440px+ tetap ada
  napas di kanan, di 1280px nyaris penuh. Mencegah baris terlalu lebar (kelelahan baca).

---

## 4. Skala Tipografi & Spasi Responsif

Strategi: **naikkan ukuran di `lg:` pada titik dengan leverage tertinggi** (komponen
bersama), lalu pada halaman per kebutuhan.

| Elemen | Mobile (tetap) | Desktop (`lg:`) | Alasan |
| --- | --- | --- | --- |
| Judul `PageTopbar` | 15px | 18px | Hirarki header lebih tegas di layar lebar |
| Angka `StatCard` | 22px | 28px | Angka adalah _hero_ dari kartu statistik — harus terbaca dari jauh |
| Label `StatCard` | 11px | 13px | Keterbacaan jarak baca desktop |
| Heading section | 14px | 17px | Memperjelas pemisahan antar-blok |
| Sapaan hero (Beranda) | 19px | 26px | Hero harus terasa "besar" & ramah di desktop |
| Ikon quick-action | 20px | 26px | Target visual seimbang dengan kartu yang membesar |

Pola penulisan yang dipakai: `text-[11px] lg:text-[13px]`. Base = HP, override = desktop.

---

## 5. Density (Tata Letak Grid)

Lebar desktop dipakai untuk **menambah kolom**, bukan memperbesar gap:

| Blok | Mobile | Desktop | Alasan |
| --- | --- | --- | --- |
| Kartu statistik | `grid-cols-2` | `lg:grid-cols-4` | 4 metrik sejajar = 1 _scan_ mata, bukan 2 baris |
| Quick actions | `grid-cols-4` | tetap 4 (kartu membesar) | Sudah optimal; cukup besarkan kartunya |
| Jadwal & Peringkat | `grid-cols-2` | tetap 2 | Sudah memanfaatkan lebar |

Prinsip Gestalt _proximity_: menaikkan jumlah kolom mempererat hubungan antar-item
sejenis dan memperpendek jarak sapuan mata — inilah yang menghilangkan kesan "sepi".

---

## 6. Implementasi (peta file)

| Berkas | Peran |
| --- | --- |
| `lib/nav-config.ts` | **Single source of truth** item navigasi per role (dipakai sidebar + bottom nav) |
| `components/layout/AppSidebar.tsx` | Rail navigasi desktop (`hidden lg:flex`, fixed kiri 256px) |
| `components/layout/AppShell.tsx` | Frame responsif bersama: sidebar + `<main>` ter-_offset_ & container terpusat |
| `app/{student,teacher,admin,principal}/layout.tsx` | Memakai `AppShell` — 4 role konsisten |
| `components/layout/*BottomNav.tsx` | Ditambah `lg:hidden` (mode HP saja) + ambil item dari `nav-config` |
| `components/ui/StatCard.tsx` | Skala `lg:` → otomatis membesar di semua halaman |
| `components/layout/PageTopbar.tsx` | Skala `lg:` → header semua sub-halaman membesar |
| `app/student/beranda/page.tsx` | Halaman **flagship**: hero kontainer, grid 4 kolom, tipografi `lg:` |

### Cara kerja singkat `AppShell`

```
< lg : [ konten full-bleed ........................ ]   + [bottom nav]
≥ lg : [sidebar 256px][ konten max-1120px terpusat ]   (bottom nav disembunyikan)
```

---

## 7. Rencana Lanjutan (Rollout)

Fase 1 sudah memberi perbaikan _struktural_ ke **semua** halaman (lebar terkendali +
sidebar + primitif membesar). Halaman yang belum dapat sentuhan `lg:` khusus tetap rapi,
hanya belum "kaya desktop". Urutan upgrade berikutnya berdasar trafik:

1. **Santri:** Pelajaran (list), Tugas, Detail Pelajaran/Materi
2. **Guru:** Kelas (list), Detail Kelas, Materi, Buat Tugas/Quiz
3. **Admin & Kepala Sekolah:** Beranda/dashboard, tabel data (kandidat layout multi-kolom)

**Pola baku saat upgrade halaman:**
- Bungkus daftar panjang dengan grid `lg:grid-cols-2`/`3` bila itemnya kartu.
- Naikkan heading & teks utama dengan `lg:text-[...]` mengikuti skala di §4.
- Jangan ubah base class — hanya tambah varian `lg:`.
- Manfaatkan lebar untuk layout 2-kolom (konten utama + rail ringkas) bila relevan.

---

## 8. Pengujian & QA

- **Wajib uji 3 lebar:** 390px (HP), 768px (tablet → harus masih mode HP), 1440px (desktop).
- Pastikan **mobile identik** dengan sebelumnya (regression check pada 390px).
- Cek sidebar active-state pada perpindahan route.
- Cek halaman dengan header `sticky` tetap menempel benar di dalam container.

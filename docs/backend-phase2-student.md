# Lentera LMS — Backend Phase 2: Modul Data Siswa

Dokumen ini lanjutan dari `backend-context.md` (Phase 1 = AUTH). Phase 2 ngecover **semua endpoint data yang dibutuhin role STUDENT** supaya FE bisa swap dari `lib/mock-data.ts` ke real API.

**Prerequisite**: AUTH module (Phase 1) sudah jalan. Semua endpoint di sini **wajib auth via session cookie** dan default-nya scope ke `req.session.userId` (data milik user yang login).

**Status**: Draft. Override bebas sebelum coding.

---

## 1. Scope Phase 2

**In scope:**
- Subject + Chapter (materi & progress)
- Schedule (jadwal hari ini & seminggu)
- Assignment (list, detail, submit, lihat feedback)
- Quiz (list, ambil soal, submit, hasil + review)
- Forum (list, detail thread, reply, like, save)
- Leaderboard (top-N XP di kelas)
- Badge / achievement
- Student stats (XP, level, attendance, avg score)
- Notification (bell icon)
- File upload (untuk submission tugas + lampiran)

**Out of scope (Phase 3+):**
- Endpoint mutasi dari sisi guru (bikin tugas/quiz/materi) → `backend-phase3-teacher.md` nanti
- Admin CRUD user/kelas → `backend-phase4-admin.md` nanti
- Realtime (websocket) — semua REST polling dulu
- Chat 1-on-1, video call, live class
- Analytics dashboard guru

---

## 2. Prinsip & Konvensi Umum

Pelajari `backend-context.md` dulu. Tambahan untuk Phase 2:

### 2.1 Auth & scoping
- Semua endpoint dilindungi `SessionAuthGuard`.
- Role default = `STUDENT`. Endpoint yang juga boleh diakses guru/admin di-anotasi `@Roles('STUDENT', 'TEACHER')`.
- "Saya/me" endpoint **selalu** ambil identitas dari `req.session.userId`, **jangan** dari query/body. Anti horizontal escalation.

### 2.2 Path & versioning
- Base path: `/api/v1`
- Pola "milik saya": `GET /students/me/...` (resource owned by current user)
- Pola koleksi: `GET /subjects`, `GET /assignments` (filtered by kelas siswa)
- Pola detail: `GET /assignments/:id`

### 2.3 Paging
- Default: tidak paging (list dataset kecil — 1 kelas SMA ≤ ~20 tugas aktif, ~10 mapel).
- Endpoint yang potensial besar (forum, notifikasi): cursor-based.
  ```
  GET /forum/posts?cursor=<opaque>&limit=20
  → { items: [...], nextCursor: "..." | null }
  ```
- **Jangan** offset-based: forum dipost realtime, offset bakal skip/duplicate.

### 2.4 Error format
Pakai exception filter yang sama dari Phase 1. Tambahan kode error spesifik per module di section masing-masing.

### 2.5 Time & timezone
- Semua timestamp di response: **ISO-8601 UTC** (`2026-05-28T07:30:00.000Z`).
- FE yang format ke `WIB` / "5 menit lalu" / "Hari ini" — JANGAN format di BE.
- Field "due date" assignment dll: ISO-8601, BE simpan sebagai `DateTime`. Label kayak "Hari ini" / "Besok" / "3 hari lagi" → derive di FE.

### 2.6 Money/score format
- Skor: integer 0–100. Jangan float.
- XP: integer.

### 2.7 ID format
- CUID (sama dengan Phase 1 Prisma).
- FE jangan parse semantic — treat sebagai opaque string.

### 2.8 Caching policy
- `GET /students/me/profile`: 30s cache di Redis (gampang invalidate saat XP berubah).
- `GET /subjects`, `GET /classes/:id/schedule`: 5 menit (jarang berubah).
- `GET /assignments`: no cache (status berubah saat siswa submit).
- `GET /forum/posts`: no cache, tapi posts list pakai `ETag` (304 kalau idle).

### 2.9 Rate limit
- Standar 60 req/menit per user untuk read endpoints.
- Write endpoints (submit assignment, post forum, submit quiz): 10 req/menit per user.
- Quiz submit: **1 req per session** (idempotent — lihat §6.4).

---

## 3. Data Model — Tambahan Prisma

Lanjutan dari schema di `backend-context.md` §5. Tambah:

```prisma
// ──────────────── Subject & Chapter ────────────────

model Subject {
  id          String   @id @default(cuid())
  schoolId    String
  school      School   @relation(fields: [schoolId], references: [id])
  name        String                       // "Matematika"
  shortName   String?                      // "MAT" (opsional, untuk badge)
  color       SubjectColor                 // enum cocok dgn FE
  iconKey     String                       // "math" — FE map ke icon (lihat lib/icons.ts)
  createdAt   DateTime @default(now())

  chapters    Chapter[]
  classOffers ClassSubject[]               // 1 subject bisa di banyak kelas
  assignments Assignment[]
  quizzes     Quiz[]

  @@unique([schoolId, name])
}

enum SubjectColor {
  BLUE
  TEAL
  YELLOW
  MINT
  RED
  PURPLE
}

model ClassSubject {
  id         String   @id @default(cuid())
  classId    String
  class      Class    @relation(fields: [classId], references: [id])
  subjectId  String
  subject    Subject  @relation(fields: [subjectId], references: [id])
  teacherId  String                          // teacher penanggung jawab
  teacher    Teacher  @relation(fields: [teacherId], references: [userId])

  @@unique([classId, subjectId])
}

model Chapter {
  id         String   @id @default(cuid())
  subjectId  String
  subject    Subject  @relation(fields: [subjectId], references: [id])
  order      Int                              // urutan tampilan
  title      String                           // "Persamaan Diferensial"
  content    String?  @db.Text               // markdown materi (Phase 2 opsional)

  progress   ChapterProgress[]

  @@unique([subjectId, order])
}

model ChapterProgress {
  id         String   @id @default(cuid())
  studentId  String
  student    Student  @relation(fields: [studentId], references: [userId])
  chapterId  String
  chapter    Chapter  @relation(fields: [chapterId], references: [id])
  completed  Boolean  @default(false)
  completedAt DateTime?

  @@unique([studentId, chapterId])
}

// ──────────────── Schedule ────────────────

model ScheduleSlot {
  id         String   @id @default(cuid())
  classId    String
  class      Class    @relation(fields: [classId], references: [id])
  subjectId  String
  subject    Subject  @relation(fields: [subjectId], references: [id])
  dayOfWeek  Int                              // 1=Senin .. 7=Minggu (ISO)
  timeStart  String                           // "07:30" — local time, no TZ
  timeEnd    String                           // "08:45"
  room       String

  @@index([classId, dayOfWeek])
}

// ──────────────── Assignment ────────────────

enum AssignmentType {
  ONLINE         // pilihan ganda online
  UPLOAD_FILE    // upload PDF/DOC/gambar
  ESSAY          // tulis di textarea
}

model Assignment {
  id             String   @id @default(cuid())
  classSubjectId String                       // assignment dibikin per ClassSubject
  classSubject   ClassSubject @relation(fields: [classSubjectId], references: [id])
  title          String
  description    String   @db.Text            // long text
  instructions   String[]                     // array of strings, ordered
  type           AssignmentType
  maxScore       Int      @default(100)
  totalItems     String?                      // "20 soal" / "Min 800 kata" — display only
  minWords       Int?                         // untuk type=ESSAY
  attachmentUrl  String?                      // signed URL ke S3/R2
  attachmentName String?
  attachmentSize Int?                         // bytes
  rubric         Json                         // [{ label, max, earned? }]
  dueAt          DateTime
  createdById    String                       // teacher.userId
  createdAt      DateTime @default(now())

  submissions    AssignmentSubmission[]

  @@index([classSubjectId, dueAt])
}

model AssignmentSubmission {
  id             String   @id @default(cuid())
  assignmentId   String
  assignment     Assignment @relation(fields: [assignmentId], references: [id])
  studentId      String
  student        Student  @relation(fields: [studentId], references: [userId])

  // Konten submission (one of)
  kind           SubmissionKind
  fileUrl        String?                      // kalau kind=FILE
  fileName       String?
  fileSize       Int?
  essayText      String?  @db.Text            // kalau kind=ESSAY

  noteFromStudent String? @db.Text
  submittedAt    DateTime @default(now())

  // Grading
  score          Int?                         // null = belum dinilai
  feedback       String?  @db.Text
  rubricBreakdown Json?                       // [{ label, max, earned }]
  gradedAt       DateTime?
  gradedById     String?                      // teacher.userId

  @@unique([assignmentId, studentId])         // 1 siswa = 1 submission per assignment
}

enum SubmissionKind {
  FILE
  ESSAY
  ONLINE_ANSWERS                                // untuk assignment type=ONLINE (jawaban pilgan)
}

// ──────────────── Quiz ────────────────

model Quiz {
  id             String   @id @default(cuid())
  classSubjectId String
  classSubject   ClassSubject @relation(fields: [classSubjectId], references: [id])
  title          String
  chapter        String                       // free text "Bab 5"
  durationMinutes Int                         // hard timer
  totalQuestions Int                          // denormalized count
  createdAt      DateTime @default(now())
  createdById    String

  questions      QuizQuestion[]
  sessions       QuizSession[]

  @@index([classSubjectId])
}

model QuizQuestion {
  id              String   @id @default(cuid())
  quizId          String
  quiz            Quiz     @relation(fields: [quizId], references: [id])
  order           Int
  text            String   @db.Text
  options         Json                        // [{ id: "a", text: "..." }]
  correctOptionId String                      // "a" | "b" | "c" | "d"
  explanation     String   @db.Text

  @@unique([quizId, order])
}

model QuizSession {
  id          String     @id @default(cuid())
  quizId      String
  quiz        Quiz       @relation(fields: [quizId], references: [id])
  studentId   String
  student     Student    @relation(fields: [studentId], references: [userId])

  startedAt   DateTime   @default(now())
  expiresAt   DateTime                        // startedAt + durationMinutes
  submittedAt DateTime?
  answers     Json?                           // { [questionId]: "a"|"b"|"c"|"d" }
  score       Int?                            // null sampai submit
  correctCount Int?
  stars       Int?                            // 1-5 derived from %

  @@index([studentId, quizId])
}

// ──────────────── Forum ────────────────

model ForumPost {
  id           String   @id @default(cuid())
  schoolId     String                          // scope forum per sekolah
  school       School   @relation(fields: [schoolId], references: [id])
  classId      String?                         // null = forum sekolah, isi = forum kelas
  authorId     String                          // user.id
  author       User     @relation(fields: [authorId], references: [id])
  subjectId    String?                         // optional tag
  subject      Subject? @relation(fields: [subjectId], references: [id])
  content      String   @db.Text               // markdown / plain
  isPinned     Boolean  @default(false)        // teacher dapat pin
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  replies      ForumReply[]
  likes        ForumLike[]
  saves        ForumSave[]

  @@index([schoolId, classId, createdAt])
}

model ForumReply {
  id          String   @id @default(cuid())
  postId      String
  post        ForumPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  content     String   @db.Text
  createdAt   DateTime @default(now())

  @@index([postId, createdAt])
}

model ForumLike {
  postId      String
  post        ForumPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId      String
  createdAt   DateTime  @default(now())

  @@id([postId, userId])
}

model ForumSave {
  postId      String
  post        ForumPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId      String
  createdAt   DateTime  @default(now())

  @@id([postId, userId])
}

// ──────────────── Badge ────────────────

model Badge {
  id          String   @id                     // pakai slug, bukan cuid: "top-kelas", "streak-7"
  label       String                           // "Top Kelas"
  iconEmoji   String                           // "🏆" — FE pakai apa adanya
  description String?
  criteria    String?                          // human-readable rule (untuk Phase 3 admin UI)
}

model StudentBadge {
  studentId   String
  student     Student  @relation(fields: [studentId], references: [userId])
  badgeId     String
  badge       Badge    @relation(fields: [badgeId], references: [id])
  earnedAt    DateTime @default(now())

  @@id([studentId, badgeId])
}

// ──────────────── Notification ────────────────

enum NotificationType {
  ASSIGNMENT_NEW
  ASSIGNMENT_GRADED
  ASSIGNMENT_DUE_SOON
  QUIZ_NEW
  FORUM_REPLY
  ANNOUNCEMENT
}

model Notification {
  id          String   @id @default(cuid())
  userId      String                            // recipient
  user        User     @relation(fields: [userId], references: [id])
  type        NotificationType
  title       String
  body        String?
  linkTo      String?                            // deep link "/student/tugas/a1"
  readAt      DateTime?
  createdAt   DateTime @default(now())

  @@index([userId, readAt, createdAt])
}
```

**Catatan model:**
- `Student.xp` & `Student.level` udah ada di Phase 1. Re-use, jangan duplicate.
- `Student.attendance` & `Student.avgScore` **bukan stored field**: derive on read (lihat §4.2).
- `rubric` di-store sebagai JSON (flexible), bukan tabel separate. Schema rubric: `[{ label: string, max: number, earned?: number }]`.
- `Quiz.totalQuestions` denormalized supaya list view ringan (gak perlu count tiap kali).
- Forum: cuma 1 level reply (no nested). Hindari rekursif yang ribet.

---

## 4. Module: Students (Stats & Profile)

Base path: `/api/v1/students/me`. Semua endpoint scope ke siswa yang login.

### 4.1 `GET /students/me/profile`
Lengkap profile siswa untuk halaman Beranda + Profil.

**Response 200:**
```json
{
  "id": "ckxxx",
  "name": "Rizky Aditya Pratama",
  "nis": "12345678",
  "class": { "id": "ckcl1", "name": "XII IPA 1", "gradeYear": 12 },
  "school": { "id": "cksc1", "name": "SMA Negeri 1 Jakarta", "code": "SMAN1JKT" },
  "level": 12,
  "xp": 1240,
  "xpMax": 1800,
  "avatar": null
}
```

**Catatan:**
- `xpMax` = XP yang dibutuhkan ke level berikutnya. Rumus: `xpMax(level) = 1000 + level * 100` (sementara — finalize di Phase 3).
- Endpoint ini **mirip** dengan `GET /auth/me` tapi spesifik student + lebih banyak field. Boleh BE share underlying service.

### 4.2 `GET /students/me/stats`
Stats untuk dashboard. Aggregate, computed on demand.

**Response 200:**
```json
{
  "attendance": 92,            // % kehadiran semester berjalan
  "avgScore": 87,              // rata-rata score semua assignment yang sudah dinilai
  "completedAssignments": { "done": 23, "total": 30, "percent": 78 },
  "weeklyDelta": {
    "avgScore": "+5",          // string biar bisa "+5" / "-2" / "0"
    "completed": "+5"
  }
}
```

- `attendance`: dari sistem absensi (Phase 3 — pre-populate dari seed Phase 2: hardcode 92).
- `avgScore`: `AVG(submission.score WHERE score IS NOT NULL)`.
- `weeklyDelta`: bandingkan dengan minggu sebelumnya. Phase 2 boleh hardcode dulu kalau seed data minim.

### 4.3 `GET /students/me/badges`
Daftar badge (earned + unearned).

**Response 200:**
```json
[
  { "id": "top-kelas",     "label": "Top Kelas",     "icon": "🏆", "earned": true,  "earnedAt": "2026-04-12T03:00:00.000Z" },
  { "id": "streak-7",      "label": "7 Hari Streak", "icon": "🔥", "earned": true,  "earnedAt": "2026-05-20T00:00:00.000Z" },
  { "id": "quiz-master",   "label": "Quiz Master",   "icon": "🎯", "earned": false, "earnedAt": null }
]
```

**Algo earned**: query `Badge` left join `StudentBadge WHERE studentId = me`. `earned = StudentBadge.studentId IS NOT NULL`.

### 4.4 `PATCH /students/me/avatar`
Upload/ganti avatar. Multipart `file`.

**Response 200:** `{ "avatar": "https://cdn.lentera.sch.id/avatars/ckxxx.jpg" }`

**Validation:** max 2MB, image only (jpg/png/webp).

---

## 5. Module: Subjects & Chapters

Base: `/api/v1/subjects`. Scope ke `ClassSubject` siswa yang login.

### 5.1 `GET /subjects`
List mapel siswa beserta progress per subject.

**Response 200:**
```json
[
  {
    "id": "ckss1",
    "name": "Matematika",
    "color": "blue",
    "icon": "math",
    "teacher": { "id": "ckt1", "name": "Pak Ahmad Fauzi", "title": "S.Pd" },
    "chaptersTotal": 7,
    "chaptersDone": 5,
    "progress": 72,
    "currentChapter": "Persamaan Diferensial"
  }
]
```

- `progress = round(chaptersDone / chaptersTotal * 100)`.
- `currentChapter` = chapter `ORDER BY order` pertama yang belum completed.

### 5.2 `GET /subjects/:id`
Detail subject + list chapter dengan progress masing-masing.

**Response 200:**
```json
{
  "id": "ckss1",
  "name": "Matematika",
  "color": "blue",
  "icon": "math",
  "teacher": { "id": "ckt1", "name": "Pak Ahmad Fauzi" },
  "chapters": [
    { "id": "ckch1", "order": 1, "title": "Limit Fungsi", "completed": true, "completedAt": "2026-02-10T..." },
    { "id": "ckch2", "order": 2, "title": "Turunan",      "completed": true, "completedAt": "..." },
    { "id": "ckch3", "order": 3, "title": "Persamaan Diferensial", "completed": false, "completedAt": null }
  ]
}
```

**Error:** `404 SUBJECT_NOT_ACCESSIBLE` kalau subject bukan milik kelas siswa.

### 5.3 `POST /subjects/chapters/:chapterId/complete`
Mark chapter selesai (siswa selesai baca materi).

**Response 204.** Idempotent — call 2x = OK, gak duplicate row (pakai `upsert`).

---

## 6. Module: Assignments

Base: `/api/v1/assignments`.

### 6.1 `GET /assignments`
List tugas untuk siswa (filtered ke `ClassSubject` siswa).

**Query params:**
- `status` (opt): `segera | belum | selesai | all` (default `all`)
- `subjectId` (opt)

**Response 200:**
```json
[
  {
    "id": "cka1",
    "title": "Latihan Soal Integral Tertentu",
    "subject": { "id": "ckss1", "name": "Matematika", "color": "blue" },
    "teacher": { "name": "Pak Ahmad" },
    "type": "ONLINE",
    "totalItems": "20 soal",
    "maxScore": 100,
    "dueAt": "2026-05-28T16:59:00.000Z",
    "status": "segera",
    "score": null
  }
]
```

**Derive `status` di BE:**
- `selesai` → ada submission AND `submittedAt IS NOT NULL`
- `segera` → `dueAt <= now + 48h` AND no submission
- `belum` → otherwise

**Catatan:** `dueUrgency` (today/tomorrow/soon/done) **derive di FE** dari `dueAt` — biar konsisten timezone client.

### 6.2 `GET /assignments/:id`
Detail tugas + submission siswa kalau ada.

**Response 200:**
```json
{
  "id": "cka1",
  "title": "...",
  "subject": { ... },
  "teacher": { "name": "Pak Ahmad" },
  "type": "UPLOAD_FILE",
  "description": "Kerjakan 20 soal pilihan ganda...",
  "instructions": ["Baca soal...", "Boleh kalkulator..."],
  "minWords": null,
  "attachment": { "name": "Template.pdf", "sizeKB": 248, "url": "https://..." },
  "rubric": [
    { "label": "Kelengkapan isi", "max": 30 },
    { "label": "Analisis", "max": 30 }
  ],
  "maxScore": 100,
  "dueAt": "...",
  "submission": {
    "kind": "FILE",
    "fileName": "tugas-rizky.pdf",
    "fileSizeKB": 1240,
    "fileUrl": "https://...",
    "essayText": null,
    "note": "...",
    "submittedAt": "...",
    "score": 90,
    "feedback": "Kerja bagus!",
    "feedbackFrom": "Bu Wati Rahayu",
    "rubricBreakdown": [
      { "label": "Kelengkapan isi", "max": 30, "earned": 28 }
    ]
  }
}
```

- `submission: null` kalau belum submit.
- `attachment.url`: signed URL (TTL 15 menit). FE re-fetch detail kalau expired.

### 6.3 `POST /assignments/:id/submit`
Submit tugas. Multipart untuk file, JSON untuk essay.

**Multipart (UPLOAD_FILE):**
- `file`: binary
- `note`: string (opsional)

**JSON (ESSAY):**
```json
{ "essayText": "...", "note": "..." }
```

**JSON (ONLINE):**
```json
{ "answers": { "qid1": "a", "qid2": "c" }, "note": null }
```

**Response 201:**
```json
{ "submittedAt": "2026-05-28T07:35:00.000Z" }
```

**Errors:**
- `400 INVALID_KIND` — kind submission tidak sesuai dengan `assignment.type`
- `400 FILE_TOO_LARGE` — max 10MB
- `400 INVALID_FILE_TYPE` — bukan PDF/DOC/DOCX/JPG/PNG
- `400 ESSAY_TOO_SHORT` — kurang dari `minWords`
- `409 ALREADY_SUBMITTED` — `@@unique([assignmentId, studentId])` kena
- `410 DUE_PASSED` — `dueAt < now` AND policy strict (lihat catatan)

**Catatan late submission:** policy default = **tetap terima** tapi flag `isLate = true` di submission. Guru lihat dan putuskan penalty. Phase 3 bisa per-assignment toggle "strict deadline".

---

## 7. Module: Quizzes

Base: `/api/v1/quizzes`.

**Konsep penting**: Quiz pakai konsep **session** untuk anti-cheating:
- Soal **tidak ditampilkan** sampai siswa "start" → bikin `QuizSession`
- Timer di-track **server-side** via `expiresAt`
- `correctOptionId` & `explanation` **TIDAK pernah** dikirim ke FE selama session aktif (cuma post-submit)
- Submit otomatis kalau client kirim `submit` lewat dari `expiresAt` → terima tapi truncate jawaban yang masuk setelah expiry

### 7.1 `GET /quizzes`
List quiz siswa.

**Response 200:**
```json
[
  {
    "id": "ckq1",
    "title": "Quiz Integral",
    "subject": { "id": "ckss1", "name": "Matematika", "color": "blue" },
    "chapter": "Bab 5",
    "totalQuestions": 15,
    "durationMinutes": 20,
    "completed": false,
    "lastScore": null,
    "lastStars": null
  }
]
```

- `completed` = ada `QuizSession` siswa ini dengan `submittedAt IS NOT NULL`.
- `lastScore` / `lastStars` = dari session paling baru.

### 7.2 `POST /quizzes/:id/start`
Mulai sesi quiz. Idempotent **per session aktif**.

**Behavior:**
- Kalau siswa udah punya `QuizSession` yang belum `submittedAt` dan `expiresAt > now`: return session lama (resume).
- Kalau session lama `expiresAt < now` dan belum submit: auto-finalize as submitted (force-submit pakai jawaban yang ada / kosong), lalu buat session baru.
- Kalau belum pernah start: buat session baru.

**Policy retake**: default **bisa retake** unlimited (FE tampilkan score tertinggi). Phase 3 bisa per-quiz toggle `maxAttempts`.

**Response 200:**
```json
{
  "sessionId": "cks1",
  "expiresAt": "2026-05-28T07:50:00.000Z",   // ⏰ server-side timer
  "durationSeconds": 1200,
  "questions": [
    {
      "id": "ckqq1",
      "order": 1,
      "text": "Hasil dari ∫ (3x² + 2x) dx adalah ...",
      "options": [
        { "id": "a", "text": "x³ + x² + C" },
        { "id": "b", "text": "x³ + 2x² + C" },
        { "id": "c", "text": "6x + 2 + C" },
        { "id": "d", "text": "3x³ + x² + C" }
      ]
    }
  ],
  "existingAnswers": { "ckqq1": "a" }          // resume support
}
```

⚠️ **JANGAN sertakan `correctOptionId` atau `explanation`** di response ini.

### 7.3 `PATCH /quizzes/sessions/:sessionId/answer`
Save jawaban progresif (optional, biar siswa gak hilang progress kalau koneksi putus).

**Request:**
```json
{ "questionId": "ckqq1", "optionId": "a" }
```

**Response 204.**

**Errors:**
- `403 NOT_OWNER` — session bukan milik user
- `410 SESSION_EXPIRED` — sudah lewat `expiresAt`
- `409 ALREADY_SUBMITTED`

### 7.4 `POST /quizzes/sessions/:sessionId/submit`
Submit final. **Server hitung skor**.

**Request:**
```json
{ "answers": { "ckqq1": "a", "ckqq2": "b" } }
```

**Response 200:**
```json
{
  "sessionId": "cks1",
  "score": 80,
  "correct": 12,
  "incorrect": 2,
  "skipped": 1,
  "total": 15,
  "stars": 4,
  "timeUsedSeconds": 850,
  "xpEarned": 120,
  "review": [
    {
      "questionId": "ckqq1",
      "text": "Hasil dari ...",
      "options": [...],
      "myAnswer": "a",
      "correctOptionId": "a",
      "isCorrect": true,
      "explanation": "∫ 3x² dx = x³ ..."
    }
  ]
}
```

- `stars`: `>=90%→5, >=80%→4, >=70%→3, >=60%→2, else 1` (sama dgn FE saat ini).
- `xpEarned`: `correct * 10` (sama dgn FE saat ini).
- **Side effect**: increment `Student.xp`, recompute `Student.level`, trigger badge check.
- **Idempotent**: panggil 2x → return hasil yang sama, gak double-XP.

**Errors:**
- `403 NOT_OWNER`
- `409 ALREADY_SUBMITTED` → return existing result, bukan error (idempotent)

### 7.5 `GET /quizzes/sessions/:sessionId`
Lihat hasil + review post-submit (refresh page). Sama shape dgn response submit.

**Error:** `404` kalau bukan milik user atau belum submit.

---

## 8. Module: Forum

Base: `/api/v1/forum`.

**Scope**: posts visible ke siswa = `schoolId match` AND (`classId match` OR `classId IS NULL` (forum sekolah)).

### 8.1 `GET /forum/posts`
**Query:**
- `subject` (opt): subject ID atau "umum"
- `cursor` (opt): pagination
- `limit` (opt, default 20, max 50)

**Response 200:**
```json
{
  "items": [
    {
      "id": "ckf1",
      "author": {
        "id": "cku1",
        "name": "Aysha Nabila",
        "initials": "AY",
        "role": "STUDENT",
        "avatarColor": "#E6F6FD"
      },
      "subject": { "id": "ckss3", "name": "Biologi", "color": "teal" },
      "content": "Halo teman-teman! ...",
      "createdAt": "2026-05-28T07:25:00.000Z",
      "likeCount": 12,
      "replyCount": 3,
      "likedByMe": false,
      "savedByMe": false,
      "isPinned": false
    }
  ],
  "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI2..."
}
```

- `avatarColor` derive dari hash `userId` → palette (jangan store di DB).
- `initials` derive dari `name`.
- `timeAgo` JANGAN format di BE — FE format dari `createdAt`.

### 8.2 `POST /forum/posts`
**Request:**
```json
{ "content": "...", "subjectId": "ckss1" }
```

**Response 201:** post object yang baru dibikin.

**Validation:**
- `content`: min 5, max 2000 char
- `subjectId`: opsional, harus subject milik kelas siswa kalau diisi

### 8.3 `GET /forum/posts/:id`
Detail post + replies.

**Response 200:**
```json
{
  "post": { ...same as list item... },
  "replies": [
    {
      "id": "ckfr1",
      "author": { ... },
      "content": "...",
      "createdAt": "..."
    }
  ]
}
```

### 8.4 `POST /forum/posts/:id/reply`
Request: `{ "content": "..." }`. Response 201 reply object.

### 8.5 `POST /forum/posts/:id/like` & `DELETE /forum/posts/:id/like`
Toggle like. Idempotent. Response 204.

### 8.6 `POST /forum/posts/:id/save` & `DELETE /forum/posts/:id/save`
Bookmark. Idempotent. Response 204.

### 8.7 `GET /forum/me/saved`
List saved posts user. Same shape sebagai `/forum/posts`.

---

## 9. Module: Schedule

Base: `/api/v1/schedule`.

### 9.1 `GET /schedule/today`
Jadwal hari ini buat siswa. Server timezone = Asia/Jakarta (WIB).

**Response 200:**
```json
[
  {
    "id": "cksc1",
    "subject": { "name": "Matematika", "color": "blue" },
    "room": "Ruang 3A",
    "timeStart": "07:30",
    "timeEnd": "08:45"
  }
]
```

### 9.2 `GET /schedule/week`
Jadwal seminggu (grouped by dayOfWeek).

**Response 200:**
```json
{
  "monday":    [ ... ],
  "tuesday":   [ ... ],
  "wednesday": [ ... ],
  "thursday":  [ ... ],
  "friday":    [ ... ],
  "saturday":  []
}
```

---

## 10. Module: Leaderboard

Base: `/api/v1/leaderboard`.

### 10.1 `GET /leaderboard/class`
Top-N siswa di kelas user.

**Query:**
- `limit` (opt, default 10, max 20)

**Response 200:**
```json
[
  { "rank": 1, "name": "Aysha Nabila",  "initials": "AY", "xp": 2140, "avatarColor": "#FEF9E7", "isMe": false },
  { "rank": 2, "name": "Rizky Aditya", "initials": "RZ", "xp": 1240, "avatarColor": "#E6F6FD", "isMe": true  }
]
```

- `isMe` true kalau user yang login.
- Cache 60s di Redis.

---

## 11. Module: Notifications

Base: `/api/v1/notifications`.

### 11.1 `GET /notifications`
**Query:**
- `unreadOnly` (opt, bool, default false)
- `cursor` (opt)
- `limit` (opt, default 20)

**Response 200:**
```json
{
  "items": [
    {
      "id": "ckn1",
      "type": "ASSIGNMENT_GRADED",
      "title": "Nilai tugas Biologi keluar",
      "body": "Skor: 90/100",
      "linkTo": "/student/tugas/a4",
      "readAt": null,
      "createdAt": "..."
    }
  ],
  "nextCursor": null,
  "unreadCount": 3
}
```

### 11.2 `POST /notifications/:id/read`
Mark 1 notif as read. Response 204.

### 11.3 `POST /notifications/read-all`
Mark all unread → read. Response 204.

---

## 12. File Upload

**Provider**: S3-compatible (Cloudflare R2 / Backblaze B2 / Supabase Storage — pilih yg termurah, dev pakai MinIO).

**Pattern**: BE issue **pre-signed PUT URL**, FE upload langsung ke storage. BE store metadata only (path + size + mime).

### 12.1 `POST /uploads/presign`
**Request:**
```json
{ "purpose": "assignment_submission", "filename": "tugas.pdf", "sizeBytes": 1240000, "mimeType": "application/pdf" }
```

**Response 200:**
```json
{
  "uploadUrl": "https://...signed...",
  "fileKey": "submissions/2026/05/cku1/ckxxx-tugas.pdf",
  "expiresInSeconds": 900
}
```

Setelah upload ke `uploadUrl` sukses, FE pass `fileKey` ke endpoint submit.

**Purpose enum:** `assignment_submission | avatar | forum_attachment` (Phase 3+).

**Validation per purpose:**
- `assignment_submission`: max 10MB, mime `pdf/doc/docx/jpg/png`
- `avatar`: max 2MB, mime `jpg/png/webp`

---

## 13. Cross-cutting

### 13.1 Audit log
Phase 3. Skip.

### 13.2 Soft delete
Tidak pakai. Delete = real delete. Backup harian Postgres.

### 13.3 Search
Phase 3. Forum search pakai PG `tsvector` nanti.

### 13.4 i18n
Single locale: `id-ID`. Semua message error & label di-hardcode Indonesia di BE response.

---

## 14. Seed Data (Phase 2 minimal)

Untuk dev & e2e test. Match dengan `lib/mock-data.ts` di FE biar gampang banding visual.

- 1 School: SMA Negeri 1 Jakarta
- 1 Class: XII IPA 1
- 4 Students (sesuai leaderboard: Aysha, Rizky=me, Bagas, Dinda) + password = "password"
- 6 Subjects + masing-masing 1 teacher
- ClassSubject untuk semua 6 subject di kelas XII IPA 1
- 3-5 chapters per subject, beberapa sudah completed buat Rizky
- 5 Assignments (3 belum submit, 2 sudah dinilai)
- 5 Quizzes (3 belum dikerjain, 2 sudah submit)
- 4 ForumPosts (3 student + 1 teacher pinned)
- Schedule senin 4 slot
- 6 Badges (3 earned, 3 unearned untuk Rizky)

---

## 15. Definition of Done — Phase 2

- [ ] Prisma migration `add_phase2_models` jalan bersih
- [ ] Seed script `pnpm db:seed` populate semua dummy data
- [ ] Module folders: `subjects`, `assignments`, `quizzes`, `forum`, `schedule`, `leaderboard`, `notifications`, `students`, `uploads`
- [ ] Semua endpoint di doc ini punya:
  - DTO + class-validator
  - Controller method dgn `@UseGuards(SessionAuthGuard, RolesGuard)` + `@Roles('STUDENT')` (atau multi-role)
  - Service unit test happy path (min 1 per endpoint)
- [ ] Quiz anti-cheat:
  - [ ] `correctOptionId` / `explanation` di-strip dari response active session (audit response shape via Pact / snapshot test)
  - [ ] Server-side expiry check (test: kirim submit setelah `expiresAt` → terima tapi tidak ngubah `submittedAt` past expiry)
  - [ ] XP increment idempotent (test: submit 2x → XP gak double)
- [ ] File upload:
  - [ ] Pre-signed URL works end-to-end (MinIO di docker-compose dev)
  - [ ] Validation purpose + size + mime
- [ ] CORS + cookie session work dari `http://localhost:3000`
- [ ] Swagger lengkap di `/api/docs`
- [ ] E2E test happy paths per modul (min: list → detail → mutate untuk yang ada mutation)

---

## 16. Mapping FE → BE (quick lookup)

| FE page / komponen                          | Endpoint utama                                                  |
|---------------------------------------------|-----------------------------------------------------------------|
| `app/student/beranda/page.tsx`              | `/students/me/profile`, `/students/me/stats`, `/subjects`, `/assignments?status=segera,belum`, `/schedule/today`, `/leaderboard/class` |
| `app/student/pelajaran/page.tsx`            | `/subjects`                                                     |
| `app/student/tugas/page.tsx`                | `/assignments`                                                  |
| `app/student/tugas/[id]/page.tsx`           | `/assignments/:id` + `/uploads/presign` + `/assignments/:id/submit` |
| `app/student/quiz/page.tsx`                 | `/quizzes`                                                      |
| `app/student/quiz/[id]/page.tsx` (start)    | `/quizzes/:id/start`                                            |
| `app/student/quiz/[id]/page.tsx` (auto-save)| `PATCH /quizzes/sessions/:sid/answer`                          |
| `app/student/quiz/[id]/page.tsx` (submit)   | `/quizzes/sessions/:sid/submit`                                 |
| `app/student/forum/page.tsx`                | `/forum/posts?subject=…`                                        |
| `app/student/profil/page.tsx`               | `/students/me/profile`, `/students/me/badges`                   |
| Bell icon (header)                          | `/notifications?unreadOnly=true&limit=1` (badge count) + `/notifications` (panel)         |

---

## 17. Open Questions

- [ ] Apakah attendance dihitung dari sistem absensi eksisting sekolah, atau bikin sendiri di Phase 3?
- [ ] Quiz retake unlimited atau capped? (default unlimited di Phase 2)
- [ ] Late submission policy: terima dgn flag, atau reject keras? (default terima)
- [ ] Forum moderasi: ada keyword filter / report? (Phase 3)
- [ ] XP curve final: linear (`1000 + lvl*100`) atau geometric? (placeholder linear sekarang)
- [ ] Notification push (FCM/web push) — Phase 3 atau Phase 2?

Putusin sebelum mulai implementation supaya gak rework.

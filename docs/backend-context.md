# Lentera LMS — Backend Context

Dokumen ini adalah konteks lengkap buat repo backend Lentera (separate repo dari FE ini). Tujuannya: lu (atau Claude di repo BE) bisa langsung ngerti scope, stack, data model, dan kontrak API tanpa harus baca seluruh FE.

**Status**: Phase 1 = AUTH module saja. Modul lain (subject, assignment, quiz, forum) menyusul setelah AUTH solid.

---

## 1. Project Overview

**Lentera LMS** — platform pembelajaran interaktif berbahasa Indonesia untuk siswa SMA. Mobile-first PWA. Multi-tenant per sekolah.

**User personas:**
- **Siswa**: ngerjain tugas, ikut quiz, lihat materi, ikut forum diskusi
- **Guru**: bikin/koreksi tugas, bikin quiz, post materi, jawab forum
- **Admin Sekolah**: kelola user, kelas, mata pelajaran (out of scope Phase 1)

**FE stack (sudah jalan, repo terpisah):**
- Next.js 16 App Router + React 19 + Tailwind v4 + TypeScript
- PWA-ready (manifest + icons)
- Saat ini pakai mock data di `lib/mock-data.ts` — siap di-swap ke API call

---

## 2. BE Stack & Arsitektur

| Layer         | Tech                                                       |
|---------------|------------------------------------------------------------|
| Framework     | **NestJS** (v10+, Express adapter)                         |
| ORM           | **Prisma**                                                 |
| Database      | **PostgreSQL** 15+                                         |
| Session store | **Redis** (via `ioredis` + `connect-redis`)                |
| Auth          | `express-session` (server-side session) + `argon2`         |
| Validation    | `class-validator` + `class-transformer` (DTO)              |
| Config        | `@nestjs/config` (.env)                                    |
| Testing       | Jest (unit) + supertest (e2e)                              |
| Docs          | Swagger (`@nestjs/swagger`) di `/api/docs`                 |

**Arsitektur**: Monolith modular (NestJS module per domain). Microservice bukan urgent.

**Hosting (rekomendasi)**: Railway / Fly.io / VPS biasa. Postgres managed (Supabase / Neon / Railway PG). Redis managed (Upstash / Railway Redis).

---

## 3. Repo Strategy

- **Repo terpisah** dari FE: `lentera-api` (atau nama lain). Jangan monorepo dulu — overhead.
- **Komunikasi**: FE call BE via REST JSON. URL via `NEXT_PUBLIC_API_BASE_URL` di FE.
- **CORS**: BE allow origin dari domain FE (dev: `http://localhost:3000`, prod: domain prod).
- **Versioning API**: `/api/v1/...` dari awal. Future-proof.

---

## 4. Keputusan yang Sudah Dikunci

| # | Topik | Pilihan | Catatan |
|---|---|---|---|
| 1 | Auth strategy | **Session cookie (server-side)** | `express-session` + Redis store. Cookie cuma simpan session ID opaque. Easy revoke, no token leakage risk di FE. |
| 2 | Role scope MVP | **Student + Teacher + Admin** | Full RBAC dari day 1, no migrasi nanti. Login flow split: student vs staff. |
| 3 | Identifier login siswa | **NIS + password** | Realistis SMA Indonesia. Email opsional di profile (Phase 2: forgot password via email). |
| 4 | Identifier login staff | **Email + password** | Untuk teacher & admin. NIP teacher opsional di profile. |
| 5 | Password hashing | **argon2id** | Lebih modern dari bcrypt. Pakai `argon2` npm. |
| 6 | Self-registration siswa? | **Tidak** | Admin/guru bikin akun, kasih kredensial awal. Siswa wajib ganti password saat first login. |
| 7 | Self-registration staff? | **Tidak** | Admin sekolah bikin akun guru. Super-admin di-seed manual. |
| 8 | Multi-tenant per sekolah? | **Schema ready, single-tenant MVP** | Schema sudah punya `schoolId`, tapi MVP cuma 1 sekolah. |
| 9 | Rate limit | **`@nestjs/throttler`**, 5 login attempt/menit/IP | Brute-force protection. |
| 10 | Session TTL | **7 hari rolling** | Cookie `maxAge=7d`, di-refresh setiap request. Idle > 7 hari → logout otomatis. |
| 11 | Concurrent session | **Diizinkan** | User boleh login di multi device (Redis simpan multiple session keys per user). Logout 1 device gak kick yang lain. |

Override kapan aja sebelum coding kalau ada yang berubah.

---

## 5. Data Model (Prisma Schema Sketch)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  STUDENT
  TEACHER
  ADMIN
}

model School {
  id        String   @id @default(cuid())
  name      String
  code      String   @unique           // e.g. "SMAN1JKT"
  createdAt DateTime @default(now())
  users     User[]
  classes   Class[]
}

model Class {
  id        String   @id @default(cuid())
  schoolId  String
  school    School   @relation(fields: [schoolId], references: [id])
  name      String                     // e.g. "XII IPA 1"
  gradeYear Int                        // 10, 11, 12
  students  Student[]

  @@unique([schoolId, name])
}

model User {
  id           String   @id @default(cuid())
  schoolId     String
  school       School   @relation(fields: [schoolId], references: [id])
  role         Role
  email        String?  @unique          // wajib untuk TEACHER & ADMIN, optional untuk STUDENT
  passwordHash String
  mustChangePassword Boolean @default(true)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  lastLoginAt  DateTime?

  // 1-to-1 profile per role
  student   Student?
  teacher   Teacher?
  admin     Admin?

  @@index([schoolId, role])
}

model Student {
  userId    String   @id
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  nis       String   @unique            // login identifier untuk role STUDENT
  name      String
  classId   String
  class     Class    @relation(fields: [classId], references: [id])
  level     Int      @default(1)
  xp        Int      @default(0)
  avatar    String?

  @@index([classId])
}

model Teacher {
  userId  String  @id
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  nip     String? @unique                // Nomor Induk Pegawai, optional
  name    String
  title   String?                         // "S.Pd", dll
  avatar  String?
}

model Admin {
  userId  String  @id
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  name    String
  scope   AdminScope @default(SCHOOL)     // SCHOOL admin atau SUPER admin
}

enum AdminScope {
  SCHOOL    // admin satu sekolah
  SUPER     // admin platform (bisa kelola semua sekolah)
}
```

**Catatan:**
- `User` base + `Student`/`Teacher`/`Admin` profile 1:1 pakai shared PK (userId). Polymorphic via `role` enum.
- `mustChangePassword` flag biar user wajib ganti password awal (siswa: dari admin/guru, staff: dari admin).
- **No RefreshToken model** — session disimpan di Redis, bukan DB. Kalau mau migrate ke DB-backed session di masa depan, tinggal tambah model `Session` di sini.
- Email wajib untuk role TEACHER & ADMIN (validasi di DTO layer, bukan di DB level — biar siswa boleh tanpa email).

---

## 6. AUTH Module — Endpoints

Base path: `/api/v1/auth`. **Semua endpoint pakai session cookie** — FE wajib `withCredentials: true`.

### 6.1 `POST /auth/student/login`

Login siswa pakai NIS.

**Request:**
```json
{
  "nis": "12345678",
  "password": "rahasia123"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "ckxxx",
    "role": "STUDENT",
    "mustChangePassword": false,
    "profile": {
      "name": "Rizky Aditya Pratama",
      "nis": "12345678",
      "class": "XII IPA 1",
      "school": "SMA Negeri 1 Jakarta",
      "level": 12,
      "xp": 1240,
      "avatar": null
    }
  }
}
```

**Side effect:** `req.session.userId` + `req.session.role = "STUDENT"` di-set. Cookie `lentera.sid` di-issue (`httpOnly`, `Secure` prod, `SameSite=Lax`, `Path=/`, `Max-Age=7d`).

**Errors:**
- 400 `VALIDATION_ERROR` — payload invalid
- 401 `INVALID_CREDENTIALS` — NIS gak ada / password salah (jangan bedakan, anti enumeration)
- 403 `ACCOUNT_DISABLED`
- 429 `TOO_MANY_ATTEMPTS`

### 6.2 `POST /auth/staff/login`

Login guru atau admin pakai email.

**Request:**
```json
{
  "email": "guru.sari@sman1jkt.sch.id",
  "password": "rahasia123"
}
```

**Response 200:** sama struktur dengan student login, `profile` shape beda tergantung role:

- **TEACHER profile**: `{ name, nip?, title?, school, avatar? }`
- **ADMIN profile**: `{ name, scope: "SCHOOL"|"SUPER", school }`

**Side effect & errors:** sama dengan student login. Role di session = "TEACHER" atau "ADMIN" hasil lookup.

### 6.3 `POST /auth/logout`

Destroy session di Redis + clear cookie. Auth required.

**Request:** kosong (cookie auto-sent).
**Response 204** (no body).

### 6.4 `GET /auth/me`

Hydrate FE saat cold load / refresh halaman. Auth required (cookie session).

**Response 200**: sama dengan `user` object di response login.
**Errors**: 401 `UNAUTHENTICATED` kalau session gak valid → FE redirect ke login.

### 6.5 `POST /auth/change-password`

Ganti password (wajib di first login kalau `mustChangePassword=true`, atau voluntary). Auth required.

**Request:**
```json
{
  "currentPassword": "tempPass",
  "newPassword": "newSecurePass"
}
```

**Response 204.** Set `mustChangePassword = false`. **Side effect:** revoke semua session lain milik user ini (kick semua device kecuali current). Update `passwordHash` baru.

**Errors:**
- 400 `WEAK_PASSWORD` — min 8 char, mix huruf+angka
- 401 `CURRENT_PASSWORD_WRONG`

### 6.6 (Phase 2) `POST /auth/forgot-password` + `POST /auth/reset-password`

Skip dulu. Siswa belum tentu punya email — sementara reset manual via admin/guru (admin endpoint `POST /admin/users/:id/reset-password`, scope module Users).

---

## 7. Response & Error Format

**Sukses**: response langsung object (tidak di-wrap envelope). Standar HTTP code.

**Error format** (NestJS exception filter):
```json
{
  "statusCode": 401,
  "code": "INVALID_CREDENTIALS",
  "message": "Email atau password salah",
  "timestamp": "2026-05-19T10:23:00.000Z",
  "path": "/api/v1/auth/login"
}
```

Bikin custom exception filter di `src/common/filters/http-exception.filter.ts`.

---

## 8. Security Checklist

- [ ] Password hashing: **argon2id** (memory=64MB, iterations=3)
- [ ] Session ID: opaque random 128+ bit (default `express-session` aman), disimpan di Redis sebagai value, cookie cuma carry ID
- [ ] `SESSION_SECRET`: 256-bit random untuk signing cookie
- [ ] Cookie flags: `httpOnly: true`, `secure: true` (prod), `sameSite: 'lax'`, `path: '/'`
- [ ] Cookie name: rename dari default `connect.sid` → `lentera.sid` (anti-fingerprinting framework)
- [ ] CORS: whitelist origin FE explicit, `credentials: true`. Wildcard `*` haram saat credentials true.
- [ ] Helmet middleware (`helmet` npm)
- [ ] Rate limit login: 5 attempt / menit / IP (lockout 15 menit kalau over)
- [ ] CSRF protection: SameSite=Lax sudah cover sebagian. Untuk endpoint state-changing yang kritis (change-password, logout) **tetap** pakai double-submit token atau header `Origin` check.
- [ ] Session fixation: regenerate session ID setelah login sukses (`req.session.regenerate(cb)` sebelum set userId)
- [ ] Concurrent session list: track session keys per user di Redis SET (`user:{userId}:sessions`) supaya bisa "logout all devices"
- [ ] Logging: jangan log password / session ID. Log login attempt dengan masked identifier.
- [ ] Validation: `class-validator` di semua DTO. Reject extra fields (`whitelist: true, forbidNonWhitelisted: true`).
- [ ] Audit log: simpan login success + failure di tabel `AuditLog` (Phase 2).

---

## 9. Project Structure (NestJS)

```
src/
├── main.ts                      # bootstrap: helmet, cors, session middleware, validation pipe, swagger
├── app.module.ts
├── config/
│   ├── env.validation.ts        # Joi/Zod validation untuk env
│   ├── session.config.ts        # express-session + connect-redis setup
│   └── configuration.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── redis/
│   ├── redis.module.ts          # ioredis singleton
│   └── redis.service.ts
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts   # @CurrentUser() → ambil dari req.session
│   │   ├── roles.decorator.ts          # @Roles('TEACHER', 'ADMIN')
│   │   └── public.decorator.ts         # @Public() → skip auth guard
│   ├── guards/
│   │   ├── session-auth.guard.ts       # check req.session.userId
│   │   └── roles.guard.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── types/
│       └── session.d.ts                # extend express-session SessionData
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts          # /student/login, /staff/login, /logout, /me, /change-password
│   │   ├── auth.service.ts
│   │   ├── session.service.ts          # helper: regenerate, destroy, list user sessions
│   │   ├── dto/
│   │   │   ├── student-login.dto.ts
│   │   │   ├── staff-login.dto.ts
│   │   │   └── change-password.dto.ts
│   │   └── auth.service.spec.ts
│   ├── users/                          # CRUD user (admin scope, Phase 2)
│   ├── students/                       # student profile read endpoints
│   ├── teachers/                       # teacher profile read endpoints
│   └── schools/                        # school + class lookup
└── shared/
    └── types/
```

**Catatan:**
- Session middleware (`express-session`) di-setup di `main.ts` sebelum app start, pakai `RedisStore` dari `connect-redis`.
- `session.d.ts` extend tipe `SessionData` biar TypeScript tau ada `userId` dan `role`:
  ```ts
  import "express-session";
  declare module "express-session" {
    interface SessionData {
      userId: string;
      role: "STUDENT" | "TEACHER" | "ADMIN";
    }
  }
  ```
- `SessionAuthGuard` cek `request.session?.userId`, lookup user dari DB (cached di Redis 30s biar gak hit DB tiap request), attach ke `request.user`.

---

## 10. FE Integration — Apa yang Akan Berubah

Di FE repo ini, setelah BE jalan:

1. **API client** (`lib/api.ts`):
   - axios / fetch wrapper dengan `baseURL: NEXT_PUBLIC_API_BASE_URL`
   - **Wajib `credentials: "include"` (fetch) atau `withCredentials: true` (axios)** — supaya cookie session auto-attached
   - Interceptor 401 → redirect ke login page (no refresh logic karena no JWT)

2. **Auth state** (`lib/auth-store.ts`):
   - Zustand simpan `user` object (no token — token-less di FE side, session di cookie)
   - Hydrate dari `GET /auth/me` saat app mount
   - Status: `loading | authenticated | guest`

3. **Route guard**:
   - Server-side check di `middleware.ts` susah karena cookie session opaque (gak bisa decode di FE). Solusi: client-side guard di `app/student/layout.tsx` — kalau `/auth/me` return 401, redirect ke login.
   - Atau pakai `middleware.ts` yang **forward** cookie ke BE `/auth/me` untuk validasi (proxy pattern), tapi ini tambahin latency. Default: client-side guard.

4. **Login pages** (belum ada, dibuat saat BE siap):
   - `app/auth/login/page.tsx` — landing dengan 2 tab: "Siswa" (NIS) dan "Guru/Admin" (email)
   - Atau 2 page terpisah: `/auth/login/siswa`, `/auth/login/staff`

5. **Logout button**: call `POST /auth/logout` → clear local store → redirect to login.

6. **Mock data swap strategy**:
   - `lib/mock-data.ts` tetap ada untuk dev offline
   - `lib/api/student.ts` dll → real fetch
   - Env flag `NEXT_PUBLIC_USE_MOCK=true` untuk toggle dev tanpa BE jalan

7. **CORS gotcha**: BE harus set `Access-Control-Allow-Credentials: true` + `Access-Control-Allow-Origin: <exact-origin>` (no wildcard). Kalau salah, browser silently drop cookie.

---

## 11. Phase 1 MVP — Definition of Done

**In scope (AUTH module):**
- [ ] Prisma schema: School, Class, User, Student, Teacher, Admin (no RefreshToken)
- [ ] Migration jalan bersih di Postgres
- [ ] Redis connection sehat, session middleware aktif
- [ ] Seed data: 1 school (SMAN 1 Jakarta), 1 class (XII IPA 1), 1 admin, 1 teacher, 1 student (Rizky Aditya — match mock FE)
- [ ] `POST /auth/student/login` (NIS + password)
- [ ] `POST /auth/staff/login` (email + password, untuk teacher & admin)
- [ ] `POST /auth/logout`
- [ ] `GET /auth/me`
- [ ] `POST /auth/change-password` (revoke session lain)
- [ ] `SessionAuthGuard` + `RolesGuard` + `@CurrentUser()` + `@Roles()` decorators
- [ ] Session fixation prevention (regenerate after login)
- [ ] Rate limit pada login endpoints
- [ ] Swagger docs `/api/docs` lengkap untuk auth module
- [ ] E2E test happy paths:
  - Student login → /me → logout
  - Teacher login → /me (role check) → logout
  - Admin login → /me → logout
  - Failed login (wrong password) returns 401
  - /me tanpa cookie returns 401
  - Change password kicks other sessions
- [ ] CORS verified work dari `http://localhost:3000` (FE dev)

**Out of scope (Phase 2+):**
- Forgot/reset password via email
- User CRUD endpoints (admin scope)
- Audit log table
- Multi-sekolah (super-admin flow)
- Teacher classroom assignment
- Subject / Assignment / Quiz / Forum modules
- 2FA / MFA

---

## 12. Env Variables (`.env.example`)

```bash
# Database
DATABASE_URL="postgresql://lentera:lentera@localhost:5432/lentera?schema=public"

# Redis (session store)
REDIS_URL="redis://localhost:6379"

# Session
SESSION_SECRET="change-me-256-bit-random-string"
SESSION_NAME="lentera.sid"
SESSION_MAX_AGE_MS=604800000   # 7 hari dalam ms

# App
PORT=4000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"

# Cookie
COOKIE_DOMAIN="localhost"
COOKIE_SECURE=false        # true in prod (HTTPS)
COOKIE_SAMESITE="lax"
```

---

## 13. Suggested Bootstrap Commands

```bash
# Bikin repo BE
mkdir lentera-api && cd lentera-api
npm i -g @nestjs/cli
nest new . --package-manager pnpm

# Install deps
pnpm add @nestjs/config @nestjs/throttler @nestjs/swagger \
         @prisma/client argon2 class-validator class-transformer \
         express-session connect-redis ioredis helmet
pnpm add -D prisma @types/express-session

# Init Prisma
pnpm prisma init
# (paste schema dari section 5)
pnpm prisma migrate dev --name init
pnpm prisma generate

# Pastikan Redis jalan lokal (Docker simplest):
docker run -d --name lentera-redis -p 6379:6379 redis:7-alpine

# Run
pnpm start:dev
```

---

## 14. Referensi FE yang Relevan

Buat ngerti shape data yang FE expect, baca:
- `types/index.ts` — `Student`, `Subject`, `Assignment`, `Quiz` interface
- `lib/mock-data.ts` — contoh isi data realistis
- `app/student/beranda/page.tsx` — apa aja yang ditampilkan di home (level, xp, attendance, avgScore, dll)

**Field FE saat ini yang relevan ke AUTH `/me` response:**
```ts
{
  name: "Rizky Aditya Pratama",
  class: "XII IPA 1",
  school: "SMA Negeri 1 Jakarta",
  level: 12,
  xp: 1240,
  xpMax: 1800,         // bisa derived dari level di BE
  attendance: 92,      // mungkin masuk endpoint lain, bukan auth/me
  avgScore: 87,        // same
  avatar?: string,
}
```

`attendance` dan `avgScore` mungkin lebih cocok di endpoint terpisah (`GET /students/me/stats`) supaya `/auth/me` tetap fokus identity + profile dasar.

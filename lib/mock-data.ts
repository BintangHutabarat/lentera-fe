import type {
  Student, Subject, Assignment, Quiz,
  ScheduleItem, ForumPost, LeaderEntry,
} from "@/types";

// ── Student ──────────────────────────────────────────────
export const mockStudent: Student = {
  id: "s001",
  name: "Rizky Aditya Pratama",
  class: "XII IPA 1",
  school: "SMA Negeri 1 Jakarta",
  level: 12,
  xp: 1240,
  xpMax: 1800,
  attendance: 92,
  avgScore: 87,
  badges: [
    { id: "b1", label: "Top Kelas",     icon: "🏆", earned: true },
    { id: "b2", label: "7 Hari Streak", icon: "🔥", earned: true },
    { id: "b3", label: "Rajin Baca",    icon: "📚", earned: true },
    { id: "b4", label: "Quiz Master",   icon: "🎯", earned: false },
    { id: "b5", label: "Presentasi",    icon: "⭐", earned: false },
    { id: "b6", label: "Penanya Aktif", icon: "💡", earned: false },
  ],
};

// ── Subjects ─────────────────────────────────────────────
export const mockSubjects: Subject[] = [
  { id: "mat", name: "Matematika",      teacher: "Pak Ahmad Fauzi",   icon: "➕", color: "blue",   chaptersTotal: 7,  chaptersDone: 5, progress: 72, currentChapter: "Persamaan Diferensial" },
  { id: "fis", name: "Fisika",          teacher: "Bu Sari Dewi",      icon: "⚡", color: "yellow", chaptersTotal: 7,  chaptersDone: 3, progress: 45, currentChapter: "Gelombang EM" },
  { id: "bio", name: "Biologi",         teacher: "Bu Wati Rahayu",    icon: "🧬", color: "teal",   chaptersTotal: 10, chaptersDone: 9, progress: 90, currentChapter: "Sistem Reproduksi" },
  { id: "kim", name: "Kimia",           teacher: "Bu Rina Susanti",   icon: "🧪", color: "red",    chaptersTotal: 8,  chaptersDone: 5, progress: 60, currentChapter: "Asam Basa" },
  { id: "bin", name: "Bahasa Indonesia",teacher: "Bu Ratna Sari",     icon: "📖", color: "mint",   chaptersTotal: 6,  chaptersDone: 3, progress: 55, currentChapter: "Analisis Novel" },
  { id: "ing", name: "Bahasa Inggris",  teacher: "Mr. Kevin",         icon: "🌐", color: "purple", chaptersTotal: 6,  chaptersDone: 4, progress: 68, currentChapter: "Reading Comprehension" },
];

// ── Assignments ───────────────────────────────────────────
export const mockAssignments: Assignment[] = [
  {
    id: "a1", title: "Latihan Soal Integral Tertentu",
    subject: "Matematika", subjectColor: "blue", teacher: "Pak Ahmad",
    icon: "📊", type: "Online", dueLabel: "Hari ini", dueUrgency: "today",
    status: "segera", maxScore: 100, totalItems: "20 soal",
  },
  {
    id: "a2", title: "Laporan Praktikum Gelombang",
    subject: "Fisika", subjectColor: "yellow", teacher: "Bu Sari",
    icon: "🔬", type: "Upload PDF", dueLabel: "Besok", dueUrgency: "tomorrow",
    status: "segera", maxScore: 100, totalItems: "Laporan",
  },
  {
    id: "a3", title: "Esai Analisis Novel Laskar Pelangi",
    subject: "Bahasa Indonesia", subjectColor: "mint", teacher: "Bu Ratna",
    icon: "📖", type: "Esai", dueLabel: "3 hari lagi", dueUrgency: "soon",
    status: "belum", maxScore: 100, totalItems: "Min 800 kata",
  },
  {
    id: "a4", title: "Soal Latihan Sistem Reproduksi",
    subject: "Biologi", subjectColor: "teal", teacher: "Bu Wati",
    icon: "🧬", type: "Online", dueLabel: "Selesai", dueUrgency: "done",
    status: "selesai", score: 90, maxScore: 100, totalItems: "15 soal",
  },
  {
    id: "a5", title: "Laporan Praktikum Titrasi Asam Basa",
    subject: "Kimia", subjectColor: "red", teacher: "Bu Rina",
    icon: "🧪", type: "Upload PDF", dueLabel: "Selesai", dueUrgency: "done",
    status: "selesai", score: 85, maxScore: 100, totalItems: "Laporan",
  },
];

// ── Quizzes ───────────────────────────────────────────────
export const mockQuizzes: Quiz[] = [
  { id: "q1", title: "Quiz Integral",          subject: "Matematika",     subjectColor: "blue",   icon: "➕", totalQuestions: 15, durationMinutes: 20, chapter: "Bab 5", completed: false },
  { id: "q2", title: "Quiz Gelombang",         subject: "Fisika",         subjectColor: "yellow", icon: "⚡", totalQuestions: 10, durationMinutes: 15, chapter: "Bab 3", completed: false },
  { id: "q3", title: "Quiz Organ Reproduksi",  subject: "Biologi",        subjectColor: "teal",   icon: "🧬", totalQuestions: 10, durationMinutes: 15, chapter: "Bab 9", completed: true, score: 90, stars: 5 },
  { id: "q4", title: "Quiz Reading",           subject: "Bahasa Inggris", subjectColor: "purple", icon: "🌐", totalQuestions: 8,  durationMinutes: 12, chapter: "Unit 4", completed: true, score: 82, stars: 4 },
  { id: "q5", title: "Quiz Asam Basa",         subject: "Kimia",          subjectColor: "red",    icon: "🧪", totalQuestions: 12, durationMinutes: 18, chapter: "Bab 5", completed: true, score: 78, stars: 4 },
];

// ── Schedule ──────────────────────────────────────────────
export const mockSchedule: ScheduleItem[] = [
  { id: "sc1", subject: "Matematika",    room: "Ruang 3A", timeStart: "07.30", timeEnd: "08.45", color: "#2B9FD8" },
  { id: "sc2", subject: "Fisika",        room: "Lab IPA",  timeStart: "09.00", timeEnd: "10.15", color: "#F5C518" },
  { id: "sc3", subject: "Biologi",       room: "Ruang 3A", timeStart: "10.30", timeEnd: "11.45", color: "#3DD6B5" },
  { id: "sc4", subject: "B. Inggris",    room: "Ruang 3A", timeStart: "13.00", timeEnd: "14.15", color: "#5FE0A0" },
];

// ── Leaderboard ───────────────────────────────────────────
export const mockLeaderboard: LeaderEntry[] = [
  { rank: 1, name: "Aysha Nabila",  initials: "AY", color: "#FEF9E7", xp: 2140 },
  { rank: 2, name: "Rizky Aditya", initials: "RZ", color: "#E6F6FD", xp: 1240, isMe: true },
  { rank: 3, name: "Bagas Nugroho",initials: "BN", color: "#E3FBF5", xp: 1180 },
  { rank: 4, name: "Dinda Kartika",initials: "DK", color: "#EAFBF2", xp: 1020 },
];

// ── Forum ─────────────────────────────────────────────────
export const mockForumPosts: ForumPost[] = [
  {
    id: "f1", author: "Aysha Nabila", authorInitials: "AY",
    authorColor: "#E6F6FD", role: "student",
    subjectTag: "Biologi", subjectColor: "teal",
    content: "Halo teman-teman! Ada yang bisa jelasin perbedaan spermatogenesis dan oogenesis secara singkat? Bingung di bagian jumlah sel hasilnya. 🤔",
    timeAgo: "5 menit lalu", likes: 12, replies: 3,
  },
  {
    id: "f2", author: "Bagas Nugroho", authorInitials: "BN",
    authorColor: "#E3FBF5", role: "student",
    subjectTag: "Fisika", subjectColor: "yellow",
    content: "Soal no.5 laporan praktikum gelombang menghitung panjang gelombang pakai rumus yang mana ya? v = λf atau ada rumus lain?",
    timeAgo: "1 jam lalu", likes: 8, replies: 5,
  },
  {
    id: "f3", author: "Bu Wati Rahayu", authorInitials: "WR",
    authorColor: "#E3FBF5", role: "teacher",
    subjectTag: "Pengumuman", subjectColor: "teal",
    content: "📢 Reminder: Quiz Akhir Bab 9 Biologi dibuka setelah semua materi selesai. Nilai quiz 30% dari total nilai akhir. Semangat! 💪",
    timeAgo: "2 jam lalu", likes: 24, replies: 7,
  },
  {
    id: "f4", author: "Dinda Kartika", authorInitials: "DK",
    authorColor: "#EAFBF2", role: "student",
    content: "Ada yang mau buat grup belajar bareng persiapan ujian semester? Virtual via Meet tiap Sabtu jam 9 pagi. Yang mau gabung komentar ya! 😊",
    timeAgo: "3 jam lalu", likes: 18, replies: 11,
  },
];

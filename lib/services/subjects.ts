import { apiFetch } from "@/lib/api";

export type SubjectColor = "blue" | "teal" | "yellow" | "mint" | "red" | "purple";

export interface Subject {
  id: string;
  name: string;
  color: SubjectColor;
  icon: string;
  teacher: {
    id: string;
    name: string;
    title: string;
  };
  progress: number;
}

export type SubjectDetail = Omit<Subject, "progress">;

export function getSubjects(): Promise<Subject[]> {
  return apiFetch<Subject[]>("/subjects");
}

export function getSubject(id: string): Promise<SubjectDetail> {
  return apiFetch<SubjectDetail>(`/subjects/${id}`);
}

// ── Materi (feed datar: teks / foto / pdf) ──────────────────────────────────────

export type MateriType = "TEXT" | "IMAGE" | "PDF";

export interface Materi {
  id: string;
  type: MateriType;
  content: string; // teks (TEXT) atau URL file (IMAGE/PDF)
  fileName: string | null;
  createdAt: string;
}

// Catatan: route memakai segmen `class-subjects/:id`, tetapi `:id` di sini adalah
// subjectId (konsisten dengan /subjects/:id yang dipakai halaman pelajaran siswa).
export function getStudentMateri(subjectId: string): Promise<Materi[]> {
  return apiFetch<Materi[]>(`/students/me/class-subjects/${subjectId}/materi`);
}

// ── Student Attendance ────────────────────────────────────────────────────────

export type StudentAttendanceStatus = "HADIR" | "SAKIT" | "IZIN" | "ALPHA";

export interface StudentAttendanceSummary {
  total: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  percentageHadir: number | null;
}

export interface StudentAttendanceMeeting {
  meetingId: string;
  meetingNumber: number;
  status: StudentAttendanceStatus | null;
  date: string;
  meetingStatus: "OPEN" | "CLOSED";
}

export interface StudentAttendance {
  classSubjectId: string;
  subject: { id: string; name: string; shortName: string };
  totalMeetings: number;
  summary: StudentAttendanceSummary;
  meetings: StudentAttendanceMeeting[];
}

export function getStudentAttendance(classSubjectId: string): Promise<StudentAttendance> {
  return apiFetch<StudentAttendance>(`/students/me/class-subjects/${classSubjectId}/attendance`);
}

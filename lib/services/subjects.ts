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
  chaptersTotal: number;
  chaptersDone: number;
  progress: number;
  currentChapter: string;
}

export interface Chapter {
  id: string;
  order: number;
  title: string;
  completed: boolean;
  completedAt: string | null;
}

export interface SubjectDetail extends Omit<Subject, "chaptersTotal" | "chaptersDone" | "progress" | "currentChapter"> {
  chapters: Chapter[];
}

export function getSubjects(): Promise<Subject[]> {
  return apiFetch<Subject[]>("/subjects");
}

export function getSubject(id: string): Promise<SubjectDetail> {
  return apiFetch<SubjectDetail>(`/subjects/${id}`);
}

export function completeChapter(chapterId: string): Promise<void> {
  return apiFetch<void>(`/subjects/chapters/${chapterId}/complete`, { method: "POST" });
}

export interface ChapterContent {
  id: string;
  order: number;
  title: string;
  content: string | null;
  completed: boolean;
  completedAt: string | null;
}

export function getChapter(subjectId: string, chapterId: string): Promise<ChapterContent> {
  return apiFetch<ChapterContent>(`/subjects/${subjectId}/chapters/${chapterId}`);
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

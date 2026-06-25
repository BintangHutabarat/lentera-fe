import { apiFetch } from "@/lib/api";
import type { SubjectColor } from "./subjects";
import type { AssignmentType } from "./assignments";

// ── Teacher profile ───────────────────────────────────────────────────────────

export interface TeacherMe {
  id: string;
  name: string;
  nip: string;
  title: string;
  email: string;
  avatar: string | null;
  school: { id: string; name: string; code: string };
}

export function getTeacherMe(): Promise<TeacherMe> {
  return apiFetch<TeacherMe>("/teacher/me");
}

// ── Class-subjects (kelas-mapel yang diajar) ──────────────────────────────────

export interface TeacherClassSubject {
  id: string;
  class: { id: string; name: string; gradeYear: number };
  subject: { id: string; name: string; color: SubjectColor; iconKey: string };
  assignmentCount: number;
  quizCount: number;
}

export function getTeacherClassSubjects(): Promise<TeacherClassSubject[]> {
  return apiFetch<TeacherClassSubject[]>("/teacher/subjects");
}

export interface TeacherStudent {
  id: string;
  name: string;
  nis: string;
  level: number;
  xp: number;
  avatar: string | null;
}

export function getClassSubjectStudents(classSubjectId: string): Promise<TeacherStudent[]> {
  return apiFetch<TeacherStudent[]>(`/teacher/subjects/${classSubjectId}/students`);
}

// ── Assignments ───────────────────────────────────────────────────────────────

export interface TeacherAssignmentListItem {
  id: string;
  title: string;
  type: AssignmentType;
  maxScore: number;
  dueAt: string;
  classSubject: {
    id: string;
    class: string;
    subject: { name: string; color: SubjectColor };
  };
  submissionCount: number;
  createdAt: string;
}

export function getTeacherAssignments(classSubjectId?: string): Promise<TeacherAssignmentListItem[]> {
  const qs = classSubjectId ? `?classSubjectId=${classSubjectId}` : "";
  return apiFetch<TeacherAssignmentListItem[]>(`/teacher/assignments${qs}`);
}

export interface TeacherAssignmentDetail {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  type: AssignmentType;
  maxScore: number;
  totalItems: string | null;
  minWords: number | null;
  attachment: { name: string; sizeKB: number; url: string } | null;
  rubric: { label: string; max: number }[];
  dueAt: string;
  classSubject: {
    id: string;
    class: string;
    subject: { name: string; color: SubjectColor };
  };
  submissionCount: number;
  createdAt: string;
}

export function getTeacherAssignment(id: string): Promise<TeacherAssignmentDetail> {
  return apiFetch<TeacherAssignmentDetail>(`/teacher/assignments/${id}`);
}

export interface CreateAssignmentPayload {
  classSubjectId: string;
  title: string;
  description: string;
  instructions: string[];
  type: AssignmentType;
  maxScore: number;
  totalItems?: string | null;
  minWords?: number | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentSize?: number | null;
  rubric?: { label: string; max: number }[];
  dueAt: string;
}

export function createAssignment(payload: CreateAssignmentPayload): Promise<{ id: string; createdAt: string }> {
  return apiFetch<{ id: string; createdAt: string }>("/teacher/assignments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type UpdateAssignmentPayload = Partial<CreateAssignmentPayload>;

export function updateAssignment(id: string, payload: UpdateAssignmentPayload): Promise<void> {
  return apiFetch<void>(`/teacher/assignments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAssignment(id: string): Promise<void> {
  return apiFetch<void>(`/teacher/assignments/${id}`, { method: "DELETE" });
}

export interface SubmissionEntry {
  student: { id: string; name: string; nis: string };
  submitted: boolean;
  submittedAt: string | null;
  score: number | null;
  graded: boolean;
}

export function getAssignmentSubmissions(assignmentId: string): Promise<SubmissionEntry[]> {
  return apiFetch<SubmissionEntry[]>(`/teacher/assignments/${assignmentId}/submissions`);
}

export interface SubmissionDetail {
  student: { id: string; name: string; nis: string };
  kind: "FILE" | "ESSAY" | "ONLINE_ANSWERS";
  fileName: string | null;
  fileSizeKB: number | null;
  fileUrl: string | null;
  essayText: string | null;
  answers: Record<string, string> | null;
  note: string | null;
  submittedAt: string;
  score: number | null;
  feedback: string | null;
  rubricBreakdown: { label: string; score: number }[] | null;
  gradedAt: string | null;
}

export function getSubmissionDetail(assignmentId: string, studentId: string): Promise<SubmissionDetail> {
  return apiFetch<SubmissionDetail>(`/teacher/assignments/${assignmentId}/submissions/${studentId}`);
}

export interface GradePayload {
  score: number;
  feedback?: string;
  rubricBreakdown?: { label: string; score: number }[];
}

export function gradeSubmission(assignmentId: string, studentId: string, payload: GradePayload): Promise<void> {
  return apiFetch<void>(`/teacher/assignments/${assignmentId}/submissions/${studentId}/grade`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Quizzes ───────────────────────────────────────────────────────────────────

export interface TeacherQuizListItem {
  id: string;
  title: string;
  chapter: string;
  durationMinutes: number;
  totalQuestions: number;
  classSubject: {
    id: string;
    class: string;
    subject: { name: string; color: SubjectColor };
  };
  completedSessionCount: number;
  createdAt: string;
}

export function getTeacherQuizzes(classSubjectId?: string): Promise<TeacherQuizListItem[]> {
  const qs = classSubjectId ? `?classSubjectId=${classSubjectId}` : "";
  return apiFetch<TeacherQuizListItem[]>(`/teacher/quizzes${qs}`);
}

export interface QuizQuestionInput {
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  order?: number;
}

export interface CreateQuizPayload {
  classSubjectId: string;
  title: string;
  chapter: string;
  durationMinutes: number;
  maxAttempts?: number;
  questions: QuizQuestionInput[];
}

export function createQuiz(payload: CreateQuizPayload): Promise<{ id: string; createdAt: string }> {
  return apiFetch<{ id: string; createdAt: string }>("/teacher/quizzes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface TeacherQuizQuestion {
  id: string;
  order: number;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
}

export interface TeacherQuizDetail {
  id: string;
  title: string;
  chapter: string;
  durationMinutes: number;
  maxAttempts: number;
  totalQuestions: number;
  classSubject: {
    id: string;
    class: string;
    subject: { name: string; color: SubjectColor };
  };
  questions: TeacherQuizQuestion[];
  createdAt: string;
}

export function getTeacherQuiz(id: string): Promise<TeacherQuizDetail> {
  return apiFetch<TeacherQuizDetail>(`/teacher/quizzes/${id}`);
}

export interface UpdateQuizPayload {
  title?: string;
  chapter?: string;
  durationMinutes?: number;
  maxAttempts?: number;
  questions?: QuizQuestionInput[];
}

export function updateQuiz(id: string, payload: UpdateQuizPayload): Promise<void> {
  return apiFetch<void>(`/teacher/quizzes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteQuiz(id: string): Promise<void> {
  return apiFetch<void>(`/teacher/quizzes/${id}`, { method: "DELETE" });
}

export interface QuizSessionResult {
  student: { id: string; name: string; nis: string };
  attempted: boolean;
  score: number | null;
  stars: number | null;
  correctCount: number | null;
  submittedAt: string | null;
}

export function getQuizSessions(quizId: string): Promise<QuizSessionResult[]> {
  return apiFetch<QuizSessionResult[]>(`/teacher/quizzes/${quizId}/sessions`);
}

// ── Announce ──────────────────────────────────────────────────────────────────

export function announceToClass(classSubjectId: string, payload: { title: string; body: string }): Promise<void> {
  return apiFetch<void>(`/teacher/subjects/${classSubjectId}/announce`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Student progress ──────────────────────────────────────────────────────────

export interface StudentProgressAssignment {
  id: string;
  title: string;
  dueAt: string;
  submitted: boolean;
  submittedAt: string | null;
  score: number | null;
  graded: boolean;
}

export interface StudentProgressQuiz {
  id: string;
  title: string;
  attempted: boolean;
  bestScore: number | null;
  bestStars: number | null;
}

export interface StudentProgressChapter {
  id: string;
  order: number;
  title: string;
  completed: boolean;
}

export interface StudentProgress {
  assignments: StudentProgressAssignment[];
  quizzes: StudentProgressQuiz[];
  chapters: StudentProgressChapter[];
}

export function getStudentProgress(classSubjectId: string, studentId: string): Promise<StudentProgress> {
  return apiFetch<StudentProgress>(`/teacher/subjects/${classSubjectId}/students/${studentId}/progress`);
}

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

// ── Export ────────────────────────────────────────────────────────────────────

export async function exportAssignment(id: string): Promise<void> {
  const { getAccessToken } = await import("@/lib/api");
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}/teacher/assignments/${id}/export`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  if (!res.ok) throw new Error("Gagal mengunduh rekap.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rekap-tugas-${id}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportQuiz(id: string): Promise<void> {
  const { getAccessToken } = await import("@/lib/api");
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}/teacher/quizzes/${id}/export`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  if (!res.ok) throw new Error("Gagal mengunduh rekap.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rekap-quiz-${id}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Meetings & Attendance ──────────────────────────────────────────────────────

export type AttendanceStatus = "HADIR" | "SAKIT" | "IZIN" | "ALPHA";
export type MeetingStatus = "OPEN" | "CLOSED";

export interface MeetingListItem {
  id: string;
  meetingNumber: number;
  status: MeetingStatus;
  startedAt: string;
  endedAt: string | null;
  studentCount: number;
}

export interface MeetingsResponse {
  totalMeetings: number;
  meetings: MeetingListItem[];
}

export interface MeetingAttendanceEntry {
  studentId: string;
  name: string;
  nis: string;
  status: AttendanceStatus;
}

export interface MeetingAttendance {
  meeting: {
    id: string;
    meetingNumber: number;
    status: MeetingStatus;
    startedAt: string;
    endedAt: string | null;
  };
  entries: MeetingAttendanceEntry[];
}

export function getMeetings(classSubjectId: string): Promise<MeetingsResponse> {
  return apiFetch<MeetingsResponse>(`/teacher/class-subjects/${classSubjectId}/meetings`);
}

export function openMeeting(classSubjectId: string): Promise<MeetingListItem> {
  return apiFetch<MeetingListItem>(`/teacher/class-subjects/${classSubjectId}/meetings`, { method: "POST" });
}

export function closeMeeting(meetingId: string): Promise<void> {
  return apiFetch<void>(`/teacher/meetings/${meetingId}/close`, { method: "PATCH" });
}

export function getMeetingAttendance(meetingId: string): Promise<MeetingAttendance> {
  return apiFetch<MeetingAttendance>(`/teacher/meetings/${meetingId}/attendance`);
}

export function updateMeetingAttendance(
  meetingId: string,
  entries: { studentId: string; status: AttendanceStatus }[]
): Promise<void> {
  return apiFetch<void>(`/teacher/meetings/${meetingId}/attendance`, {
    method: "PATCH",
    body: JSON.stringify({ entries }),
  });
}

// ── Exams ─────────────────────────────────────────────────────────────────────

export interface TeacherExam {
  id: string;
  title: string;
  description: string | null;
  maxScore: number;
  date: string | null;
  gradedCount: number;
  createdAt: string;
}

export interface ExamGradeEntry {
  studentId: string;
  name: string;
  nis: string;
  score: number | null;
  notes: string | null;
  gradedAt: string | null;
}

export interface ExamGrades {
  exam: { id: string; title: string; maxScore: number; date: string | null };
  entries: ExamGradeEntry[];
}

export function getExams(classSubjectId: string): Promise<TeacherExam[]> {
  return apiFetch<TeacherExam[]>(`/teacher/class-subjects/${classSubjectId}/exams`);
}

export function createExam(
  classSubjectId: string,
  payload: { title: string; description?: string; maxScore?: number; date?: string }
): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(`/teacher/class-subjects/${classSubjectId}/exams`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateExam(
  id: string,
  payload: { title?: string; description?: string; maxScore?: number; date?: string }
): Promise<void> {
  return apiFetch<void>(`/teacher/exams/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteExam(id: string): Promise<void> {
  return apiFetch<void>(`/teacher/exams/${id}`, { method: "DELETE" });
}

export function getExamGrades(id: string): Promise<ExamGrades> {
  return apiFetch<ExamGrades>(`/teacher/exams/${id}/grades`);
}

export function updateExamGrades(
  id: string,
  entries: { studentId: string; score: number | null; notes?: string }[]
): Promise<void> {
  return apiFetch<void>(`/teacher/exams/${id}/grades`, {
    method: "PUT",
    body: JSON.stringify({ entries }),
  });
}

// ── Final Grades ──────────────────────────────────────────────────────────────

export interface FinalGradeEntry {
  studentId: string;
  name: string;
  nis: string;
  refAssignment: number | null;
  refQuiz: number | null;
  refExam: number | null;
  refAttendance: number | null;
  finalGrade: number | null;
  notes: string | null;
  gradedAt: string | null;
}

export interface FinalGradesResponse {
  classSubjectId: string;
  academicYearId: string;
  academicYearLabel: string;
  entries: FinalGradeEntry[];
}

export function getFinalGrades(
  classSubjectId: string,
  academicYearId: string
): Promise<FinalGradesResponse> {
  return apiFetch<FinalGradesResponse>(
    `/teacher/class-subjects/${classSubjectId}/final-grades?academicYearId=${academicYearId}`
  );
}

export function saveFinalGrades(
  classSubjectId: string,
  payload: {
    academicYearId: string;
    entries: { studentId: string; finalGrade: number | null; notes?: string }[];
  }
): Promise<void> {
  return apiFetch<void>(`/teacher/class-subjects/${classSubjectId}/final-grades`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

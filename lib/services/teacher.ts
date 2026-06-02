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

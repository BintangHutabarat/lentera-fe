import { apiFetch } from "@/lib/api";

// ── Profile ───────────────────────────────────────────────────────────────────

export interface PrincipalMe {
  id: string;
  name: string;
  email: string;
  school: { id: string; name: string; code: string };
}

export function getPrincipalMe(): Promise<PrincipalMe> {
  return apiFetch<PrincipalMe>("/principal/me");
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface PrincipalUser {
  id: string;
  role: "STUDENT" | "TEACHER";
  email: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  profile: {
    name: string;
    nis?: string;
    class?: string;
    nip?: string;
    title?: string;
  };
}

export function getPrincipalUsers(params?: { role?: "STUDENT" | "TEACHER"; classId?: string }): Promise<PrincipalUser[]> {
  const qs = new URLSearchParams();
  if (params?.role) qs.set("role", params.role);
  if (params?.classId) qs.set("classId", params.classId);
  const q = qs.toString();
  return apiFetch<PrincipalUser[]>(`/principal/users${q ? `?${q}` : ""}`);
}

export function getPrincipalUser(id: string): Promise<PrincipalUser> {
  return apiFetch<PrincipalUser>(`/principal/users/${id}`);
}

export function createPrincipalStudent(payload: {
  name: string; nis: string; classId: string; email?: string; password?: string;
}): Promise<{ id: string; nis: string; name: string; temporaryPassword: string }> {
  const body: Record<string, string> = { name: payload.name, nis: payload.nis, classId: payload.classId };
  if (payload.email) body.email = payload.email;
  if (payload.password) body.password = payload.password;
  return apiFetch("/principal/users/students", { method: "POST", body: JSON.stringify(body) });
}

export function createPrincipalTeacher(payload: {
  name: string; email: string; nip?: string; title?: string; password?: string;
}): Promise<{ id: string; email: string; name: string; temporaryPassword: string }> {
  const body: Record<string, string> = { name: payload.name, email: payload.email };
  if (payload.nip) body.nip = payload.nip;
  if (payload.title) body.title = payload.title;
  if (payload.password) body.password = payload.password;
  return apiFetch("/principal/users/teachers", { method: "POST", body: JSON.stringify(body) });
}

export function updatePrincipalStudent(id: string, payload: { name?: string; classId?: string; isActive?: boolean }): Promise<void> {
  return apiFetch<void>(`/principal/users/students/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function updatePrincipalTeacher(id: string, payload: { name?: string; nip?: string; title?: string; email?: string; isActive?: boolean }): Promise<void> {
  return apiFetch<void>(`/principal/users/teachers/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function principalResetPassword(id: string, newPassword?: string): Promise<{ temporaryPassword: string }> {
  return apiFetch(`/principal/users/${id}/reset-password`, {
    method: "POST",
    body: JSON.stringify(newPassword ? { newPassword } : {}),
  });
}

export function principalDeleteUser(id: string): Promise<void> {
  return apiFetch<void>(`/principal/users/${id}`, { method: "DELETE" });
}

// ── Classes ───────────────────────────────────────────────────────────────────

export interface PrincipalClass {
  id: string;
  name: string;
  gradeYear: number;
  studentCount: number;
  subjectCount: number;
}

export function getPrincipalClasses(): Promise<PrincipalClass[]> {
  return apiFetch<PrincipalClass[]>("/principal/classes");
}

export interface PrincipalClassDetail {
  id: string;
  name: string;
  gradeYear: number;
  students: {
    id: string; name: string; nis: string; email: string | null;
    isActive: boolean; level: number; xp: number;
  }[];
  classSubjects: {
    id: string;
    subject: { id: string; name: string; shortName: string; color: string; iconKey: string };
    teacher: { userId: string; name: string; title: string | null };
    assignmentCount: number;
    quizCount: number;
    examCount: number;
  }[];
}

export function getPrincipalClassDetail(id: string): Promise<PrincipalClassDetail> {
  return apiFetch<PrincipalClassDetail>(`/principal/classes/${id}`);
}

// ── Final Grades (read-only) ──────────────────────────────────────────────────

export interface PrincipalFinalGradeEntry {
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

export interface PrincipalFinalGrades {
  classSubjectId: string;
  subject: { id: string; name: string; shortName: string };
  teacher: { userId: string; name: string };
  academicYearLabel: string;
  entries: PrincipalFinalGradeEntry[];
}

export function getPrincipalFinalGrades(
  classSubjectId: string,
  academicYearId: string
): Promise<PrincipalFinalGrades> {
  return apiFetch<PrincipalFinalGrades>(
    `/principal/class-subjects/${classSubjectId}/final-grades?academicYearId=${academicYearId}`
  );
}

// ── Class Report ──────────────────────────────────────────────────────────────

export interface PrincipalClassReport {
  classId: string;
  className: string;
  gradeYear: number;
  academicYearLabel: string;
  subjects: {
    classSubjectId: string;
    subject: { id: string; name: string; shortName: string };
    teacher: { userId: string; name: string };
    students: {
      studentId: string; name: string; nis: string;
      finalGrade: number | null;
      refAssignment: number | null; refQuiz: number | null;
      refExam: number | null; refAttendance: number | null;
      attendance: { total: number; present: number; percentage: number };
    }[];
  }[];
}

export function getPrincipalClassReport(
  classId: string,
  academicYearId: string
): Promise<PrincipalClassReport> {
  return apiFetch<PrincipalClassReport>(
    `/principal/classes/${classId}/report?academicYearId=${academicYearId}`
  );
}

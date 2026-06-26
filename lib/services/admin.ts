import { apiFetch } from "@/lib/api";

// ── Admin profile ─────────────────────────────────────────────────────────────

export interface AdminMe {
  id: string;
  name: string;
  scope: "SCHOOL" | "SUPER";
  email: string;
  school: { id: string; name: string; code: string };
}

export function getAdminMe(): Promise<AdminMe> {
  return apiFetch<AdminMe>("/admin/me");
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
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

export function getAdminUsers(params?: { role?: "STUDENT" | "TEACHER"; classId?: string }): Promise<AdminUser[]> {
  const qs = new URLSearchParams();
  if (params?.role) qs.set("role", params.role);
  if (params?.classId) qs.set("classId", params.classId);
  const q = qs.toString();
  return apiFetch<AdminUser[]>(`/admin/users${q ? `?${q}` : ""}`);
}

export interface AdminUserDetail {
  id: string;
  role: "STUDENT" | "TEACHER";
  email: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  student: {
    name: string;
    nis: string;
    classId: string;
    class: string;
    level: number;
    xp: number;
  } | null;
  teacher: {
    name: string;
    nip: string | null;
    title: string | null;
  } | null;
}

export function getAdminUser(id: string): Promise<AdminUserDetail> {
  return apiFetch<AdminUserDetail>(`/admin/users/${id}`);
}

export interface CreateStudentPayload {
  name: string;
  nis: string;
  classId: string;
  email?: string;
  password?: string;
}

export interface CreateStudentResult {
  id: string;
  nis: string;
  name: string;
  temporaryPassword: string;
}

export function createStudent(payload: CreateStudentPayload): Promise<CreateStudentResult> {
  const body: Record<string, string> = { name: payload.name, nis: payload.nis, classId: payload.classId };
  if (payload.email) body.email = payload.email;
  if (payload.password) body.password = payload.password;
  return apiFetch<CreateStudentResult>("/admin/users/students", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export interface CreateTeacherPayload {
  name: string;
  email: string;
  nip?: string;
  title?: string;
  password?: string;
}

export interface CreateTeacherResult {
  id: string;
  email: string;
  name: string;
  temporaryPassword: string;
}

export function createTeacher(payload: CreateTeacherPayload): Promise<CreateTeacherResult> {
  const body: Record<string, string> = { name: payload.name, email: payload.email };
  if (payload.nip) body.nip = payload.nip;
  if (payload.title) body.title = payload.title;
  if (payload.password) body.password = payload.password;
  return apiFetch<CreateTeacherResult>("/admin/users/teachers", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateStudent(id: string, payload: { name?: string; classId?: string; isActive?: boolean }): Promise<void> {
  return apiFetch<void>(`/admin/users/students/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateTeacher(id: string, payload: { name?: string; nip?: string; title?: string; email?: string; isActive?: boolean }): Promise<void> {
  return apiFetch<void>(`/admin/users/teachers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function resetPassword(id: string, newPassword?: string): Promise<{ temporaryPassword: string }> {
  return apiFetch<{ temporaryPassword: string }>(`/admin/users/${id}/reset-password`, {
    method: "POST",
    body: JSON.stringify(newPassword ? { newPassword } : {}),
  });
}

export function deleteUser(id: string): Promise<void> {
  return apiFetch<void>(`/admin/users/${id}`, { method: "DELETE" });
}

// ── Classes ───────────────────────────────────────────────────────────────────

export interface AdminClass {
  id: string;
  name: string;
  gradeYear: number;
  studentCount: number;
  subjectCount: number;
}

export function getAdminClasses(params?: { academicYearId?: string }): Promise<AdminClass[]> {
  const qs = params?.academicYearId ? `?academicYearId=${params.academicYearId}` : "";
  return apiFetch<AdminClass[]>(`/admin/classes${qs}`);
}

export function createClass(payload: { name: string; gradeYear: number; academicYearId: string }): Promise<{ id: string; name: string; gradeYear: number }> {
  return apiFetch<{ id: string; name: string; gradeYear: number }>("/admin/classes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateClass(id: string, payload: { name?: string; gradeYear?: number }): Promise<void> {
  return apiFetch<void>(`/admin/classes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteClass(id: string): Promise<void> {
  return apiFetch<void>(`/admin/classes/${id}`, { method: "DELETE" });
}

// ── Subjects (Mapel) ──────────────────────────────────────────────────────────

export type AdminSubjectColor = "BLUE" | "TEAL" | "YELLOW" | "MINT" | "RED" | "PURPLE";

export interface AdminSubject {
  id: string;
  name: string;
  shortName: string;
  color: string;
  iconKey: string;
  classCount: number;
}

export function getAdminSubjects(): Promise<AdminSubject[]> {
  return apiFetch<AdminSubject[]>("/admin/subjects");
}

export function createSubject(payload: { name: string; shortName: string; color: AdminSubjectColor; iconKey: string }): Promise<{ id: string; name: string }> {
  return apiFetch<{ id: string; name: string }>("/admin/subjects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSubject(id: string, payload: { name?: string; shortName?: string; color?: AdminSubjectColor; iconKey?: string }): Promise<void> {
  return apiFetch<void>(`/admin/subjects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteSubject(id: string): Promise<void> {
  return apiFetch<void>(`/admin/subjects/${id}`, { method: "DELETE" });
}

// ── Class-Subjects (penugasan guru) ───────────────────────────────────────────

export interface AdminClassSubject {
  id: string;
  class: { id: string; name: string };
  subject: { id: string; name: string; color: string };
  teacher: { id: string; name: string };
  assignmentCount: number;
  quizCount: number;
}

export function getAdminClassSubjects(params?: { classId?: string }): Promise<AdminClassSubject[]> {
  const qs = params?.classId ? `?classId=${params.classId}` : "";
  return apiFetch<AdminClassSubject[]>(`/admin/class-subjects${qs}`);
}

export function createClassSubject(payload: { classId: string; subjectId: string; teacherId: string }): Promise<{ id: string }> {
  return apiFetch<{ id: string }>("/admin/class-subjects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateClassSubject(id: string, payload: { teacherId: string }): Promise<void> {
  return apiFetch<void>(`/admin/class-subjects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteClassSubject(id: string): Promise<void> {
  return apiFetch<void>(`/admin/class-subjects/${id}`, { method: "DELETE" });
}

// ── Schedule (Jadwal) ─────────────────────────────────────────────────────────

export interface ScheduleSlot {
  id: string;
  class: { id: string; name: string };
  subject: { id: string; name: string; color: string };
  dayOfWeek: number;
  timeStart: string;
  timeEnd: string;
  room: string;
}

export function getAdminSchedule(classId?: string): Promise<ScheduleSlot[]> {
  const qs = classId ? `?classId=${classId}` : "";
  return apiFetch<ScheduleSlot[]>(`/admin/schedule${qs}`);
}

export function createScheduleSlot(payload: {
  classId: string;
  subjectId: string;
  dayOfWeek: number;
  timeStart: string;
  timeEnd: string;
  room?: string;
}): Promise<{ id: string }> {
  return apiFetch<{ id: string }>("/admin/schedule", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateScheduleSlot(id: string, payload: {
  subjectId?: string;
  dayOfWeek?: number;
  timeStart?: string;
  timeEnd?: string;
  room?: string;
}): Promise<void> {
  return apiFetch<void>(`/admin/schedule/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteScheduleSlot(id: string): Promise<void> {
  return apiFetch<void>(`/admin/schedule/${id}`, { method: "DELETE" });
}

// ── Class Detail ──────────────────────────────────────────────────────────────

export interface AdminClassDetail {
  id: string;
  name: string;
  gradeYear: number;
  students: {
    id: string;
    name: string;
    nis: string;
    email: string | null;
    isActive: boolean;
    level: number;
    xp: number;
  }[];
  classSubjects: {
    id: string;
    subject: { id: string; name: string; shortName: string; color: string; iconKey: string };
    teacher: { userId: string; name: string; title: string | null };
    assignmentCount: number;
    quizCount: number;
  }[];
}

export function getAdminClassDetail(id: string): Promise<AdminClassDetail> {
  return apiFetch<AdminClassDetail>(`/admin/classes/${id}`);
}

// ── Admin Content Management (tugas & quiz per class-subject) ─────────────────

export interface AdminAssignmentItem {
  id: string;
  title: string;
  type: "ONLINE" | "UPLOAD_FILE" | "ESSAY";
  dueAt: string;
  maxScore: number;
  submissionCount: number;
  createdAt: string;
}

export function getAdminClassSubjectAssignments(classSubjectId: string): Promise<AdminAssignmentItem[]> {
  return apiFetch<AdminAssignmentItem[]>(`/admin/class-subjects/${classSubjectId}/assignments`);
}

export function deleteAdminAssignment(id: string): Promise<void> {
  return apiFetch<void>(`/admin/assignments/${id}`, { method: "DELETE" });
}

export interface AdminQuizItem {
  id: string;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
  maxAttempts: number;
  sessionCount: number;
  createdAt: string;
}

export function getAdminClassSubjectQuizzes(classSubjectId: string): Promise<AdminQuizItem[]> {
  return apiFetch<AdminQuizItem[]>(`/admin/class-subjects/${classSubjectId}/quizzes`);
}

export function deleteAdminQuiz(id: string): Promise<void> {
  return apiFetch<void>(`/admin/quizzes/${id}`, { method: "DELETE" });
}

// ── Academic Years ─────────────────────────────────────────────────────────────

export interface AcademicYear {
  id: string;
  label: string;
  isActive: boolean;
}

export function getAcademicYears(): Promise<AcademicYear[]> {
  return apiFetch<AcademicYear[]>("/admin/academic-years");
}

export function createAcademicYear(label: string): Promise<AcademicYear> {
  return apiFetch<AcademicYear>("/admin/academic-years", {
    method: "POST",
    body: JSON.stringify({ label }),
  });
}

export function activateAcademicYear(id: string): Promise<void> {
  return apiFetch<void>(`/admin/academic-years/${id}/activate`, { method: "PATCH" });
}

export function deleteAcademicYear(id: string): Promise<void> {
  return apiFetch<void>(`/admin/academic-years/${id}`, { method: "DELETE" });
}

// ── Principal ─────────────────────────────────────────────────────────────────

export interface CreatePrincipalPayload {
  name: string;
  email: string;
  password?: string;
}

export interface CreatePrincipalResult {
  id: string;
  name: string;
  email: string;
  role: "PRINCIPAL";
  temporaryPassword?: string;
}

export function createPrincipal(payload: CreatePrincipalPayload): Promise<CreatePrincipalResult> {
  const body: Record<string, string> = { name: payload.name, email: payload.email };
  if (payload.password) body.password = payload.password;
  return apiFetch<CreatePrincipalResult>("/admin/users/principals", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

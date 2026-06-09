import { apiFetch, setAccessToken, clearAccessToken } from "@/lib/api";

export interface StudentProfile {
  name: string;
  nis: string;
  class: string;
  school: string;
  level: number;
  xp: number;
  xpMax: number;
  avatar: string | null;
}

export interface TeacherProfile {
  name: string;
  nip: string;
  title: string;
  school: string;
  avatar: string | null;
}

export interface AdminProfile {
  name: string;
  scope: string;
  school: string;
}

export interface PrincipalProfile {
  name: string;
  school: string;
}

export interface AuthUser {
  id: string;
  role: "STUDENT" | "TEACHER" | "ADMIN" | "PRINCIPAL";
  mustChangePassword: boolean;
  profile: StudentProfile | TeacherProfile | AdminProfile | PrincipalProfile;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export async function loginStudent(nis: string, password: string): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>(
    "/auth/student/login",
    { method: "POST", body: JSON.stringify({ nis, password }) },
    { withAuth: false },
  );
  setAccessToken(data.accessToken);
  return data;
}

export async function loginStaff(email: string, password: string): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>(
    "/auth/staff/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    { withAuth: false },
  );
  setAccessToken(data.accessToken);
  return data;
}

export async function getMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/auth/me");
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/auth/logout", { method: "POST" }).catch(() => {});
  clearAccessToken();
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiFetch<void>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  clearAccessToken();
}

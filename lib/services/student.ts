import { apiFetch } from "@/lib/api";

export interface StudentProfile {
  id: string;
  name: string;
  nis: string;
  class: {
    id: string;
    name: string;
    gradeYear: number;
  };
  school: {
    id: string;
    name: string;
    code: string;
  };
  level: number;
  xp: number;
  xpMax: number;
  avatar: string | null;
}

export interface StudentStats {
  attendance: number;
  avgScore: number;
  completedAssignments: {
    done: number;
    total: number;
    percent: number;
  };
  weeklyDelta: {
    avgScore: string;
    completed: string;
  };
}

export interface Badge {
  id: string;
  label: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
}

export function getStudentProfile(): Promise<StudentProfile> {
  return apiFetch<StudentProfile>("/students/me/profile");
}

export function getStudentStats(): Promise<StudentStats> {
  return apiFetch<StudentStats>("/students/me/stats");
}

export function getStudentBadges(): Promise<Badge[]> {
  return apiFetch<Badge[]>("/students/me/badges");
}

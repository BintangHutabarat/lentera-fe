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

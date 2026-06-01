import { apiFetch } from "@/lib/api";
import type { SubjectColor } from "./subjects";

export interface QuizListItem {
  id: string;
  title: string;
  subject: { id: string; name: string; color: SubjectColor };
  chapter: string;
  totalQuestions: number;
  durationMinutes: number;
  completed: boolean;
  lastScore: number | null;
  lastStars: number | null;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  order: number;
  text: string;
  options: QuizOption[];
}

export interface QuizSession {
  sessionId: string;
  expiresAt: string;
  durationSeconds: number;
  questions: QuizQuestion[];
  existingAnswers: Record<string, string>;
}

export interface QuizReviewItem {
  questionId: string;
  text: string;
  options: QuizOption[];
  myAnswer: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizResult {
  sessionId: string;
  score: number;
  correct: number;
  incorrect: number;
  skipped: number;
  total: number;
  stars: number;
  timeUsedSeconds: number;
  xpEarned: number;
  review: QuizReviewItem[];
}

export function getQuizzes(): Promise<QuizListItem[]> {
  return apiFetch<QuizListItem[]>("/quizzes");
}

export function startQuiz(quizId: string): Promise<QuizSession> {
  return apiFetch<QuizSession>(`/quizzes/${quizId}/start`, { method: "POST" });
}

export function saveAnswer(sessionId: string, questionId: string, optionId: string): Promise<void> {
  return apiFetch<void>(`/quizzes/sessions/${sessionId}/answer`, {
    method: "PATCH",
    body: JSON.stringify({ questionId, optionId }),
  });
}

export function submitQuiz(
  sessionId: string,
  answers: Record<string, string>,
): Promise<QuizResult> {
  return apiFetch<QuizResult>(`/quizzes/sessions/${sessionId}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export function getQuizResult(sessionId: string): Promise<QuizResult> {
  return apiFetch<QuizResult>(`/quizzes/sessions/${sessionId}`);
}
